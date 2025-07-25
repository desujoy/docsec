import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { fileRegistryAbi, fileRegistryAddress } from '../constants/contracts';

export const useFileRegistry = () => {
  const { address } = useAccount();

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

  const { writeContract: registerFile } = useWriteContract();
  const { writeContract: addUploader } = useWriteContract();
  const { writeContract: removeUploader } = useWriteContract();

  const getFileRecord = (hash: `0x${string}`) => {
    return useReadContract({
      abi: fileRegistryAbi,
      address: fileRegistryAddress,
      functionName: 'getFileRecord',
      args: [hash],
    });
  };

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'FileRegistered',
    onLogs(logs) {
      console.log('New file registered:', logs);
    },
  });

  return {
    owner,
    isUploader,
    registerFile: (proofData: any) =>
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
    getFileRecord,
    refetchOwner,
    refetchIsUploader,
  };
};
