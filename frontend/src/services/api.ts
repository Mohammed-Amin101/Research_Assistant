import axios from "axios";
import type { AuthResponse, Document, Role, User } from "@/types";
import { clearToken, getToken } from "@/lib/auth";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, the API returns 401 — clear it so the
// UI falls back to a logged-out state instead of looping on failed calls.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      full_name: fullName,
    });
    return data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // The backend's /auth/login uses FastAPI's OAuth2PasswordRequestForm,
    // which expects application/x-www-form-urlencoded with a "username" field.
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const { data } = await api.post<AuthResponse>("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
  listUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>("/auth/users");
    return data;
  },
  updateUserRole: async (userId: number, role: Role): Promise<User> => {
    const { data } = await api.patch<User>(`/auth/users/${userId}/role`, { role });
    return data;
  },
};

export const documentsApi = {
  list: async (): Promise<Document[]> => {
    const { data } = await api.get<Document[]>("/documents/");
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
