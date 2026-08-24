import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
