import React from 'react';

interface VerificationResultProps {
  isVerified: boolean | null;
}

export function VerificationResult({ isVerified }: VerificationResultProps) {
  if (isVerified === null) {
    return null;
  }

  return (
    <div>
      {isVerified ? (
        <p style={{ color: 'green' }}>File is verified!</p>
      ) : (
        <p style={{ color: 'red' }}>File is not verified!</p>
      )}
    </div>
  );
}
