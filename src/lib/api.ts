import type { Application, Company } from "@/lib/types";
import { log } from "console";

console.log("NEXT_PUBLIC_API_BASE =", process.env.NEXT_PUBLIC_API_BASE_URL);


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  console.log(res,"res", "API_BASE", API_BASE, "path", path);
  

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

  return JSON.parse(text) as T;
}


export const api = {
  // --- Companies ---
  listCompanies: () => request<Company[]>(`/companies`),

  // --- Applications ---
listApplications: async (params?: Record<string, string>) => {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await request<{ ok: boolean; items: Application[] }>(`/applications${qs}`);
  return res.items;
},

  getApplication: (id: string | number) =>
    request<Application>(`/applications/${id}`),

  createApplication: (payload: {
    company_id: number;
    role_title: string;
    status: string;
    source?: string | null;
    job_url?: string | null;
    applied_date?: string | null;
    notes_brief?: string | null;
    jd_url?: string | null;
    jd_text?: string | null;
  }) =>
    request<Application>(`/applications`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  patchApplication: (id: string | number, payload: Partial<Application> & { company_id?: number }) =>
    request<Application>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteApplication: (id: string | number) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),
};
