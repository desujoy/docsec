import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { AdminPanel } from '../components/features/AdminPanel';
import { useFileRegistry } from '../hooks/useFileRegistry';
import { useAccount } from 'wagmi';

export function Admin() {
  const { owner } = useFileRegistry();
  const { address } = useAccount();

  return (
    <MainLayout>
      <h1>Admin</h1>
      {owner === address ? (
        <AdminPanel />
      ) : (
        <p>You are not authorized to view this page.</p>
      )}
    </MainLayout>
  );
}
