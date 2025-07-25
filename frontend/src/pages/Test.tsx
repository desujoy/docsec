import { useState } from "react";
import { useFileRegistry } from "../hooks/useFileRegistry";
import { MainLayout } from "../components/layout/MainLayout";
import FileProver, { Proof } from "../components/FileProver";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Notification } from "../components/shared/Notification";
import {
  Settings,
  FileText,
  Shield,
  UserPlus,
  UserMinus,
  Hash,
  RefreshCw,
  Clock,
} from "lucide-react";

const jsonReplacer = (_key: any, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

// Define a type for the proof data we'll store in state
type ProofResult = {
  proof: {
    pA: [bigint, bigint];
    pB: [[bigint, bigint], [bigint, bigint]];
    pC: [bigint, bigint];
  };
  publicSignals: [bigint];
  fileName: string;
};

// Define a type for a single file record returned from the contract
type FileRecord = {
  uploader: string;
  timestamp: bigint;
  fileName: string;
};

export function Test() {
  const {
    owner,
    isUploader,
    allFiles,
    getFileRecordOnClick,
    registerFile,
    addUploader,
    removeUploader,
    refetchAllFiles,
    findFileByHash,
  } = useFileRegistry();

  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(false);
  const [uploaderAddress, setUploaderAddress] = useState("");
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  // --- EVENT HANDLERS ---

  const handleProofGenerated = (
    proof: Proof,
    publicSignals: [bigint],
    fileName: string
  ) => {
    setProofResult({
      proof: {
        pA: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
        pB: [
          [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
          [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])],
        ],
        pC: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
      },
      publicSignals,
      fileName,
    });
    setNotification({
      message: "Proof generated successfully!",
      type: "success",
    });
  };

  const executeTransaction = async (
    txFunction: Promise<any>,
    successMessage: string
  ) => {
    setIsLoading(true);
    setNotification(null);
    try {
      await txFunction;
      setNotification({ message: successMessage, type: "success" });
    } catch (error: any) {
      console.error(error);
      setNotification({
        message: error.shortMessage || "Transaction failed.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUploader = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(uploaderAddress)) {
      setNotification({ message: "Invalid uploader address", type: "error" });
      return;
    }
    executeTransaction(
      addUploader(uploaderAddress as `0x${string}`),
      "Uploader added!"
    );
  };

  const handleRemoveUploader = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(uploaderAddress)) {
      setNotification({ message: "Invalid uploader address", type: "error" });
      return;
    }
    executeTransaction(
      removeUploader(uploaderAddress as `0x${string}`),
      "Uploader removed!"
    );
  };

  const handleRegisterFile = () => {
    if (!proofResult) {
      setNotification({
        message: "Please generate a proof first.",
        type: "error",
      });
      return;
    }
    executeTransaction(
      registerFile({
        ...proofResult.proof,
        publicSignals: proofResult.publicSignals,
        fileName: proofResult.fileName,
      }),
      "File registered successfully!"
    );
  };

  const handleExistenceProof = async () => {
    if (!proofResult) {
      setNotification({
        message: "Please generate a proof first.",
        type: "error",
      });
      return;
    }
    try {
      const fileExists = await findFileByHash(`0x${proofResult.publicSignals[0].toString(16)}`);
      setFileExists(fileExists !== null);
      setNotification({
        message: "Existence proof checked successfully.",
        type: "success",
      });
      console.log("File existence check result:", fileExists);
    } catch (error: any) {
      console.error(error);
      setNotification({
        message: "Failed to check file existence.",
        type: "error",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">File Registry Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Test contract interactions and manage file registrations
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}

        {/* Contract Status & Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Contract Status & Admin</span>
            </CardTitle>
            <CardDescription>
              View contract information and manage uploader permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registry Owner</Label>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {owner || "Loading..."}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your Uploader Status</Label>
                <Badge variant={isUploader ? "default" : "secondary"}>
                  {isUploader ? "Authorized" : "Not Authorized"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label htmlFor="uploader-address">Manage Uploader Address</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="uploader-address"
                  type="text"
                  placeholder="0x... uploader address"
                  value={uploaderAddress}
                  onChange={(e) => setUploaderAddress(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddUploader}
                    disabled={isLoading}
                    variant="default"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button
                    onClick={handleRemoveUploader}
                    disabled={isLoading}
                    variant="destructive"
                    size="sm"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Proving & Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Prove & Register a File</span>
            </CardTitle>
            <CardDescription>
              Generate cryptographic proofs and register files on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileProver
              onProofGenerated={handleProofGenerated}
              onError={(error) =>
                setNotification({ message: error, type: "error" })
              }
            />

            {proofResult && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Proof</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>File Hash (Public Signal)</Label>
                    <div className="font-mono text-xs bg-background p-2 rounded border break-all">
                      0x{proofResult.publicSignals[0].toString(16)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Filename</Label>
                    <div className="text-sm bg-background p-2 rounded border">
                      {proofResult.fileName}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Digital Signal</Label>
                    <pre className="text-xs bg-background p-2 rounded border whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {JSON.stringify(proofResult, jsonReplacer, 2)}
                    </pre>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExistenceProof}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Prove Existence
                    </Button>

                    <Button
                      onClick={handleRegisterFile}
                      disabled={!isUploader || isLoading}
                      className="flex-1"
                    >
                      {isLoading
                        ? "Registering..."
                        : "Register File with Proof"}
                    </Button>
                  </div>

                  {!isUploader && (
                    <p className="text-sm text-destructive">
                      You must be an authorized uploader to register a file.
                    </p>
                  )}

                  {fileExists !== null && (
                    <div className={`text-sm p-2 rounded border ${
                      fileExists 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      File {fileExists ? 'exists' : 'does not exist'} in the registry.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* All Registered Files */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>All Registered Files</span>
                </CardTitle>
                <CardDescription>
                  View all files registered in the blockchain
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAllFiles()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allFiles && allFiles[0].length > 0 ? (
              <div className="space-y-4">
                {allFiles[0].map((hash, index) => {
                  const record = allFiles[1][index] as FileRecord;
                  return (
                    <Card key={hash} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              File Hash
                            </Label>
                            <div className="font-mono text-xs break-all bg-muted p-2 rounded">
                              {hash}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Filename
                            </Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{record.fileName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () =>
                                  console.log(await getFileRecordOnClick(hash))
                                }
                              >
                                View
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Uploader
                            </Label>
                            <div className="font-mono text-xs bg-muted p-2 rounded">
                              {record.uploader}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Timestamp
                            </Label>
                            <div className="text-sm flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(
                                  Number(record.timestamp) * 1000
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files registered yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
