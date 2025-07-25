import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useWatchContractEvent } from 'wagmi';
import { fileRegistryAbi, fileRegistryAddress } from '../constants/contracts';
import { getLogs } from 'viem/actions';
import { usePublicClient, useChainId } from 'wagmi';
import { decodeEventLog } from 'viem';

export function Audit() {
  const [events, setEvents] = useState<any[]>([]);
  const chainId = useChainId();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchPastEvents = async () => {
      if (!publicClient) return;
      const logs = await getLogs(publicClient, {
        address: fileRegistryAddress,
        abi: fileRegistryAbi,
        eventName: 'FileRegistered',
        fromBlock: 0n,
        toBlock: 'latest',
      });
      setEvents(
        logs.map((log) => {
          const decoded = decodeEventLog({
            abi: fileRegistryAbi,
            data: log.data,
            topics: log.topics,
          });
          return decoded.args;
        })
      );
    };

    fetchPastEvents();
  }, [publicClient]);

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'FileRegistered',
    onLogs(logs) {
      setEvents(prevEvents => [...prevEvents, ...logs.map(log => log.args)]);
    },
  });

  return (
    <MainLayout>
      <h1>Audit Trail</h1>
      <table>
        <thead>
          <tr>
            <th>Content Hash</th>
            <th>Uploader</th>
            <th>File Name</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={index}>
              <td>{event.contentHash}</td>
              <td>{event.uploader}</td>
              <td>{event.fileName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MainLayout>
  );
}
