import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { FileUploader } from "../components/shared/FileUploader";
import { Spinner } from "../components/shared/Spinner";
import { Notification } from "../components/shared/Notification";
import { VerificationResult } from "../components/features/VerificationResult";
import { getVerificationHash } from "../api";
import { useFileRegistry } from "../hooks/useFileRegistry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileCheck, Hash, Shield } from "lucide-react";

export function Verify() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [verificationHash, setVerificationHash] = useState<
    `0x${string}` | null
  >(null);
  const { getFileRecordOnClick } = useFileRegistry();
  const [fileRecord, setFileRecord] = useState<any>(null);

  const handleFileAccepted = (selectedFile: File) => {
    setFile(selectedFile);
    setVerificationHash(null);
    setNotification(null);
  };

  const handleVerify = async () => {
    if (!file) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const { poseidonHash } = await getVerificationHash(file);
      setVerificationHash(poseidonHash);

      // Fetch the file record
      const record = await getFileRecordOnClick(poseidonHash);
      setFileRecord(record);

      setNotification({
        message: "Verification hash calculated successfully.",
        type: "success",
      });
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Verify File</h1>
          </div>
          <p className="text-muted-foreground">
            Upload a file to verify its integrity and check if it exists in the
            blockchain registry.
          </p>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileCheck className="h-5 w-5" />
              <span>Select File for Verification</span>
            </CardTitle>
            <CardDescription>
              Choose the file you want to verify from your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploader onFileAccepted={handleFileAccepted} />

            {file && (
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <FileCheck className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{file.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Calculating Hash...</span>
                </>
              ) : (
                <>
                  <Hash className="h-4 w-4 mr-2" />
                  <span>Verify File</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}

        {/* Verification Results */}
        {verificationHash && (
          <div className="space-y-4">
            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5" />
                  <span>Verification Hash</span>
                </CardTitle>
                <CardDescription>
                  Cryptographic hash generated from your file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-xs font-mono break-all">
                    {verificationHash}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Blockchain Verification</span>
                </CardTitle>
                <CardDescription>
                  Checking if this file exists in the blockchain registry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fileRecord &&
                fileRecord[0] !==
                  "0x0000000000000000000000000000000000000000" ? (
                  <VerificationResult isVerified={true} />
                ) : (
                  <VerificationResult isVerified={false} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
