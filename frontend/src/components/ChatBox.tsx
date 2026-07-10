import { Bot, Send, User, Loader2, MessagesSquare } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { documentsApi } from "@/services/api";
import type { ChatMessage } from "@/types";

interface Props {
  documentId: number | string;
}

export function ChatBox({ documentId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const answer = await documentsApi.ask(documentId, q);
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to get a response.");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't process that question." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessagesSquare className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ask this document</h3>
          <p className="text-xs text-muted-foreground">
            Conversation is kept only for this session.
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <Bot className="mb-2 h-8 w-8 text-primary/60" />
            <p className="text-sm">Ask anything about this document to get started.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md border border-border bg-background text-foreground"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-background px-4 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-border/60 bg-background/50 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document…"
            disabled={loading}
            className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            aria-label="Send"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
