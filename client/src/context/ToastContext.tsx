import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] ${
              toast.type === "success"
                ? "bg-white border-emerald-200 text-emerald-800"
                : "bg-white border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-500" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
