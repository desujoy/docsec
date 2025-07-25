import React, { useState } from "react";
// @ts-ignore - snarkjs doesn't have the best TS support, so we ignore the warning
import { groth16 } from "snarkjs";

// --- Type Definitions ---
// The shape of the proof object from snarkjs
export interface Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: string;
  curve: string;
}

// Define the props our component expects from its parent (RegistryPage)
type FileProverProps = {
  // A single callback function to notify the parent when the proof is complete
  onProofGenerated: (
    proof: Proof,
    publicSignals: [bigint],
    fileName: string
  ) => void;
  // Optional callback for error handling
  onError?: (error: string) => void;
};

// --- React Component ---

const FileProver: React.FC<FileProverProps> = ({
  onProofGenerated,
  onError,
}) => {
  // --- Internal State ---
  // The component manages its own state during the proving process
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Select a file to begin.");

  // --- Helper Functions ---

  /**
   * Converts an ArrayBuffer to a hexadecimal string.
   */
  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  /**
   * Splits a 256-bit hex string into two 128-bit BigInt strings for the Circom circuit.
   */
  const splitSha256To128BitChunks = (hexString: string): [string, string] => {
    const fullHashInt = BigInt("0x" + hexString);
    const bits128 = 2n ** 128n;
    const chunk1 = fullHashInt / bits128;
    const chunk2 = fullHashInt % bits128;
    return [chunk1.toString(), chunk2.toString()];
  };

  // --- Event Handlers ---

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatusMessage(`File selected: ${file.name}`);
    }
  };

  const generateProof = async () => {
    if (!selectedFile) {
      onError?.("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Reading file and generating hash...");

    try {
      // 1. Hash the file
      const fileBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
      const sha256HexString = bufferToHex(hashBuffer);

      // 2. Format inputs for the circuit
      const circuitInputs = {
        sha256_hash_inputs: splitSha256To128BitChunks(sha256HexString),
      };
      setStatusMessage("Generating ZK proof... this may take a moment.");

      // 3. Generate the proof using snarkjs
      // Ensure these paths are correct in your /public folder
      const wasmPath = "/FileIntegrityProof.wasm";
      const zkeyPath = "/circuit_final.zkey";

      const { proof, publicSignals } = await groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
      );

      setStatusMessage("Proof generated successfully!");

      // 4. THIS IS THE KEY CHANGE:
      // Call the single callback prop with all the necessary data.
      onProofGenerated(
        proof,
        [BigInt(publicSignals[0])], // Convert signal to bigint for the parent
        selectedFile.name
      );
    } catch (error) {
      console.error("Error during proof generation:", error);
      setStatusMessage("Error generating proof. See console for details.");
      onError?.("Failed to generate proof.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Choose a file to prove</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>

      <button
        className="btn btn-accent w-full"
        onClick={generateProof}
        disabled={!selectedFile || isLoading}
      >
        {isLoading ? "Processing..." : "Generate Proof"}
      </button>

      <p className="text-center text-sm">{statusMessage}</p>
    </div>
  );
};

export default FileProver;
