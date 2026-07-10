import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { UploadArea } from "@/components/UploadArea";
import { documentsApi } from "@/services/api";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Document — AI Research Assistant" },
      { name: "description", content: "Upload a PDF, DOCX or TXT document for AI summarization." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const res = await documentsApi.upload(file, (p) => {
        setProgress(p);
        if (p >= 100) setProcessing(true);
      });
      setProcessing(false);
      toast.success("Document uploaded and summarized!");
      navigate({ to: "/documents/$id", params: { id: String(res.document.id) } });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Upload a document
          </h1>
          <p className="text-sm text-muted-foreground">
            The AI will extract text and generate a summary automatically.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <UploadArea
          onFile={handleFile}
          uploading={uploading}
          progress={progress}
          processing={processing}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 text-sm text-muted-foreground shadow-sm">
        <p className="font-medium text-foreground">Tips</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Supported formats: PDF, DOCX, TXT.</li>
          <li>Longer documents take a few seconds to summarize.</li>
          <li>You'll be redirected to the document once it's ready.</li>
        </ul>
      </div>
    </div>
  );
}
