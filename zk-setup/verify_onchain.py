import json
from web3 import Web3

# --- 1. CONFIGURE YOUR DETAILS HERE ---

# Get this from Alchemy, Infura, etc. for the network your contract is on.
RPC_URL = "https://sepolia.gateway.tenderly.co" 

# The address of your deployed Groth16Verifier contract.
VERIFIER_ADDRESS = "0x46aCb25aFF07071e4d3CdF76a1095d46179296c4"

# The ABI for your Groth16Verifier contract.
# This is the standard ABI for the verifyProof function.
VERIFIER_ABI = """
[
  {
    "inputs": [
      { "internalType": "uint256[2]", "name": "_pA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "_pB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "_pC", "type": "uint256[2]" },
      { "internalType": "uint256[1]", "name": "_pubSignals", "type": "uint256[1]" }
    ],
    "name": "verifyProof",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
"""

# --- 2. SCRIPT LOGIC (No changes needed below) ---

def load_json_file(filename):
    """Loads a JSON file from the current directory."""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Make sure '{filename}' is in the same directory as this script.")
        exit(1)

def format_proof_args(proof, public_signals):
    """Formats the proof and public signals for the web3.py contract call."""
    
    # Ensure all numbers are converted to integers, as web3.py handles large numbers.
    pA = [int(x) for x in proof['pi_a'][:2]]
    
    # IMPORTANT: The verifier contract expects pB WITHOUT transposition.
    pB = [
        [int(proof['pi_b'][0][0]), int(proof['pi_b'][0][1])],
        [int(proof['pi_b'][1][0]), int(proof['pi_b'][1][1])]
    ]
    
    pC = [int(x) for x in proof['pi_c'][:2]]
    
    pubSignals = [int(x) for x in public_signals]
    
    return pA, pB, pC, pubSignals

def main():
    """Main function to load data and call the verifier contract."""
    print("--- On-chain ZK Proof Verification (Python) ---")

    # Load proof and public signals from local files
    proof_data = load_json_file('proof.json')
    public_signals_data = load_json_file('public.json')
    
    print("✅ Successfully loaded proof.json and public.json")

    # Format the arguments for the smart contract
    pA, pB, pC, pubSignals = format_proof_args(proof_data, public_signals_data)
    
    # Connect to the blockchain
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print(f"❌ Failed to connect to the blockchain via RPC URL: {RPC_URL}")
        return

    print(f"🔗 Connected to blockchain (Chain ID: {w3.eth.chain_id})")

    # Create a contract instance
    verifier_contract = w3.eth.contract(address=VERIFIER_ADDRESS, abi=VERIFIER_ABI)
    
    print(f"📞 Calling verifyProof on contract at {VERIFIER_ADDRESS}...")

    try:
        # Call the view function
        is_valid = verifier_contract.functions.verifyProof(pA, pB, pC, pubSignals).call()
        
        print("\n========================================")
        if is_valid:
            print("✅ RESULT: TRUE")
            print("   The on-chain verification was successful.")
        else:
            print("❌ RESULT: FALSE")
            print("   The on-chain verification failed.")
        print("========================================\n")

    except Exception as e:
        print("\n💥 An error occurred while calling the contract:")
        print(e)
        print("\nPossible reasons:")
        print("- The contract address or ABI is incorrect.")
        print("- The contract is not deployed on the network specified by the RPC URL.")
        print("- The RPC node is down or has issues.")

if __name__ == "__main__":
    main()