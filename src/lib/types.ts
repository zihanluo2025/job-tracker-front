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
  id: number;
  company: string;

  role: string;
  status: ApplicationStatus;

  source?: string | null;
  job_url?: string | null;
  applied_date?: string | null; // ISO string
  appliedDate: string | null; // ISO string, for backward compatibility
  notes_brief?: string | null;

  jd_url?: string | null;
  jd_text?: string | null;
  jd_updated_at?: string | null;
  next_date?: string | null; // ISO string
  nextDate: string | null; // ISO string, for backward compatibility

};

