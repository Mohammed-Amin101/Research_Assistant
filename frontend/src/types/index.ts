export interface Document {
  id: number;
  filename: string;
  file_type: string;
  original_text: string;
  summary: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
