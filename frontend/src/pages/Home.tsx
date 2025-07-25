import React from 'react';
import { useAccount } from 'wagmi';
import { MainLayout } from '../components/layout/MainLayout';

export function Home() {
  const { isConnected } = useAccount();

  return (
    <MainLayout>
      <h1>Welcome to the Secure File Integrity Verification System</h1>
      {isConnected ? (
        <p>You are connected to the wallet.</p>
      ) : (
        <p>Please connect your wallet to continue.</p>
      )}
    </MainLayout>
  );
}
