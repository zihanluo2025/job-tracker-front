"use client";

import { useMemo, useState } from "react";
import { Application, ApplicationStatus } from "@/lib/types";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/**
 * Overview tab for a single application.
 * - Shows core fields (status/source/url/applied_date/brief notes)
 * - Supports inline edit + save via PATCH
 */
export default function ApplicationOverviewTab({
    app,
    onUpdated,
}: {
    app: Application;
    onUpdated: (a: Application) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Local draft state for editing
    const [status, setStatus] = useState<ApplicationStatus>(app.status);
    const [source, setSource] = useState(app.source || "");
    const [jobUrl, setJobUrl] = useState(app.job_url || "");
    const [appliedDate, setAppliedDate] = useState(toDateInputValue(app.applied_date));
    const [notesBrief, setNotesBrief] = useState(app.notes_brief || "");

    const hasChanges = useMemo(() => {
        const originalDate = toDateInputValue(app.applied_date);
        return (
            status !== app.status ||
            source !== (app.source || "") ||
            jobUrl !== (app.job_url || "") ||
            appliedDate !== originalDate ||
            notesBrief !== (app.notes_brief || "")
        );
    }, [app, status, source, jobUrl, appliedDate, notesBrief]);

    function resetDraft() {
        setStatus(app.status);
        setSource(app.source || "");
        setJobUrl(app.job_url || "");
        setAppliedDate(toDateInputValue(app.applied_date));
        setNotesBrief(app.notes_brief || "");
    }

    async function save() {
        try {
            setSaving(true);

            // Convert date input (YYYY-MM-DD) -> ISO string (UTC midnight)
            const appliedDateIso = appliedDate ? new Date(`${appliedDate}T00:00:00.000Z`).toISOString() : null;

            const updated = await api.patchApplication(app.id, {
                status,
                source: source || null,
                job_url: jobUrl || null,
                applied_date: appliedDateIso,
                notes_brief: notesBrief || null,
            });

            onUpdated(updated);
            setIsEditing(false);
        } finally {
            setSaving(false);
        }
    }

    function cancel() {
        resetDraft();
        setIsEditing(false);
    }

    return (
        <div className="space-y-4">
            {/* Header actions */}
            <div className="flex items-center gap-2">
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                ) : (
                    <>
                        <Button onClick={save} disabled={!hasChanges || saving}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="secondary" onClick={cancel} disabled={saving}>
                            Cancel
                        </Button>
                    </>
                )}
            </div>

            {/* Summary card */}
            <Card className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">{app.role}</div>
                        <div className="text-sm text-muted-foreground">{app.company}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{isEditing ? status : app.status}</Badge>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <Field label="Status">
                        {isEditing ? (
                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm">{app.status}</div>
                        )}
                    </Field>

                    {/* Applied date */}
                    <Field label="Applied Date">
                        {isEditing ? (
                            <Input
                                type="date"
                                value={appliedDate}
                                onChange={(e) => setAppliedDate(e.target.value)}
                            />
                        ) : (
                            <div className="text-sm">
                                {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : "-"}
                            </div>
                        )}
                    </Field>

                    {/* Source */}
                    <Field label="Source">
                        {isEditing ? (
                            <Input
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="e.g. LinkedIn / Seek / Referral"
                            />
                        ) : (
                            <div className="text-sm">{app.source || "-"}</div>
                        )}
                    </Field>

                    {/* Job URL */}
                    <Field label="Job URL">
                        {isEditing ? (
                            <Input
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        ) : app.job_url ? (
                            <a className="text-sm underline" href={app.job_url} target="_blank" rel="noreferrer">
                                Open link
                            </a>
                        ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                        )}
                    </Field>
                </div>

                <Separator />

                {/* Brief notes */}
                <div className="space-y-2">
                    <Label>Brief Notes</Label>
                    {isEditing ? (
                        <Textarea
                            value={notesBrief}
                            onChange={(e) => setNotesBrief(e.target.value)}
                            placeholder="Short notes about this application..."
                            className="min-h-[120px]"
                        />
                    ) : (
                        <div className="text-sm whitespace-pre-wrap">
                            {app.notes_brief ? app.notes_brief : <span className="text-muted-foreground">-</span>}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

/** Simple labeled field wrapper */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

const STATUS_OPTIONS: ApplicationStatus[] = [
    "DRAFT",
    "APPLIED",
    "SCREENING",
    "TECH",
    "ONSITE",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
];

/**
 * Convert ISO date string to <input type="date"> value (YYYY-MM-DD).
 */
function toDateInputValue(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
