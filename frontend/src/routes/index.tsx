import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileStack, Plus, RefreshCw, Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import { documentsApi } from "@/services/api";
import type { Document } from "@/types";
import { DocumentCard } from "@/components/DocumentCard";
import { SearchBar } from "@/components/SearchBar";
import { SkeletonCard, Loader } from "@/components/Loader";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Research Assistant" },
      { name: "description", content: "Manage and search your uploaded research documents." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await documentsApi.list();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Couldn't load documents. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await documentsApi.search(q);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        toast.error("Search failed.");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const list = useMemo(() => searchResults ?? docs, [searchResults, docs]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await documentsApi.remove(pendingDelete.id);
      toast.success("Document deleted.");
      setPendingDelete(null);
      await load();
      if (query.trim()) {
        // refresh search results too
        try {
          const results = await documentsApi.search(query.trim());
          setSearchResults(results);
        } catch {}
      }
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Your research library
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Upload documents and chat with them using AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Upload document
          </Link>
        </div>
      </div>

      {/* Stats + search */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileStack className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total documents</p>
            <p className="text-xl font-semibold text-foreground">{docs.length}</p>
          </div>
        </div>
        <div className="sm:col-span-2">
          <SearchBar value={query} onChange={setQuery} placeholder="Search your documents…" />
          {query && (
            <p className="mt-1.5 flex items-center gap-1.5 pl-1 text-xs text-muted-foreground">
              <SearchIcon className="h-3 w-3" />
              {searching
                ? "Searching…"
                : `${searchResults?.length ?? 0} result${(searchResults?.length ?? 0) === 1 ? "" : "s"} for "${query}"`}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : searching && !searchResults ? (
          <Loader />
        ) : list.length === 0 ? (
          <EmptyState hasQuery={!!query.trim()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <DocumentCard key={d.id} doc={d} onDelete={setPendingDelete} />
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        open={!!pendingDelete}
        title="Delete this document?"
        description={
          pendingDelete
            ? `"${pendingDelete.filename}" will be permanently removed.`
            : ""
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => (deleting ? null : setPendingDelete(null))}
      />
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileStack className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {hasQuery ? "No matching documents" : "No documents yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasQuery
          ? "Try a different search term."
          : "Upload your first document to start chatting with it."}
      </p>
      {!hasQuery && (
        <Link
          to="/upload"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Upload document
        </Link>
      )}
    </div>
  );
}
