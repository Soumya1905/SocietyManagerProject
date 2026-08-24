import { AlertCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-16 text-center">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
