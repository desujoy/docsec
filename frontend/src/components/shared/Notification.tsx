import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  className?: string;
}

export function Notification({ message, type, className }: NotificationProps) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = icons[type];

  return (
    <Alert
      className={cn(
        "border-l-4",
        type === "success" &&
          "border-l-green-500 bg-green-50 dark:bg-green-950/20",
        type === "error" && "border-l-red-500 bg-red-50 dark:bg-red-950/20",
        type === "info" && "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
        type === "warning" &&
          "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          type === "success" && "text-green-600 dark:text-green-400",
          type === "error" && "text-red-600 dark:text-red-400",
          type === "info" && "text-blue-600 dark:text-blue-400",
          type === "warning" && "text-yellow-600 dark:text-yellow-400"
        )}
      />
      <AlertDescription
        className={cn(
          type === "success" && "text-green-800 dark:text-green-200",
          type === "error" && "text-red-800 dark:text-red-200",
          type === "info" && "text-blue-800 dark:text-blue-200",
          type === "warning" && "text-yellow-800 dark:text-yellow-200"
        )}
      >
        {message}
      </AlertDescription>
    </Alert>
  );
}
