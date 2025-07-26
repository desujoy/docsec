# DocSec: Decentralized Document Security with ZK Proofs

DocSec is a secure and decentralized document verification system that leverages the power of blockchain technology and zero-knowledge proofs to ensure the integrity and confidentiality of your files.

---

## 🎯 Features

*   🔐 **File Upload with Cryptographic Hash (SHA-256):** Each uploaded file is assigned a unique and tamper-proof cryptographic hash.
*   ⚖️ **On-chain Smart Contracts for Integrity and Roles:** Smart contracts on the blockchain manage file integrity and define user access levels.
*   🧾 **ZK Proof System using Groth16 with Circom + SnarkJS:** Zero-knowledge proofs are used to verify document properties without revealing the underlying data.
*   🌍 **React-based Frontend for Document Handling and Audit:** An intuitive user interface for uploading, verifying, and auditing documents.
*   🧠 **Smart Contract Audit Trail with User-Level Access:** A transparent and immutable log of all document activities is maintained on the smart contract.

---

## 🏗️ Project Structure

The project is organized into four main directories: `backend`, `frontend`, `contracts`, and `circuits`.

```text
docsec/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── contracts/
│   ├── contracts/
│   │   └── DocSec.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── circuits/
│   └── circuit.circom
└── README.md
```
## 📸 UI Preview

*   `/upload`: Upload a document and generate a corresponding ZK proof.
*   `/verify`: Select a file to validate its integrity using the stored hash on the blockchain.
*   `/audit`: View a comprehensive log of all uploaded file information directly from the smart contract.

---

## 🛠️ Technologies Used

*   **Solidity:** For writing the smart contracts.
*   **Hardhat:** As the local blockchain development environment.
*   **FastAPI:** To power the backend API.
*   **React.js:** For building the frontend user interface.
*   **Circom + SnarkJS:** For generating and verifying zero-knowledge proofs.
*   **Ethereum (or compatible):** As the underlying blockchain layer.

---


## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js, Python, and a package manager like `npm` or `yarn` installed on your system.

### Installation and Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/desujoy/docsec.git
    cd docsec
    ```

2.  **Backend Setup (Python + FastAPI)**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

3.  **Frontend Setup (React)**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Smart Contract Deployment**
    ```bash
    cd contracts
    npm install
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network <network-name>
    ```

5.  **ZK Setup**
    ```bash
    cd circuits
    # Compile the circom file and generate the proving/verifying keys
    # (Add specific commands for your Circom setup here)
    ```
