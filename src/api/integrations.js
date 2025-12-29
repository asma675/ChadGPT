import { apiFetch } from "./apiClient";

export const InvokeLLM = async ({ prompt, add_context_from_internet = false, file_urls } = {}) => {
  const r = await apiFetch("/api/llm", { method: "POST", body: { prompt, add_context_from_internet, file_urls } });
  return r.text;
};

export const GenerateImage = async ({ prompt } = {}) => {
  const r = await apiFetch("/api/image", { method: "POST", body: { prompt } });
  return { url: r.url };
};

export const UploadFile = async ({ file } = {}) => {
  const fd = new FormData();
  fd.append("file", file);
  const r = await apiFetch("/api/upload", { method: "POST", body: fd, isFormData: true });
  return { file_url: r.file_url };
};

// Backwards-compatible exports
export const Core = {
  InvokeLLM,
  GenerateImage,
  UploadFile,
};
