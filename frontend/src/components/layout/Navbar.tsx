import React from 'react';
import { ConnectButton } from '../shared/ConnectButton';

export function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <div>
        <a href="/">Home</a>
        <a href="/upload" style={{ marginLeft: '1rem' }}>Upload</a>
        <a href="/verify" style={{ marginLeft: '1rem' }}>Verify</a>
        <a href="/admin" style={{ marginLeft: '1rem' }}>Admin</a>
        <a href="/audit" style={{ marginLeft: '1rem' }}>Audit Trail</a>
      </div>
      <ConnectButton />
    </nav>
  );
}
