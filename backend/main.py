import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to ZK artifacts
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ZK_SETUP_DIR = os.path.join(BASE_DIR, '..', 'zk-setup')
CIRCUIT_WASM = os.path.join(ZK_SETUP_DIR, 'build', 'FileIntegrityProof_js', 'FileIntegrityProof.wasm')
CIRCUIT_FINAL_ZKEY = os.path.join(ZK_SETUP_DIR, 'circuit_final.zkey')

# Determine snarkjs command: global or via npx
SNARKJS_CMD = shutil.which('snarkjs') or 'npx snarkjs'


def bytes_to_int_array(data: bytes):
    """
    Split a 32-byte SHA-256 digest into two 16-byte (128-bit) integers.
    """
    if len(data) != 32:
        raise ValueError("Expected 32-byte SHA256 hash")
    high = int.from_bytes(data[:16], 'big')
    low = int.from_bytes(data[16:], 'big')
    return [high, low]


async def run_snarkjs_proof(file_content: bytes, file_name: str):
    """
    Generates a ZK proof and returns formatted calldata.
    """
    # 1. Compute SHA-256 hash of file
    sha256_hash = hashlib.sha256(file_content).digest()

    # 2. Prepare inputs (raw ints, matching circuit signal)
    inputs = {"sha256_hash_inputs": bytes_to_int_array(sha256_hash)}

    # Create temp workspace
    with tempfile.TemporaryDirectory() as temp_dir:
        input_json_path = os.path.join(temp_dir, 'input.json')
        witness_wtns_path = os.path.join(temp_dir, 'witness.wtns')
        proof_json_path = os.path.join(temp_dir, 'proof.json')
        public_json_path = os.path.join(temp_dir, 'public.json')

        # Write input JSON
        with open(input_json_path, 'w') as f:
            json.dump(inputs, f)

        # 3. Generate witness
        try:
            subprocess.run(
                SNARKJS_CMD.split() + ['wc', CIRCUIT_WASM, input_json_path, witness_wtns_path],
                check=True, capture_output=True, text=True
            )
        except subprocess.CalledProcessError:
            subprocess.run(
                SNARKJS_CMD.split() + ['wtns', 'calculate', CIRCUIT_WASM, input_json_path, witness_wtns_path],
                check=True, capture_output=True, text=True
            )
        except FileNotFoundError:
            raise HTTPException(status_code=500,
                detail="snarkjs command not found. Install globally or ensure 'npx snarkjs' works.")

        # 4. Generate the proof
        try:
            subprocess.run(
                SNARKJS_CMD.split() + ['groth16', 'prove', CIRCUIT_FINAL_ZKEY,
                witness_wtns_path, proof_json_path, public_json_path],
                check=True, capture_output=True, text=True
            )
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500,
                detail=f"Error in ZK proof generation: {e.stderr}")

        # 5. Load proof and public signals
        with open(proof_json_path, 'r') as f:
            proof = json.load(f)
        with open(public_json_path, 'r') as f:
            public_signals = json.load(f)

    # 6. Format calldata for Solidity verifier
    return {
        "pA": proof['pi_a'][:2],
        "pB": [[proof['pi_b'][0][1], proof['pi_b'][0][0]],
               [proof['pi_b'][1][1], proof['pi_b'][1][0]]],
        "pC": proof['pi_c'][:2],
        "publicSignals": public_signals,
        "fileName": file_name
    }

@app.post("/generate-proof-and-calldata")
async def generate_proof_and_calldata_endpoint(file: UploadFile = File(...)):
    file_content = await file.read()
    return await run_snarkjs_proof(file_content, file.filename)

@app.post("/get-verification-hash")
async def get_verification_hash_endpoint(file: UploadFile = File(...)):
    file_content = await file.read()
    try:
        proof_data = await run_snarkjs_proof(file_content, file.filename)
        poseidon_hash = hex(int(proof_data['publicSignals'][0]))
        return {"poseidonHash": poseidon_hash}
    except HTTPException as e:
        raise HTTPException(status_code=500,
            detail=f"Error in ZK hash generation: {e.detail}")

@app.post("/upload-to-ipfs")
async def upload_to_ipfs_endpoint(file: UploadFile = File(...)):
    if not shutil.which("ipfs"):
        raise HTTPException(status_code=500,
            detail="IPFS daemon is not available or 'ipfs' command is not in PATH.")

    file_content = await file.read()
    try:
        # Use binary stdin; disable text mode
        result = subprocess.run(
            ['ipfs', 'add', '-Q'],
            input=file_content,
            check=True,
            capture_output=True
        )
        # Decode bytes output
        ipfs_hash = result.stdout.decode().strip()
        return {"ipfsHash": ipfs_hash, "fileName": file.filename}
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        error_message = getattr(e, 'stderr', None)
        if isinstance(error_message, bytes):
            error_message = error_message.decode(errors='ignore')
        if not error_message:
            error_message = 'ipfs command failed.'
        raise HTTPException(status_code=500,
            detail=f"Error uploading to IPFS: {error_message}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
