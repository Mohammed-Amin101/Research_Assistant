import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Copy,
  FileText,
  Sparkles,
  Trash2,
  FileType2,
} from "lucide-react";
import toast from "react-hot-toast";
import { documentsApi } from "@/services/api";
import type { Document } from "@/types";
import { Loader } from "@/components/Loader";
import { ChatBox } from "@/components/ChatBox";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export const Route = createFileRoute("/documents/$id")({
  head: () => ({
    meta: [
      { title: "Document — AI Research Assistant" },
      { name: "description", content: "View document summary and chat with AI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentDetails,
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function DocumentDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await documentsApi.get(id);
        if (alive) setDoc(data);
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text ?? "");
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Couldn't access clipboard.");
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await documentsApi.remove(id);
      toast.success("Document deleted.");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete document.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Loader label="Loading document…" />
      </div>
    );
  }

  if (notFound || !doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Document not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted or the link is incorrect.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/20 text-primary">
            <FileType2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold text-foreground sm:text-2xl">
              {doc.filename}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(doc.created_at)}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 uppercase tracking-wide">
                {doc.file_type}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Left: content */}
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">AI Summary</h2>
              </div>
              <button
                onClick={() => copy(doc.summary, "Summary")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {doc.summary || "No summary available."}
            </p>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Original Text</h2>
              </div>
              <button
                onClick={() => copy(doc.original_text, "Original text")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <div className="mt-4 max-h-[520px] overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/80">
                {doc.original_text || "No extracted text."}
              </pre>
            </div>
          </section>
        </div>

        {/* Right: chat */}
        <div className="lg:col-span-2">
          <ChatBox documentId={doc.id} />
        </div>
      </div>

      <ConfirmationModal
        open={confirmOpen}
        title="Delete this document?"
        description={`"${doc.filename}" will be permanently removed.`}
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => (deleting ? null : setConfirmOpen(false))}
      />
    </div>
  );
}
