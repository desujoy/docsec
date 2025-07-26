import { useState } from "react";
import { useFileRegistry } from "../../hooks/useFileRegistry";
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
import { Separator } from "@/components/ui/separator";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { useWatchContractEvent } from "wagmi";
import { fileRegistryAddress } from "@/constants/contracts";
import { fileRegistryAbi } from "@/generated";

export function AdminPanel() {
  const { addUploader, removeUploader } = useFileRegistry();
  const [uploaderAddress, setUploaderAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'UploaderAdded',
    onLogs: () => {
      setNotification({
        message: "Uploader added successfully!",
        type: "success",
      });
      setUploaderAddress("");
    },
  });

  useWatchContractEvent({
    address: fileRegistryAddress,
    abi: fileRegistryAbi,
    eventName: 'UploaderRemoved',
    onLogs: () => {
      setNotification({
        message: "Uploader removed successfully!",
        type: "success",
      });
      setUploaderAddress("");
    },
  });

  const handleAddUploader = async () => {
    if (!uploaderAddress) return;
    setIsLoading(true);
    try {
      await addUploader(uploaderAddress as `0x${string}`);
      setUploaderAddress("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUploader = async () => {
    if (!uploaderAddress) return;
    setIsLoading(true);
    try {
      await removeUploader(uploaderAddress as `0x${string}`);
      setUploaderAddress("");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Uploader Management</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="uploader-address">Uploader Address</Label>
          <Input
            id="uploader-address"
            type="text"
            value={uploaderAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUploaderAddress(e.target.value)
            }
            placeholder="0x..."
            className="font-mono text-sm"
          />
          {uploaderAddress && !isValidAddress(uploaderAddress) && (
            <p className="text-sm text-destructive">
              Please enter a valid Ethereum address
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleAddUploader}
            disabled={!isValidAddress(uploaderAddress) || isLoading}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Uploader</span>
          </Button>

          <Button
            variant="destructive"
            onClick={handleRemoveUploader}
            disabled={!isValidAddress(uploaderAddress) || isLoading}
            className="flex items-center space-x-2"
          >
            <UserMinus className="h-4 w-4" />
            <span>Remove Uploader</span>
          </Button>
        </div>
      </div>

      {notification && (
        <Card className={`bg-${notification.type === "success" ? "green" : "red"}-100`}>
          <CardHeader>
            <CardTitle>{notification.type === "success" ? "Success" : "Error"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{notification.message}</CardDescription>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Note</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            Only addresses with uploader permissions can register new files to
            the system. Use the controls above to grant or revoke these
            permissions.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
