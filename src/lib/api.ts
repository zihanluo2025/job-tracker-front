import type { Application } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();

  const headers = new Headers(init.headers);

  const hasBody =
    init.body !== undefined &&
    init.body !== null &&
    !(typeof init.body === "string" && init.body.length === 0);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (method === "GET" || method === "HEAD") {
    headers.delete("Content-Type");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text().catch(() => "");
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export type ListApplicationsResponse = {
  ok: boolean;
  items: Application[];
  pageSize: number;
  currentPage: number;
  returnedCount: number;
  totalCount: number;
  totalPages: number;
};

export const api = {
  listApplications: async (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<ListApplicationsResponse>(`/applications${qs}`);
  },

  getApplication: async (id: string | number) => {
    const res = await request<{ ok: boolean; item: Application }>(`/applications/${id}`);
    return res.item;
  },

  createApplication: async (payload: {
    company: string;
    role: string;
    job_title?: string | null;
    status: string;
    source?: string | null;
    job_url?: string | null;
    applied_date?: string | null;
    location?: string | null;
    next_date?: string | null;
    notes_brief?: string | null;
    jd_url?: string | null;
    jd_text?: string | null;
  }) => {
    const body = {
      company: payload.company,
      role: payload.role,
      status: payload.status,
      source: payload.source ?? "",
      location: payload.location ?? null,
      job_url: payload.job_url ?? null,
      applied_date: payload.applied_date ?? null,
      next_date: payload.next_date ?? null,
      note: payload.notes_brief ?? "",
    };

    const res = await request<{ ok: boolean; item: Application }>(`/applications`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return res.item;
  },

  patchApplication: async (
    id: string | number,
    payload: Partial<Application> & {
      company?: string;
      role?: string;
      notes_brief?: string | null;
      location?: string | null;
      
    }
  ) => {
    const body: Record<string, unknown> = { ...payload };

    if ("notes_brief" in body) {
      body.note = body.notes_brief;
      delete body.notes_brief;
    }

    const res = await request<{ ok: boolean; item: Application }>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return res.item;
  },

  deleteApplication: (id: string | number) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),
};