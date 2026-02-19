import type { Application, Company } from "@/lib/types";

console.log("NEXT_PUBLIC_API_BASE =", process.env.NEXT_PUBLIC_API_BASE_URL);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * request<T>
 * - GET/HEAD: do NOT send Content-Type (avoid triggering CORS preflight)
 * - POST/PUT/PATCH: if body exists and Content-Type not set, set to application/json
 * - merge user-provided init.headers
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();

  // Merge headers safely
  const headers = new Headers(init.headers);

  // Detect whether request has a body
  const hasBody =
    init.body !== undefined &&
    init.body !== null &&
    !(typeof init.body === "string" && init.body.length === 0);

  // Only set JSON content-type when we actually send a body
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Force remove content-type for GET/HEAD to avoid preflight
  if (method === "GET" || method === "HEAD") {
    headers.delete("Content-Type");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    cache: "no-store",
  });

  console.log(res, "res", "API_BASE", API_BASE, "path", path);

  // Handle non-2xx
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // Handle 204 No Content (e.g. DELETE)
  if (res.status === 204) {
    return undefined as T;
  }

  // Some APIs may return empty body with 200/201 as well
  const text = await res.text().catch(() => "");
  if (!text) {
    return undefined as T;
  }

  // Parse JSON
  return JSON.parse(text) as T;
}

export const api = {
  // --- Companies ---
  listCompanies: () => request<Company[]>(`/companies`),

  // --- Applications ---
  listApplications: async (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    const res = await request<{ ok: boolean; items: Application[] }>(
      `/applications${qs}`
    );
    return res.items;
  },

  getApplication: (id: string | number) =>
    request<Application>(`/applications/${id}`),

  createApplication: (payload: {
    company: number;
    role: string;
    status: string;
    source?: string | null;
    job_url?: string | null;
    applied_date?: string | null;
    next_date?: string | null;
    notes_brief?: string | null;
    jd_url?: string | null;
    jd_text?: string | null;
  }) =>
    request<Application>(`/applications`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  patchApplication: (
    id: string | number,
    payload: Partial<Application> & { company_id?: number }
  ) =>
    request<Application>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteApplication: (id: string | number) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),
};
