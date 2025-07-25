import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export function Notification({ message, type }: NotificationProps) {
  return (
    <div
      style={{
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        color: 'white',
        backgroundColor: type === 'success' ? 'green' : 'red',
      }}
    >
      {message}
    </div>
  );
}
