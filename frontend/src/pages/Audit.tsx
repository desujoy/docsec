import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { useWatchContractEvent } from "wagmi";
import { fileRegistryAbi, fileRegistryAddress } from "../constants/contracts";
import { getLogs } from "viem/actions";
import { usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileText, User, Hash, Calendar } from "lucide-react";

interface FileEvent {
  contentHash: string;
  uploader: string;
  fileName: string;
  timestamp?: number;
}

export function Audit() {
  const [events, setEvents] = useState<FileEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchPastEvents = async () => {
      if (!publicClient) return;

      try {
        const logs = await getLogs(publicClient, {
          address: fileRegistryAddress,
          fromBlock: 0n,
          toBlock: "latest",
        });

        const eventData = logs.map((log) => {
          const decoded = decodeEventLog({
            abi: fileRegistryAbi,
            data: log.data,
            topics: log.topics,
          });
          return {
            ...decoded.args,
            timestamp: Date.now(),
          } as FileEvent;
        });

        setEvents(eventData.reverse());
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastEvents();
  }, [publicClient]);

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: "FileRegistered",
    onLogs(logs) {
      const newEvents = logs.map(
        (log) =>
          ({
            ...log.args,
            timestamp: Date.now(),
          }) as FileEvent
      );
      setEvents((prevEvents) => [...newEvents, ...prevEvents]);
    },
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Audit Trail</h1>
          </div>
          <p className="text-muted-foreground">
            View all file registration events on the blockchain.
          </p>
          {events.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {events.length} {events.length === 1 ? "Event" : "Events"} Found
            </Badge>
          )}
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading audit trail...</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center space-y-4">
              <History className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No Events Found</h3>
                <p className="text-sm text-muted-foreground">
                  No file registration events have been recorded yet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <FileText className="h-5 w-5" />
                      <span>{event.fileName || "Unnamed File"}</span>
                    </CardTitle>
                    {event.timestamp && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.timestamp).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Content Hash
                        </span>
                      </div>
                      <div className="bg-muted p-2 rounded font-mono text-xs break-all">
                        {event.contentHash}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Uploader</span>
                      </div>
                      <div className="bg-muted p-2 rounded font-mono text-xs">
                        {event.uploader}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
