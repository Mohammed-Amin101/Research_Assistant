import { Link } from "@tanstack/react-router";
import { FileText, FileType2, Calendar, Eye, Trash2 } from "lucide-react";
import type { Document } from "@/types";

interface Props {
  doc: Document;
  onDelete: (doc: Document) => void;
  /** Only admins are allowed to delete documents (RBAC). */
  canDelete?: boolean;
}

function iconFor(type: string) {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return { Icon: FileType2, color: "text-rose-500 bg-rose-50" };
  if (t.includes("doc")) return { Icon: FileText, color: "text-blue-500 bg-blue-50" };
  return { Icon: FileText, color: "text-indigo-500 bg-indigo-50" };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function DocumentCard({ doc, onDelete, canDelete = false }: Props) {
  const { Icon, color } = iconFor(doc.file_type);
  const preview = (doc.summary || "").slice(0, 150);

  return (
    <div className="group flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground" title={doc.filename}>
            {doc.filename}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(doc.created_at)}</span>
            <span className="mx-1">·</span>
            <span className="uppercase">{doc.file_type}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {preview || "No summary available."}
        {doc.summary && doc.summary.length > 150 ? "…" : ""}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <Link
          to="/documents/$id"
          params={{ id: String(doc.id) }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(doc)}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            aria-label="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
