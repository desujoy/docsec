import React, { useState } from 'react';
import { useFileRegistry } from '../../hooks/useFileRegistry';

export function AdminPanel() {
  const { addUploader, removeUploader } = useFileRegistry();
  const [uploaderAddress, setUploaderAddress] = useState('');

  const handleAddUploader = () => {
    addUploader(uploaderAddress as `0x${string}`);
  };

  const handleRemoveUploader = () => {
    removeUploader(uploaderAddress as `0x${string}`);
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <input
        type="text"
        value={uploaderAddress}
        onChange={(e) => setUploaderAddress(e.target.value)}
        placeholder="Uploader Address"
      />
      <button onClick={handleAddUploader}>Add Uploader</button>
      <button onClick={handleRemoveUploader}>Remove Uploader</button>
    </div>
  );
}
