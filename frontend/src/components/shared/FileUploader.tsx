import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileAccepted: (file: File) => void;
  selectedFile?: File | null;
}

export function FileUploader({
  onFileAccepted,
  selectedFile,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "*/*": [],
      },
    });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50",
        isDragActive && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5"
      )}
    >
      <CardContent className="p-8 text-center space-y-4">
        <input {...getInputProps()} />

        <div className="mx-auto h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          <Upload
            className={cn(
              "h-6 w-6 text-muted-foreground",
              isDragActive && "text-primary"
            )}
          />
        </div>

        {selectedFile ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{selectedFile.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button variant="outline" size="sm">
              Choose Different File
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-primary font-medium">Drop the file here...</p>
            ) : (
              <>
                <p className="font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload any file to generate a cryptographic proof
                </p>
              </>
            )}
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
