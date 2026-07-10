import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface Props {
  onFile: (file: File) => void;
  uploading?: boolean;
  progress?: number;
  processing?: boolean;
}

const ACCEPT = ".pdf,.docx,.txt";

export function UploadArea({ onFile, uploading, progress = 0, processing }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);

  const pick = (file?: File | null) => {
    if (!file) return;
    setSelected(file);
    onFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    pick(e.target.files?.[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onChange}
        className="hidden"
        disabled={uploading || processing}
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/20 text-primary">
        <UploadCloud className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-foreground">
        Drop your document here
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Supports PDF, DOCX and TXT — up to a few MB.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || processing}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        Browse files
      </button>

      {selected && (
        <div className="mt-6 w-full max-w-md rounded-xl border border-border bg-background p-4 text-left">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{selected.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selected.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {uploading && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Uploading… {progress}%</p>
            </div>
          )}

          {processing && (
            <div className="mt-3 flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is generating summary…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
