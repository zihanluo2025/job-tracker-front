export type ApplicationStatus =
  | "DRAFT"
  | "APPLIED"
  | "SCREENING"
  | "TECH"
  | "ONSITE"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export type Company = {
  id: number;
  name: string;
  website?: string | null;
};



export type Application = {
  id: number;
  company: Company;

  role_title: string;
  status: ApplicationStatus;

  source?: string | null;
  job_url?: string | null;
  applied_date?: string | null; // ISO string
  notes_brief?: string | null;

  jd_url?: string | null;
  jd_text?: string | null;
  jd_updated_at?: string | null;
};

