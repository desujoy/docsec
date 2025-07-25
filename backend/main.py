import hashlib
import json
import subprocess
import os
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# --- FastAPI App Initialization ---
app = FastAPI()

# Allow all origins for development purposes (CORS)
# In a production environment, you should restrict this to your frontend's URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
# Define the relative path to the zk-setup directory
# This assumes the 'backend' and 'zk-setup' directories are siblings
ZK_SETUP_DIR = os.path.join("..", "zk-setup")
WASM_FILE = os.path.join(ZK_SETUP_DIR, "build", "FileIntegrityProof_js", "FileIntegrityProof.wasm")
ZKEY_FILE = os.path.join(ZK_SETUP_DIR, "circuit_final.zkey")


@app.post("/generate-proof")
async def generate_proof(file: UploadFile):
    """
    Accepts a file, calculates its SHA-256 hash, generates a ZK witness and proof,
    and returns the proof and public signals to the client.
    """
    try:
        # --- 1. File Hashing and Input Preparation ---
        contents = await file.read()
        
        # Calculate SHA-256 hash
        sha256_hex = hashlib.sha256(contents).hexdigest()
        sha256_int = int(sha256_hex, 16)

        # Split the 256-bit hash into two 128-bit chunks for the circuit
        # 2**128 = 340282366920938463463374607431768211456
        chunk_size = 340282366920938463463374607431768211456
        
        sha_chunk_1 = sha256_int // chunk_size
        sha_chunk_2 = sha256_int % chunk_size

        # Prepare the input.json file for the witness calculation
        inputs = {
            "sha256_hash_inputs": [str(sha_chunk_1), str(sha_chunk_2)]
        }
        
        # Create a temporary directory for this request's files
        # This is important for handling concurrent requests
        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)
        input_json_path = os.path.join(temp_dir, "input.json")
        witness_path = os.path.join(temp_dir, "witness.wtns")
        proof_path = os.path.join(temp_dir, "proof.json")
        public_json_path = os.path.join(temp_dir, "public.json")

        with open(input_json_path, "w") as f:
            json.dump(inputs, f)

        # --- 2. Witness and Proof Generation using snarkjs ---
        
        # Generate witness
        print("Generating witness...")
        subprocess.run([
            "snarkjs", "wasm", "calculatewitness",
            f"--wasm={WASM_FILE}",
            f"--input={input_json_path}",
            f"--witness={witness_path}"
        ], check=True, capture_output=True, text=True)

        # Generate proof
        print("Generating proof...")
        subprocess.run([
            "snarkjs", "groth16", "prove",
            ZKEY_FILE,
            witness_path,
            proof_path,
            public_json_path
        ], check=True, capture_output=True, text=True)

        # --- 3. Read and Return Results ---
        print("Reading proof and public signals...")
        with open(proof_path) as f:
            proof_data = json.load(f)
        with open(public_json_path) as f:
            public_signals = json.load(f) # This contains the poseidon_hash_output

        # This is the data you'll send to your frontend to interact with the smart contract
        return {
            "proof": proof_data,
            "publicSignals": public_signals,
            "poseidonHash": public_signals[0], # The public output from the circuit
            "fileName": file.filename,
        }

    except subprocess.CalledProcessError as e:
        print(f"Error calling snarkjs: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"Error in ZK proof generation: {e.stderr}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "ZK File Integrity Verifier Backend is running!"}