import React from 'react';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1rem' }}>{children}</main>
    </div>
  );
}
