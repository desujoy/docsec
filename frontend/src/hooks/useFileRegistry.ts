// hooks/useFileRegistry.ts

import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { fileRegistryAbi, fileRegistryAddress, verifierAddress } from '../constants/contracts';
import { config as wagmiConfig } from '../wagmi';
import { groth16VerifierAbi } from '../generated';

export const useFileRegistry = () => {
  const { address } = useAccount();

  // --- READS ---

  const { data: owner, refetch: refetchOwner } = useReadContract({
    abi: fileRegistryAbi,
    address: fileRegistryAddress,
    functionName: 'owner',
  });

  const { data: isUploader, refetch: refetchIsUploader } = useReadContract({
    abi: fileRegistryAbi,
    address: fileRegistryAddress,
    functionName: 'isUploader',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const { data: allFiles, refetch: refetchAllFiles, isLoading: allFilesLoading } = useReadContract({
    abi: fileRegistryAbi,
    address: fileRegistryAddress,
    functionName: 'getAllFileRecords',
  });

  // --- WRITES ---

  const { writeContractAsync } = useWriteContract();

  // --- EVENTS ---

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'FileRegistered',
    onLogs: () => refetchAllFiles(),
  });
  // ... (other event watchers)

  // --- HOOK RETURN ---

  return {
    // Data
    owner,
    isUploader,
    allFiles,

    // Imperative Functions
    getFileRecordOnClick: (hash: `0x${string}`) =>
      readContract(wagmiConfig, {
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'getFileRecord',
        args: [hash],
      }),

    // NEW: Function to verify a proof against the verifier contract
    verifyProof: (proofData: { pA: [bigint, bigint]; pB: [[bigint, bigint], [bigint, bigint]]; pC: [bigint, bigint]; publicSignals: [bigint]; }) =>
      readContract(wagmiConfig, {
        abi: groth16VerifierAbi,
        address: verifierAddress,
        functionName: 'verifyProof',
        args: [proofData.pA, proofData.pB, proofData.pC, proofData.publicSignals],
      }),

    // Write Methods
    registerFile: (proofData: { pA: [bigint, bigint]; pB: [[bigint, bigint], [bigint, bigint]]; pC: [bigint, bigint]; publicSignals: [bigint]; fileName: string; }) =>
      writeContractAsync({
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'registerFile',
        args: [proofData.pA, proofData.pB, proofData.pC, proofData.publicSignals, proofData.fileName],
      }),

    addUploader: (uploaderAddress: `0x${string}`) =>
      writeContractAsync({
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'addUploader',
        args: [uploaderAddress],
      }),

    removeUploader: (uploaderAddress: `0x${string}`) =>
      writeContractAsync({
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'removeUploader',
        args: [uploaderAddress],
      }),
    findFileByHash: async (hash: `0x${string}`) => {
      try {
        // Try to read the contract. If the hash doesn't exist, this will throw an error.
        const record = await readContract(wagmiConfig, {
          abi: fileRegistryAbi,
          address: fileRegistryAddress,
          functionName: 'getFileRecord',
          args: [hash],
        });
        return record; // Return the record if found
      } catch (error) {
        // If the contract call failed (likely because the file doesn't exist), return null.
        console.info("File not found on-chain:", error);
        return null;
      }
    },
    allFilesLoading,
    // Refetching
    refetchOwner,
    refetchIsUploader,
    refetchAllFiles,
  };
};