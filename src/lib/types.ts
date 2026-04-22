export type ApplicationStatus =
  | "DRAFT"
  | "APPLIED"
  | "SCREENING"
  | "TECH"
  | "ONSITE"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";





export type Application = {
  id: string | number;
  company?: string | null;
  role?: string | null;
  status?: ApplicationStatus | string | null;
  source?: string | null;
  location?: string | null;
  job_url?: string | null;
  note?: string | null;
  notes_brief?: string | null;
  applied_date?: string | null;
  next_date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

