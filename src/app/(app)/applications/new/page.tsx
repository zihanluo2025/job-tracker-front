"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Link2,
    Loader2,
} from "lucide-react";

import { api } from "@/lib/api";

type ApplicationStatus =
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW"
    | "OFFER"
    | "REJECTED";

type FormValues = {
    company: string;
    role: string;
    applied_date: string;
    location: string;
    next_date: string;
    status: ApplicationStatus;
    source: string;
    job_url: string;
    note: string;
};


export default function NewApplicationPage() {
    const router = useRouter();


    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    const [form, setForm] = useState<FormValues>({
        company: "",
        role: "",
        applied_date: getTodayDateString(),
        location: "",
        next_date: "",
        status: "APPLIED",
        source: "",
        job_url: "",
        note: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.company.trim()) {
            setError("Company name is required.");
            return;
        }

        if (!form.role.trim()) {
            setError("Role is required.");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            await api.createApplication({
                company: form.company.trim(),
                role: form.role.trim(),
                status: form.status,
                location: form.location.trim() || null,
                source: form.source.trim() || null,
                job_url: form.job_url.trim() || null,
                applied_date: form.applied_date || null,
                next_date: form.next_date || null,
                notes_brief: form.note.trim() || null,
            });

            router.push("/applications");
            router.refresh();
        } catch (err) {
            console.error("Failed to create application:", err);
            setError("Failed to save application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <Link href="/applications" className="transition hover:text-slate-600">
                        Applications
                    </Link>
                    <span>/</span>
                    <span className="text-[#1D62F0]">New Entry</span>
                </div>

                <div className="mb-10 max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Add Application
                    </h1>
                    {/* <p className="mt-3 text-lg leading-8 text-slate-600">
                        Enter the details of your latest career opportunity.
                    </p> */}
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="rounded-[28px] border border-[#D9E8F8] bg-[#EAF5FF] p-6 shadow-sm md:p-8">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <Field>
                                        <Label>Company Name</Label>
                                        <Input
                                            value={form.company}
                                            onChange={(e) => updateField("company", e.target.value)}
                                            placeholder="e.g. Goldman Sachs"
                                        />
                                    </Field>

                                    <Field>
                                        <Label>Role</Label>
                                        <Input
                                            value={form.role}
                                            onChange={(e) => updateField("role", e.target.value)}
                                            placeholder="e.g. Full Stack Developer"
                                        />
                                    </Field>
                                    <Field>
                                        <Label>Location</Label>
                                        <Input
                                            value={form.location}
                                            onChange={(e) => updateField("location", e.target.value)}
                                            placeholder="e.g. Adelaide / Sydney / Remote"
                                        />
                                    </Field>
                                    {/* 
                                    <Field>
                                        <Label>Applied Date</Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={form.applied_date}
                                                onChange={(e) => updateField("applied_date", e.target.value)}
                                            />
                                            <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                        </div>
                                    </Field> */}

                                    {/* <Field>
                                        <Label>Next Follow-up Date</Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={form.next_date}
                                                onChange={(e) => updateField("next_date", e.target.value)}
                                            />
                                            <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                        </div>
                                    </Field> */}

                                    {/* <Field>
                                        <Label>Current Status</Label>
                                        <div className="relative">
                                            <select
                                                value={form.status}
                                                onChange={(e) =>
                                                    updateField("status", e.target.value as ApplicationStatus)
                                                }
                                                className="h-12 w-full appearance-none rounded-xl border border-transparent bg-[#D6EAF8] px-4 text-[15px] font-medium text-slate-700 outline-none transition focus:border-[#1D62F0] focus:bg-white"
                                            >
                                                <option value="APPLIED">Applied</option>
                                                <option value="SCREENING">Screening</option>
                                                <option value="INTERVIEW">Interview</option>
                                                <option value="OFFER">Offer</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                        </div>
                                    </Field> */}

                                    <div className="md:col-span-2">
                                        <Field>
                                            <Label>Job URL</Label>
                                            <div className="flex h-12 overflow-hidden rounded-xl border border-transparent bg-[#D6EAF8] transition focus-within:border-[#1D62F0] focus-within:bg-white">
                                                <div className="flex w-12 items-center justify-center border-r border-white/50 text-slate-500">
                                                    <Link2 className="h-4 w-4" />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={form.job_url}
                                                    onChange={(e) => updateField("job_url", e.target.value)}
                                                    placeholder="https://linkedin.com/jobs/..."
                                                    className="flex-1 bg-transparent px-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
                                                />
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field>
                                            <Label>Notes</Label>
                                            <textarea
                                                value={form.note}
                                                onChange={(e) => updateField("note", e.target.value)}
                                                placeholder="Add recruiter name, follow-up plan, salary notes, interview feedback..."
                                                className="min-h-[120px] w-full rounded-xl border border-transparent bg-[#D6EAF8] px-4 py-3 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1D62F0] focus:bg-white"
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            ) : null}

                            <div className="flex flex-col-reverse items-center justify-center gap-4 sm:flex-row sm:justify-end">
                                <Link
                                    href="/applications"
                                    className="inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-full bg-[#0950D0] px-8 text-base font-semibold text-white shadow-[0_10px_24px_rgba(9,80,208,0.25)] transition hover:bg-[#0A47B7] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Application"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[24px] bg-[#0950D0] p-7 text-white shadow-sm">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                            <h3 className="text-3xl font-semibold leading-tight">Keep the Momentum</h3>
                            <p className="mt-4 text-base leading-7 text-blue-100">
                                Recording every application helps identify patterns in your interview
                                pipeline.
                            </p>
                        </div>

                        <div className="rounded-[24px] bg-[#DDF2FF] p-6 shadow-sm">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                Pipeline Tip
                            </p>

                            <div className="space-y-4">
                                <TipItem text="Include the recruiter’s name in notes after saving." />
                                <TipItem text="Set a follow-up reminder for 7 days from today." />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-500 via-slate-800 to-blue-900 p-6 shadow-sm">
                            <div className="flex h-[180px] items-end justify-center text-sm text-white/80">
                                Workspace Illustration
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ children }: { children: React.ReactNode }) {
    return <div className="space-y-3">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
            {children}
        </label>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="h-12 w-full rounded-xl border border-transparent bg-[#D6EAF8] px-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1D62F0] focus:bg-white"
        />
    );
}

function TipItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm leading-6 text-slate-600">{text}</p>
        </div>
    );
}