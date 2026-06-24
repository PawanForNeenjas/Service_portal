import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

type UploadBoxProps = {
  label: string;
  helper: string;
  icon: LucideIcon;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  files?: File[];
  progress?: number | null;
  status?: "idle" | "uploading" | "success" | "error";
  error?: string | null;
  onFilesSelected?: (files: File[]) => void;
  onRemoveFile?: (fileKey: string) => void;
  className?: string;
};

export function UploadBox({
  label,
  helper,
  icon: Icon,
  accept,
  multiple,
  disabled,
  files = [],
  progress,
  status = "idle",
  error,
  onFilesSelected,
  onRemoveFile,
  className,
}: UploadBoxProps) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed bg-white p-4 text-center",
        className,
      )}
    >
      <label
        htmlFor={inputId}
        className={cn(
          "flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg px-2 py-4 transition hover:bg-sky-50/40 focus-within:outline-none",
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-primary",
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="mt-3 text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 text-xs text-slate-500">{helper}</span>
        <span className="mt-2 text-xs font-medium text-slate-400">
          {files.length ? `${files.length} selected` : "Click to choose files"}
        </span>
      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const nextFiles = event.target.files ? Array.from(event.target.files) : [];
          if (nextFiles.length) {
            onFilesSelected?.(nextFiles);
          }
          event.target.value = "";
        }}
      />

      {typeof progress === "number" && status === "uploading" ? (
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500">Uploading {progress}%</p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

      {files.length ? (
        <div className="mt-4 space-y-2 text-left">
          {files.map((file) => {
            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
            return (
              <div key={fileKey} className="flex items-start justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
                {onRemoveFile ? (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(fileKey)}
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Remove ${file.name}`}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
}
