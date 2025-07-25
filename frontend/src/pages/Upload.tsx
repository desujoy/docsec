import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { FileUploader } from "../components/shared/FileUploader";
import { Spinner } from "../components/shared/Spinner";
import { Notification } from "../components/shared/Notification";
import { useFileRegistry } from "../hooks/useFileRegistry";
import { generateProofAndCalldata, uploadToIpfs } from "../api";
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
import { Upload as UploadIcon, FileCheck, ExternalLink } from "lucide-react";

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    ipfsHash?: string;
    transactionHash?: string;
  } | null>(null);
  const { registerFile } = useFileRegistry();

  const handleFileAccepted = (selectedFile: File) => {
    setFile(selectedFile);
    setNotification(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setNotification(null);
    setUploadResult(null);

    try {
      setNotification({
        message: "Generating cryptographic proof...",
        type: "info",
      });

      const proofData = await generateProofAndCalldata(file);

      setNotification({
        message: "Registering file on blockchain...",
        type: "info",
      });

      const result = await registerFile(proofData);

      // Optional: Upload to IPFS
      setNotification({
        message: "Uploading to IPFS...",
        type: "info",
      });

      const ipfsData = await uploadToIpfs(file);

      setUploadResult({
        ipfsHash: ipfsData.ipfsHash,
        transactionHash: result, // result is the transaction hash directly
      });

      setNotification({
        message: "File registered successfully!",
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <UploadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Upload File</h1>
          </div>
          <p className="text-muted-foreground">
            Upload your file to generate a cryptographic proof and register it
            on the blockchain.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>
              Choose a file to upload and generate a zero-knowledge proof for
              integrity verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUploader
              onFileAccepted={handleFileAccepted}
              selectedFile={file}
            />

            {file && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ready to upload:</span>
                    <Badge variant="secondary">{file.name}</Badge>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Upload and Register
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}

        {uploadResult && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Upload Successful!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Your file has been successfully registered on the blockchain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadResult.ipfsHash && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">IPFS Hash:</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {uploadResult.ipfsHash.slice(0, 10)}...
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://ipfs.io/ipfs/${uploadResult.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {uploadResult.transactionHash && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Transaction Hash:</span>
                  <Badge variant="outline">
                    {uploadResult.transactionHash.slice(0, 10)}...
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
