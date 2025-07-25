import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { fileRegistryAbi, fileRegistryAddress } from '../constants/contracts';


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
      // Only run this query if the user's address is available
      enabled: !!address,
    },
  });

  // This function returns a wagmi hook instance for a specific file hash
  const getFileRecord = (hash: `0x${string}`) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useReadContract({
      abi: fileRegistryAbi,
      address: fileRegistryAddress,
      functionName: 'getFileRecord',
      args: [hash],
      query: {
        // Only run this query if a valid hash is provided
        enabled: !!hash,
      },
    });
  };

  // --- WRITES ---

  const { writeContract: registerFile } = useWriteContract();
  const { writeContract: addUploader } = useWriteContract();
  const { writeContract: removeUploader } = useWriteContract();

  // --- EVENTS ---

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'FileRegistered',
    onLogs(logs) {
      console.log('New file registered:', logs);
      // You could potentially trigger a refetch of a list of files here
    },
  });

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'UploaderAdded',
    onLogs(logs) {
      console.log('Uploader added:', logs);
      // Refetch the current user's uploader status in case they were the one added
      refetchIsUploader();
    },
  });

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'UploaderRemoved',
    onLogs(logs) {
      console.log('Uploader removed:', logs);
      // Refetch the current user's uploader status in case they were the one removed
      refetchIsUploader();
    },
  });

  // --- RETURN ---

  return {
    // Data
    owner,
    isUploader,
    
    // Functions
    getFileRecord,

    // Write Methods
    registerFile: (proofData: { pA: [bigint, bigint]; pB: [[bigint, bigint], [bigint, bigint]]; pC: [bigint, bigint]; publicSignals: [bigint]; fileName: string; }) =>
      registerFile({
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'registerFile',
        args: [proofData.pA, proofData.pB, proofData.pC, proofData.publicSignals, proofData.fileName],
      }),

    addUploader: (uploaderAddress: `0x${string}`) =>
      addUploader({
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'addUploader',
        args: [uploaderAddress],
      }),

    removeUploader: (uploaderAddress: `0x${string}`) =>
      removeUploader({
        abi: fileRegistryAbi,
        address: fileRegistryAddress,
        functionName: 'removeUploader',
        args: [uploaderAddress],
      }),

    // Refetching
    refetchOwner,
    refetchIsUploader,
  };
};