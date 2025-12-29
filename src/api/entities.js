import { apiFetch } from "./apiClient";

function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function makeCrud(basePath) {
  return {
    list: (orderBy = "-updatedAt", limit = 200, filters = {}) =>
      apiFetch(`${basePath}${qs({ orderBy, limit, ...filters })}`),
    get: (id) => apiFetch(`${basePath}/${id}`),
    create: (data) => apiFetch(basePath, { method: "POST", body: data }),
    update: (id, data) => apiFetch(`${basePath}/${id}`, { method: "PATCH", body: data }),
    delete: (id) => apiFetch(`${basePath}/${id}`, { method: "DELETE" }),
  };
}

export const ChatSession = makeCrud("/api/chat-sessions");
export const Learning = makeCrud("/api/learning");
export const KnowledgeBase = makeCrud("/api/knowledge-bases");
export const DataVisualization = makeCrud("/api/data-visualizations");

export const SessionPresence = {
  ...makeCrud("/api/session-presence"),
  filter: (filters = {}) => apiFetch(`/api/session-presence${qs(filters)}`),
};

export const User = {
  async get() {
    return apiFetch("/api/me");
  },
};
