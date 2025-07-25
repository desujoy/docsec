import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const generateProofAndCalldata = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/generate-proof-and-calldata', formData);
  return data;
};

export const getVerificationHash = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/get-verification-hash', formData);
  return data;
};

export const uploadToIpfs = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/upload-to-ipfs', formData);
  return data;
};
