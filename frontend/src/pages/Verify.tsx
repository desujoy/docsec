import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Notification } from "../components/shared/Notification";
import { useFileRegistry } from "../hooks/useFileRegistry";
import { FileCheck } from "lucide-react";
import FileProver, { Proof } from "@/components/FileProver";

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

export function Verify() {
  const { findFileByHash } = useFileRegistry();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [fileExists, setFileExists] = useState<boolean | null>(null);

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

  const handleExistenceProof = async () => {
    if (!proofResult) {
      return setNotification({
        message: "No proof generated yet.",
        type: "error",
      });
    }
    const fileExists = await findFileByHash(`0x${proofResult.publicSignals[0].toString(16)}`);
    setFileExists(fileExists !== null);
  };


  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Verify File</h1>
          </div>
          <p className="text-muted-foreground">
            Upload a file to verify its integrity and check if it exists in the
            blockchain registry.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="p-4 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Prove & Register a File</h2>
          <FileProver onProofGenerated={handleProofGenerated} />
          {proofResult && (
            <div className="p-3 bg-base-200 rounded-md">
              <p className="font-mono text-sm break-all"><strong>File Hash (Public Signal):</strong> 0x{proofResult.publicSignals[0].toString(16)}</p>
              <p><strong>Filename:</strong> {proofResult.fileName}</p>
              <p><strong>Digital Signal:</strong></p>
              <pre className="whitespace-pre-wrap">{JSON.stringify(proofResult, jsonReplacer, 2)}</pre>
              <button className="btn btn-info mt-2" onClick={handleExistenceProof}>Prove Existence</button>
              {fileExists !== null && (
                <p className={`mt-2 ${fileExists ? 'text-green-500' : 'text-red-500'}`}>
                  File {fileExists ? 'exists' : 'does not exist'} in the registry.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notification */}
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
