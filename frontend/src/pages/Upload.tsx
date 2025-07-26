import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout"
import { Notification } from "../components/shared/Notification";
import { useFileRegistry } from "../hooks/useFileRegistry";
import { Upload as UploadIcon } from "lucide-react";
import FileProver, { Proof } from "@/components/FileProver";
import { useWatchContractEvent } from "wagmi";
import { fileRegistryAddress } from "@/constants/contracts";
import { fileRegistryAbi } from "@/generated";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/wagmi";

type ProofResult = {
  proof: {
    pA: [bigint, bigint];
    pB: [[bigint, bigint], [bigint, bigint]];
    pC: [bigint, bigint];
  };
  publicSignals: [bigint];
  fileName: string;
};

const jsonReplacer = (_: any, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

export function Upload() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const { registerFile, isUploader } = useFileRegistry();

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'FileRegistered',
    onLogs: () => {
      setNotification({
        message: "File registered successfully!",
        type: "success",
      });
      setProofResult(null);
    },
  });

  const handleProofGenerated = (proof: Proof, publicSignals: [bigint], fileName: string) => {
    setProofResult({
      proof: {
        pA: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
        pB: [
          [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
          [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])],
        ],
        pC: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
      },
      publicSignals,
      fileName,
    });
    setNotification({
      message: "Proof generated successfully!",
      type: "success",
    });
  };

  const executeTransaction = async (
    txFunction: Promise<`0x${string}`>, // The promise now correctly resolves to a hash
    successMessage: string
  ) => {
    setIsLoading(true);
    let hash: `0x${string}` | undefined = undefined;

    try {
      // --- Step 1: Send the transaction and get the hash ---
      // This try/catch only handles user rejection in the wallet or pre-flight errors.
      hash = await txFunction;

      setNotification({
        message: "Transaction sent. Waiting for confirmation...",
        type: "info",
      });

      // --- Step 2: Wait for the transaction to be mined ---
      const receipt = await waitForTransactionReceipt(config, {
        hash: hash,
      });

      // --- Step 3: Check the receipt for success or revert ---
      if (receipt.status === 'success') {
        setNotification({
          message: successMessage,
          type: "success",
        });
      } else {
        // The transaction was mined but reverted
        throw new Error("Transaction failed on-chain. The transaction was reverted.");
      }
    } catch (error: any) {
      console.error(error);
      // Provide more specific error messages
      let errorMessage = "An unknown error occurred.";
      if (error.shortMessage) {
        errorMessage = "FileRegistry: File content already registered";
      } else if (error.message) {
        // Check for common user-rejection messages
        if (error.message.includes("User rejected the request")) {
          errorMessage = "Transaction rejected by user.";
        } else {
          errorMessage = error.message;
        }
      }

      setNotification({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterFile = () => {
    if (!proofResult) {
      return setNotification({
        message: "Please generate a proof first.",
        type: "error",
      });
    }
    executeTransaction(
      registerFile({ ...proofResult.proof, publicSignals: proofResult.publicSignals, fileName: proofResult.fileName }),
      "Registering file with proof..."
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <UploadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Upload File</h1>
          </div>
          <p className="text-muted-foreground">
            Upload your file to generate a cryptographic proof and register it
            on the blockchain.
          </p>
        </div>

        <div className="p-4 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Prove & Register a File</h2>
          <FileProver onProofGenerated={handleProofGenerated} />
          {proofResult && (
            <div className="p-3 bg-base-200 rounded-md">
              <p className="font-mono text-sm break-all"><strong>File Hash (Public Signal):</strong> 0x{proofResult.publicSignals[0].toString(16)}</p>
              <p><strong>Filename:</strong> {proofResult.fileName}</p>
              <p><strong>Digital Signal:</strong></p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(proofResult, jsonReplacer, 2)}</pre>
              <button className="btn btn-primary mt-4" onClick={handleRegisterFile} disabled={!isUploader || isLoading}>
                {isLoading ? "Registering..." : "Register File with Proof"}
              </button>
              {!isUploader && <p className="text-red-500 text-sm mt-2">You must be an authorized uploader to register a file.</p>}
            </div>
          )}
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </div>
    </MainLayout>
  );
}
