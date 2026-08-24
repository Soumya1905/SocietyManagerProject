import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(
            "rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500",
            error ? "border-red-400" : "border-slate-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
