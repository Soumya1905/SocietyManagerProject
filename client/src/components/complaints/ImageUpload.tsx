import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  error?: string;
}

export function ImageUpload({ onChange, error: externalError }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) {
      onChange(null);
      setPreview(null);
      setLocalError(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Only JPEG, PNG, WEBP, or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError("Image must be smaller than 5MB.");
      return;
    }

    setLocalError(null);
    onChange(file);
    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    handleFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const error = localError ?? externalError;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Photo (optional)</label>
      {preview ? (
        <div className="relative w-40">
          <img src={preview} alt="Complaint preview" className="h-32 w-40 rounded-md border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={clear}
            aria-label="Remove photo"
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow border border-slate-200"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500">
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">Upload photo</span>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
