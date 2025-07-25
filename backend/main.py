import hashlib
import json
import subprocess
import os
import tempfile
import shutil
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# --- FastAPI App Initialization ---
app = FastAPI(title="ZK File Integrity Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to your frontend's domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
# Correctly locate the 'zk-setup' directory relative to this script's location
# Assumes 'backend' and 'zk-setup' are sibling directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ZK_SETUP_DIR = os.path.join(BASE_DIR, "..", "zk-setup")
WASM_FILE = os.path.join(ZK_SETUP_DIR, "build", "FileIntegrityProof_js", "FileIntegrityProof.wasm")
ZKEY_FILE = os.path.join(ZK_SETUP_DIR, "circuit_final.zkey")

# --- Helper Function ---
def generate_inputs(contents: bytes, work_dir: str) -> str:
    """Calculates hash and prepares the input.json file for the witness."""
    sha256_hex = hashlib.sha256(contents).hexdigest()
    sha256_int = int(sha256_hex, 16)

    # 2**128
    chunk_size = 340282366920938463463374607431768211456
    sha_chunk_1 = sha256_int // chunk_size
    sha_chunk_2 = sha256_int % chunk_size

    inputs = {"sha256_hash_inputs": [str(sha_chunk_1), str(sha_chunk_2)]}
    
    input_json_path = os.path.join(work_dir, "input.json")
    with open(input_json_path, "w") as f:
        json.dump(inputs, f)
        
    return input_json_path

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "ZK File Integrity Verifier Backend is running!"}

@app.post("/get-verification-hash")
async def get_verification_hash(file: UploadFile):
    """
    Endpoint for Verifiers.
    Accepts a file and returns only its unique Poseidon hash, which is the public
    identifier used on the blockchain. This is fast and efficient.
    """
    contents = await file.read()
    
    # Use a secure, temporary directory that cleans up after itself
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            input_json_path = generate_inputs(contents, temp_dir)
            witness_path = os.path.join(temp_dir, "witness.wtns")

            # 1. Generate Witness - this is all we need to get the public signals
            subprocess.run([
                "snarkjs", "wasm", "calculatewitness",
                f"--wasm={WASM_FILE}", f"--input={input_json_path}", f"--witness={witness_path}"
            ], check=True, capture_output=True, text=True)

            # 2. The witness file contains the public outputs. We can read it directly.
            # This is an advanced trick to avoid creating a public.json file.
            witness_data = subprocess.run(
                ["snarkjs", "wtns", "export", "json", witness_path],
                check=True, capture_output=True, text=True
            )
            public_signals = json.loads(witness_data.stdout)

            # The first public signal is our Poseidon hash.
            return {"poseidonHash": public_signals[0]}

        except subprocess.CalledProcessError as e:
            print(f"Error calling snarkjs: {e.stderr}")
            raise HTTPException(status_code=500, detail=f"Error in ZK hash generation: {e.stderr}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")


@app.post("/generate-proof-and-calldata")
async def generate_proof_and_calldata(file: UploadFile):
    """
    Endpoint for Uploaders.
    Accepts a file, generates the ZK proof, and formats it as ready-to-use
    calldata for the smart contract transaction.
    """
    contents = await file.read()

    # Use a secure, temporary directory for each request to prevent conflicts.
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # 1. Prepare inputs
            input_json_path = generate_inputs(contents, temp_dir)
            witness_path = os.path.join(temp_dir, "witness.wtns")
            proof_path = os.path.join(temp_dir, "proof.json")
            public_json_path = os.path.join(temp_dir, "public.json")
            
            # 2. Generate Witness
            subprocess.run([
                "snarkjs", "wasm", "calculatewitness",
                f"--wasm={WASM_FILE}", f"--input={input_json_path}", f"--witness={witness_path}"
            ], check=True, capture_output=True, text=True)

            # 3. Generate Proof
            subprocess.run([
                "snarkjs", "groth16", "prove",
                ZKEY_FILE, witness_path, proof_path, public_json_path
            ], check=True, capture_output=True, text=True)
            
            # 4. **NEW & IMPORTANT**: Generate Smart Contract Calldata
            # This formats the proof and public signals into the exact format
            # our FileRegistry.sol `registerFile` function expects.
            calldata_result = subprocess.run([
                "snarkjs", "zkey", "export", "soliditycalldata",
                public_json_path, proof_path
            ], check=True, capture_output=True, text=True)

            # The output is a JSON string, let's parse it.
            # It will look like: '["0x..."], [["0x..."],...], ...]'
            # We need to convert this string into a Python list of strings.
            params = json.loads(calldata_result.stdout)

            # 5. Return the structured, ready-to-use data for ethers.js
            return {
                "pA": json.loads(f'[{params[0]}]'),
                "pB": json.loads(f'[{params[1]}]'),
                "pC": json.loads(f'[{params[2]}]'),
                "publicSignals": json.loads(f'[{params[3]}]'),
                "fileName": file.filename,
            }

        except subprocess.CalledProcessError as e:
            print(f"Error calling snarkjs: {e.stderr}")
            raise HTTPException(status_code=500, detail=f"Error in ZK proof generation: {e.stderr}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")