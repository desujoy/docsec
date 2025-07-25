import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield, AlertTriangle } from "lucide-react";

interface VerificationResultProps {
  isVerified: boolean | null;
}

export function VerificationResult({ isVerified }: VerificationResultProps) {
  if (isVerified === null) {
    return null;
  }

  if (isVerified) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-800 dark:text-green-200">
                File Verified Successfully
              </span>
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <Shield className="h-3 w-3 mr-1" />
                Authenticated
              </Badge>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              This file exists in the blockchain registry and its integrity has
              been confirmed.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <XCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-red-800 dark:text-red-200">
              File Not Found
            </span>
            <Badge
              variant="destructive"
              className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unverified
            </Badge>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            This file does not exist in the blockchain registry or has been
            modified since upload.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
