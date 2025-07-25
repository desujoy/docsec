import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { FileUploader } from '../components/shared/FileUploader';
import { Spinner } from '../components/shared/Spinner';
import { Notification } from '../components/shared/Notification';
import { useFileRegistry } from '../hooks/useFileRegistry';
import { generateProofAndCalldata, uploadToIpfs } from '../api';

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { registerFile } = useFileRegistry();

  const handleFileAccepted = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const proofData = await generateProofAndCalldata(file);
      await registerFile(proofData);

      // Optional: Upload to IPFS
      const ipfsData = await uploadToIpfs(file);
      setNotification({
        message: `File registered successfully! IPFS Hash: ${ipfsData.ipfsHash}`,
        type: 'success',
      });
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <h1>Upload File</h1>
      <FileUploader onFileAccepted={handleFileAccepted} />
      {file && <p>Selected file: {file.name}</p>}
      <button onClick={handleUpload} disabled={!file || isLoading}>
        {isLoading ? <Spinner /> : 'Upload and Register'}
      </button>
      {notification && <Notification message={notification.message} type={notification.type} />}
    </MainLayout>
  );
}
