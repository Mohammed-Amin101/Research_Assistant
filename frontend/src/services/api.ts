import axios from "axios";
import type { Document } from "@/types";

export const API_BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const documentsApi = {
  list: async (): Promise<Document[]> => {
    const { data } = await api.get<Document[]>("/documents");
    return data;
  },
  get: async (id: number | string): Promise<Document> => {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
  },
  search: async (query: string): Promise<Document[]> => {
    const { data } = await api.get<Document[]>("/documents/search", {
      params: { query },
    });
    return data;
  },
  upload: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{ message: string; document: Document }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
  ask: async (id: number | string, question: string): Promise<string> => {
    const { data } = await api.post<{ answer: string }>(
      `/documents/${id}/ask`,
      { question },
    );
    return data.answer;
  },
};
