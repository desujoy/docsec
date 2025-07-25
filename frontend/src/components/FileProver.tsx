import React, { useState } from 'react';
import * as snarkjs from 'snarkjs';

// --- Type Definitions ---
export interface Proof {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
}

// --- Helper Functions ---

/**
 * Converts an ArrayBuffer to a hexadecimal string.
 * @param buffer The ArrayBuffer to convert.
 * @returns The hexadecimal string representation.
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Splits a 256-bit hex string (from a SHA-256 hash) into two 128-bit BigInt strings.
 * This is required to format the input for the Circom circuit.
 * @param hexString The 256-bit hex string.
 * @returns An array of two 128-bit BigInts as strings.
 */
const splitSha256To128BitChunks = (hexString: string): [string, string] => {
    const fullHashInt = BigInt('0x' + hexString);
    const bits128 = 2n ** 128n;

    // Perform bitwise operations to split the BigInt
    const chunk1 = fullHashInt / bits128; // Upper 128 bits
    const chunk2 = fullHashInt % bits128; // Lower 128 bits

    return [chunk1.toString(), chunk2.toString()];
};


// --- React Component ---

type FileProverProps = {
    setFileProof: (proof: Proof) => void;
    setPubSignal: (signal: string) => void;
    setFilename: (name: string) => void;
};

const FileProver: React.FC<FileProverProps> = ({ setFileProof, setPubSignal, setFilename }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('Select a file to begin.');
    const [proof, setProof] = useState<Proof | null>(null);
    const [publicSignal, setPublicSignal] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setStatus(`File "${file.name}" selected. Ready to generate proof.`);
            setFilename(file.name);
            setProof(null);
            setPublicSignal(null);
        }
    };

    const generateProof = async () => {
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }

        setStatus('1. Reading file...');
        try {
            const fileBuffer = await selectedFile.arrayBuffer();

            setStatus('2. Hashing file with SHA-256...');
            const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
            const sha256HexString = bufferToHex(hashBuffer);

            setStatus('3. Formatting inputs for Circom...');
            const circuitInputs = {
                sha256_hash_inputs: splitSha256To128BitChunks(sha256HexString),
            };

            console.log('Circuit inputs:', circuitInputs);

            setStatus('4. Generating ZK proof... (this may take a moment)');
            const wasmPath = '/FileIntegrityProof.wasm';
            const zkeyPath = '/circuit_final.zkey';

            const { proof: generatedProof, publicSignals } = await snarkjs.groth16.fullProve(
                circuitInputs,
                wasmPath,
                zkeyPath
            );

            setProof(generatedProof);
            setPublicSignal(publicSignals[0]); // The poseidon_hash_output
            setFileProof(generatedProof);
            setPubSignal(publicSignals[0]);
            setStatus('5. Proof generated successfully!');

        } catch (error) {
            console.error('Error during proof generation:', error);
            setStatus(`Error: ${(error as Error).message}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
            <h1>File Integrity ZK Prover</h1>
            <p>
                This tool proves you know a file that corresponds to a specific on-chain Poseidon hash,
                without revealing the file or its SHA-256 hash.
            </p>

            <input type="file" onChange={handleFileChange} style={{ marginBottom: '15px' }} />

            <button onClick={generateProof} disabled={!selectedFile}>
                Generate Proof
            </button>

            <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
                <strong>Status:</strong> {status}
            </div>

            {publicSignal && proof && (
                <div style={{ marginTop: '20px', wordBreak: 'break-all' }}>
                    <h2>Proof Details</h2>
                    <p>
                        <strong>Public Signal (Poseidon Hash):</strong>
                        <br />
                        <code>{publicSignal}</code>
                    </p>
                    <h3>Full Proof Object (for on-chain verification):</h3>
                    <pre style={{ background: '#e0e0e0', padding: '15px', borderRadius: '5px' }}>
                        {JSON.stringify(proof, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default FileProver;