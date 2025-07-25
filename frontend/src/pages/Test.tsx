// pages/RegistryPage.tsx

import { useState } from 'react';
import { useFileRegistry } from '../hooks/useFileRegistry';
import { MainLayout } from '../components/layout/MainLayout';
import FileProver, { Proof } from '../components/FileProver';
import { toast } from 'react-hot-toast'; // Using a toast library for better feedback

// Define a type for the proof data we'll store in state
type ProofResult = {
    proof: {
        pA: [bigint, bigint];
        pB: [[bigint, bigint], [bigint, bigint]];
        pC: [bigint, bigint];
    };
    publicSignals: [bigint];
    fileName: string;
};

// Define a type for a single file record returned from the contract
type FileRecord = {
    uploader: string;
    timestamp: bigint;
    fileName: string;
};

export function Test() {
    const {
        owner,
        isUploader,
        allFiles,
        getFileRecordOnClick,
        registerFile,
        addUploader,
        removeUploader,
        refetchAllFiles,
        findFileByHash
    } = useFileRegistry();

    // --- STATE MANAGEMENT ---
    const [isLoading, setIsLoading] = useState(false);
    const [uploaderAddress, setUploaderAddress] = useState('');
    const [proofResult, setProofResult] = useState<ProofResult | null>(null);

    // --- EVENT HANDLERS ---

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
        toast.success("Proof generated successfully!");
    };

    const executeTransaction = async (txFunction: Promise<any>, successMessage: string) => {
        setIsLoading(true);
        try {
            await txFunction;
            toast.success(successMessage);
        } catch (error: any) {
            console.error(error);
            toast.error(error.shortMessage || "Transaction failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUploader = () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(uploaderAddress)) {
            return toast.error("Invalid uploader address");
        }
        executeTransaction(addUploader(uploaderAddress as `0x${string}`), "Uploader added!");
    };

    const handleRemoveUploader = () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(uploaderAddress)) {
            return toast.error("Invalid uploader address");
        }
        executeTransaction(removeUploader(uploaderAddress as `0x${string}`), "Uploader removed!");
    };
    
    const handleRegisterFile = () => {
        if (!proofResult) {
            return toast.error("Please generate a proof first.");
        }
        executeTransaction(
            registerFile({ ...proofResult.proof, publicSignals: proofResult.publicSignals, fileName: proofResult.fileName }),
            "File registered successfully!"
        );
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">File Registry Dashboard</h1>

                {/* --- STATUS & ADMIN ACTIONS --- */}
                <div className="p-4 border rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold">Contract Status & Admin</h2>
                    <p><strong>Registry Owner:</strong> {owner || 'Loading...'}</p>
                    <p><strong>Your Uploader Status:</strong> {isUploader ? 'Authorized' : 'Not Authorized'}</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="0x... uploader address"
                            className="input input-bordered w-full max-w-xs"
                            value={uploaderAddress}
                            onChange={(e) => setUploaderAddress(e.target.value)}
                        />
                        <button className="btn btn-secondary" onClick={handleAddUploader} disabled={isLoading}>Add</button>
                        <button className="btn btn-error" onClick={handleRemoveUploader} disabled={isLoading}>Remove</button>
                    </div>
                </div>
                
                {/* --- FILE PROVING & REGISTRATION --- */}
                <div className="p-4 border rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold">Prove & Register a File</h2>
                    <FileProver onProofGenerated={handleProofGenerated} />
                    {proofResult && (
                        <div className="p-3 bg-base-200 rounded-md">
                            <p className="font-mono text-sm break-all"><strong>File Hash (Public Signal):</strong> 0x{proofResult.publicSignals[0].toString(16)}</p>
                            <p><strong>Filename:</strong> {proofResult.fileName}</p>
                            <button className="btn btn-info mt-2" onClick={async () => console.log(await findFileByHash(`0x${proofResult.publicSignals[0].toString(16)}`))}>Prove Existence</button>
                            <button className="btn btn-primary mt-4" onClick={handleRegisterFile} disabled={!isUploader || isLoading}>
                                {isLoading ? "Registering..." : "Register File with Proof"}
                            </button>
                            {!isUploader && <p className="text-red-500 text-sm mt-2">You must be an authorized uploader to register a file.</p>}
                        </div>
                    )}
                </div>

                {/* --- ALL REGISTERED FILES --- */}
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">All Registered Files</h2>
                        <button className="btn btn-ghost" onClick={() => refetchAllFiles()}>Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>File Hash</th>
                                    <th>Filename</th>
                                    <th>Uploader</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allFiles && allFiles[0].length > 0 ? (
                                    allFiles[0].map((hash, index) => {
                                        const record = allFiles[1][index] as FileRecord;
                                        return (
                                            <tr key={hash}>
                                                <td className="font-mono text-xs">{hash}</td>
                                                <td>{record.fileName}<button className="btn btn-link" onClick={async () => console.log(await getFileRecordOnClick(hash))}>View</button></td>
                                                <td className="font-mono text-xs">{record.uploader}</td>
                                                <td>{new Date(Number(record.timestamp) * 1000).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={4} className="text-center">No files registered yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}