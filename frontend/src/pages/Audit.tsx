import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { useFileRegistry } from "@/hooks/useFileRegistry";

type FileRecord = {
  uploader: string;
  timestamp: bigint;
  fileName: string;
};

export function Audit() {
  const { allFiles, refetchAllFiles, allFilesLoading, getFileRecordOnClick } = useFileRegistry();
  const [filedata, setFileData] = useState<FileRecord | null>(null);

  const handleViewFileData = async (hash: `0x${string}`) => {
    const data = await getFileRecordOnClick(hash);
    if (data) {
      const [uploader, timestamp, fileName] = data as [string, bigint, string];
      setFileData({ uploader, timestamp, fileName });
    } else {
      setFileData(null);
    }
  };

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
          {allFiles && allFiles[0].length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {allFiles[0].length} {allFiles[0].length === 1 ? "Event" : "Events"} Found
            </Badge>
          )}
        </div>

        {filedata && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Uploader:</strong> {filedata.uploader}</p>
              <p><strong>Filename:</strong> {filedata.fileName}</p>
              <p><strong>Timestamp:</strong> {new Date(Number(filedata.timestamp) * 1000).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        {allFilesLoading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading audit trail...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Registered Files</h2>
              <button className="btn btn-ghost" onClick={() => refetchAllFiles()}>Refresh</button>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>File Hash</th>
                    <th>Filename</th>
                    <th>Uploader</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {allFiles && allFiles[0].length > 0 ? (
                    allFiles[0].map((hash, index) => {
                      const record = allFiles[1][index] as FileRecord;
                      return (
                        <tr key={hash}>
                          <td className="font-mono text-xs">{hash}</td>
                          <td>
                            {record.fileName}
                            <button
                              className="btn btn-link"
                              onClick={() => handleViewFileData(hash)}
                            >
                              View
                            </button>
                          </td>
                          <td className="font-mono text-xs">{record.uploader}</td>
                          <td>{new Date(Number(record.timestamp) * 1000).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={4} className="text-center">No files registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
