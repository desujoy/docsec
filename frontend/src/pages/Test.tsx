import { useState } from 'react';
import { useFileRegistry } from '../hooks/useFileRegistry';
import { MainLayout } from '../components/layout/MainLayout';

export function Test() {
    const {
        owner,
        isUploader,
        getFileRecord,
        registerFile,
        addUploader,
        removeUploader,
        refetchOwner,
        refetchIsUploader
    } = useFileRegistry();
    type FileRecord = {
        uploader: string;
        timestamp: bigint;
        fileName: string;
    } | null;
    const [fileRecord, setFileRecord] = useState<FileRecord>(null);
    const [fileId, setFileId] = useState('');
    const [uploaderAddress, setUploaderAddress] = useState('');
    const [newOwnerAddress, setNewOwnerAddress] = useState('');
    

    // Helper to check if a string is a valid 0x address
    const isValid0x = (str: string) => /^0x[a-fA-F0-9]{40}$/.test(str);
    // Helper to check if a string is a valid 0x fileId (allow any length > 2)
    const isValid0xAny = (str: string) => /^0x[a-fA-F0-9]+$/.test(str);

    // Minimal registerFile form state
    const [registerData, setRegisterData] = useState({
        pA: ['', ''],
        pB: [['', ''], ['', '']],
        pC: ['', ''],
        publicSignals: [''],
        fileName: ''
    });

    // Handlers
    const handleAddUploader = () => {
        if (isValid0x(uploaderAddress)) addUploader(uploaderAddress as `0x${string}`);
        else alert('Invalid uploader address');
    };
    const handleRemoveUploader = () => {
        if (isValid0x(uploaderAddress)) removeUploader(uploaderAddress as `0x${string}`);
        else alert('Invalid uploader address');
    };
    const handleGetFileRecord = async () => {
        if (isValid0xAny(fileId)) {
            const rec = await getFileRecord(fileId as `0x${string}`);
            // rec is likely an object with a 'data' property containing the tuple
            if (rec && rec.data) {
                const [uploader, timestamp, fileName] = rec.data as [string, bigint, string];
                setFileRecord({ uploader, timestamp, fileName });
            } else {
                setFileRecord(null);
            }
        } else {
            alert('Invalid file ID');
        }
    };
    const handleRegisterFile = () => {
        // Minimal validation, assumes all fields are filled
        try {
            registerFile({
                pA: [BigInt(registerData.pA[0]), BigInt(registerData.pA[1])],
                pB: [
                    [BigInt(registerData.pB[0][0]), BigInt(registerData.pB[0][1])],
                    [BigInt(registerData.pB[1][0]), BigInt(registerData.pB[1][1])]
                ],
                pC: [BigInt(registerData.pC[0]), BigInt(registerData.pC[1])],
                publicSignals: [BigInt(registerData.publicSignals[0])],
                fileName: registerData.fileName
            });
        } catch (e) {
            alert('Invalid register file data');
        }
    };

    return (
        <MainLayout>
            <h1>Test Page</h1>
            <p>Owner of the File Registry: {owner ? owner : 'Loading...'}</p>
            <button onClick={() => refetchOwner()}>Refetch Owner</button>
            <p>Is Uploader: {isUploader ? 'Yes' : 'No'}</p>
            <button onClick={() => refetchIsUploader()}>Refetch Uploader Status</button>
            <h2>Admin Actions</h2>
            <div>
                <input
                    type="text"
                    placeholder="Uploader Address"
                    value={uploaderAddress}
                    onChange={e => setUploaderAddress(e.target.value)}
                />
                <button onClick={handleAddUploader}>Add Uploader</button>
                <button onClick={handleRemoveUploader}>Remove Uploader</button>
            </div>
            <h2>File Record</h2>
            <input
                type="text"
                placeholder="Enter File ID"
                value={fileId}
                onChange={e => setFileId(e.target.value)}
            />
            <button onClick={handleGetFileRecord}>Get File Record</button>
            {fileRecord ? (
                <div>
                    <h3>File Record Details:</h3>
                    <ul>
                        <li><strong>Uploader:</strong> {fileRecord.uploader}</li>
                        <li><strong>Timestamp:</strong> {fileRecord.timestamp.toString()}</li>
                        <li><strong>File Name:</strong> {fileRecord.fileName}</li>
                    </ul>
                </div>
            ) : (
                <p>No file record found.</p>
            )}
            <h2>Register File</h2>
            <div>
                <input type="text" placeholder="fileName" value={registerData.fileName} onChange={e => setRegisterData(d => ({ ...d, fileName: e.target.value }))} />
                <input type="text" placeholder="pA[0]" value={registerData.pA[0]} onChange={e => setRegisterData(d => ({ ...d, pA: [e.target.value, d.pA[1]] }))} />
                <input type="text" placeholder="pA[1]" value={registerData.pA[1]} onChange={e => setRegisterData(d => ({ ...d, pA: [d.pA[0], e.target.value] }))} />
                <input type="text" placeholder="pB[0][0]" value={registerData.pB[0][0]} onChange={e => setRegisterData(d => ({ ...d, pB: [[e.target.value, d.pB[0][1]], d.pB[1]] }))} />
                <input type="text" placeholder="pB[0][1]" value={registerData.pB[0][1]} onChange={e => setRegisterData(d => ({ ...d, pB: [[d.pB[0][0], e.target.value], d.pB[1]] }))} />
                <input type="text" placeholder="pB[1][0]" value={registerData.pB[1][0]} onChange={e => setRegisterData(d => ({ ...d, pB: [d.pB[0], [e.target.value, d.pB[1][1]]] }))} />
                <input type="text" placeholder="pB[1][1]" value={registerData.pB[1][1]} onChange={e => setRegisterData(d => ({ ...d, pB: [d.pB[0], [d.pB[1][0], e.target.value]] }))} />
                <input type="text" placeholder="pC[0]" value={registerData.pC[0]} onChange={e => setRegisterData(d => ({ ...d, pC: [e.target.value, d.pC[1]] }))} />
                <input type="text" placeholder="pC[1]" value={registerData.pC[1]} onChange={e => setRegisterData(d => ({ ...d, pC: [d.pC[0], e.target.value] }))} />
                <input type="text" placeholder="publicSignals[0]" value={registerData.publicSignals[0]} onChange={e => setRegisterData(d => ({ ...d, publicSignals: [e.target.value] }))} />
                <button onClick={handleRegisterFile}>Register File</button>
            </div>
            <p>Use the buttons above to interact with the File Registry contract.</p>
            <p>Note: Replace '0xYourUploaderAddressHere', '0xNewOwnerAddressHere', and '0xYourFileIdHere' with actual values.</p>
            <p>Ensure you have the necessary permissions to perform these actions.</p>
        </MainLayout>
    );
}