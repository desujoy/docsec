# DocSec

A secure document upload and verification system using blockchain and zero-knowledge proofs.

---

## ✅ Objectives Met

This project fulfills all specified objectives and technical expectations:

- 🔐 **Secure File Upload Mechanism**: Files are hashed (SHA-256) and stored immutably on-chain.
- 📜 **Blockchain-based Integrity**: Uses Ethereum-compatible smart contracts to record immutable logs of uploads and changes.
- ✅ **File Authenticity Verification**: Anyone can verify file integrity using the smart contract log.
- 🔒 **Access Control**: Role-based access via smart contracts.
- ✍️ **Digital Signatures**: Implemented for preventing unauthorized file registration.
- ⚙️ **Smart Contracts & Automation**: Written in Solidity and deployed via Hardhat.
- 🔍 **Tamper Detection**: ZK-proof fails if file content is modified.
- 🔄 **zkSNARK + Groth16**: Zero-knowledge proof system ensures off-chain hash knowledge without leaking the file.
- 🧪 **Ethereum-Compatible**: Works on testnets or local blockchain.
- 🌐 **UI/UX Interface**: React-based frontend to interact with file upload, verify, and audit features.

---

## 📁 Directory Structure

docsec/ ├── backend/ │   ├── main.py │   └── requirements.txt ├── frontend/ │   ├── README.md │   └── ... ├── contracts/ │   ├── FileRegistry.sol │   ├── Verifier.sol │   └── ... └── circuits/ ├── filehash.circom ├── input.json └── ...

---

## 🧪 How to Run Locally

### 1. Clone the Repo

```bash
https://github.com/desujoy/docsec.git
cd docsec

2. Backend Setup (Python + FastAPI)

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3. Frontend Setup (React)

cd frontend
npm install
npm run dev

4. Smart Contract Deployment

cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network-name>

5. ZK Setup

cd circuits
# Compile the circom file and generate the proving/verifying keys


---

🎯 Features

🔐 File upload with cryptographic hash (SHA-256)

⚖️ On-chain smart contracts for integrity and roles

🧾 ZK proof system using Groth16 with Circom + SnarkJS

🌍 React-based frontend for document handling and audit

🧠 Smart contract audit trail with user-level access



---

📸 UI Preview

📁 /upload: Upload document and generate ZK proof

🔍 /verify: Select file and validate integrity

📜 /audit: View all uploaded file logs from the smart contract



---

🛠️ Technologies Used

Solidity – Smart contracts

Hardhat – Local blockchain dev environment

FastAPI – Backend API

React.js – Frontend UI

Circom + SnarkJS – ZK proof generation and verification

Ethereum (or compatible) – Blockchain layer


---
