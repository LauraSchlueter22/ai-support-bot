const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? "Request failed");
  }
  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{
        token: string;
        user: { id: string; email: string; organizationId: string };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, organizationName: string) =>
      request<{
        token: string;
        user: { id: string; email: string; organizationId: string };
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, organizationName }),
      }),
  },
  documents: {
    list: () =>
      request<{
        documents: Array<{
          id: string;
          name: string;
          status: string;
          createdAt: string;
        }>;
      }>("/documents"),
    upload: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      return fetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then((r) => r.json());
    },
    delete: (id: string) => request(`/documents/${id}`, { method: "DELETE" }),
  },
  chat: {
    sendMessage: async (
      content: string,
      tenantId: string,
      conversationId?: string,
      onChunk?: (chunk: string) => void,
    ) => {
      const token = getToken();
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, tenantId, conversationId }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          onChunk?.(chunk);
        }
      }
      return fullText;
    },
  },
};
