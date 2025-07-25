import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { FileUploader } from '../components/shared/FileUploader';
import { Spinner } from '../components/shared/Spinner';
import { Notification } from '../components/shared/Notification';
import { VerificationResult } from '../components/features/VerificationResult';
import { getVerificationHash } from '../api';
import { useFileRegistry } from '../hooks/useFileRegistry';

export function Verify() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [verificationHash, setVerificationHash] = useState<`0x${string}` | null>(null);
  const { getFileRecord } = useFileRegistry();
  const { data: fileRecord } = getFileRecord(verificationHash as `0x${string}`);

  const handleFileAccepted = (selectedFile: File) => {
    setFile(selectedFile);
    setVerificationHash(null);
  };

  const handleVerify = async () => {
    if (!file) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const { poseidonHash } = await getVerificationHash(file);
      setVerificationHash(poseidonHash);
      setNotification({
        message: 'Verification hash calculated.',
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
      <h1>Verify File</h1>
      <FileUploader onFileAccepted={handleFileAccepted} />
      {file && <p>Selected file: {file.name}</p>}
      <button onClick={handleVerify} disabled={!file || isLoading}>
        {isLoading ? <Spinner /> : 'Verify File'}
      </button>
      {notification && <Notification message={notification.message} type={notification.type} />}
      {verificationHash && (
        <div>
          <h3>Verification Hash:</h3>
          <p>{verificationHash}</p>
          <h3>On-chain Record:</h3>
          {fileRecord && fileRecord[0] !== '0x0000000000000000000000000000000000000000' ? (
            <VerificationResult isVerified={true} />
          ) : (
            <VerificationResult isVerified={false} />
          )}
        </div>
      )}
    </MainLayout>
  );
}
