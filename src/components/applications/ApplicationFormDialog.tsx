"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Application, ApplicationStatus } from "@/lib/types";
import { toast } from "sonner";
import { prettifyApiError } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    mode: "create" | "edit";
    initial?: Application; // required for edit
};

export default function ApplicationFormDialog({ open, onOpenChange, mode, initial }: Props) {
    const router = useRouter();



    const [saving, setSaving] = useState(false);

    // Form state
    const [company, setCompanyId] = useState("");
    const [role, setRoleTitle] = useState("");
    const [status, setStatus] = useState<ApplicationStatus>("DRAFT");
    const [source, setSource] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [notesBrief, setNotesBrief] = useState("");
    const [applied_date, setapplied_date] = useState("");
    const [next_date, setNextDate] = useState("");



    // Init fields for edit/create
    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initial) {
            setCompanyId(initial.company || "");
            setRoleTitle(initial.role || "");
            setStatus(initial.status);
            setSource(initial.source || "");
            setJobUrl(initial.job_url || "");
            setNotesBrief(initial.notes_brief || "");
        }

        if (mode === "create") {
            setCompanyId("");
            setRoleTitle("");
            setStatus("DRAFT");
            setSource("");
            setJobUrl("");
            setNotesBrief("");
        }
    }, [open, mode, initial]);

    const canSubmit = useMemo(() => {
        return company.trim().length > 0 && role.trim().length > 0 && !saving;
    }, [company, role, saving]);

    async function onSubmit() {
        if (!canSubmit) return;

        try {
            setSaving(true);

            if (mode === "create") {
                await api.createApplication({
                    company: company.trim(),
                    role: role.trim(),
                    status,
                    source: source || null,
                    job_url: jobUrl || null,
                    notes_brief: notesBrief || null,
                    applied_date: applied_date || null,
                    next_date: next_date || null,
                });
                toast.success("Application created successfully");
            } else {
                if (!initial) return;
                await api.patchApplication(initial.id, {
                    company: company.trim(),
                    role: role.trim(),
                    status,
                    source: source || null,
                    job_url: jobUrl || null,
                    notes_brief: notesBrief || null,
                    applied_date: applied_date || null,
                    next_date: next_date || null,
                });
                toast.success("Application updated successfully");
            }

            onOpenChange(false);
            router.refresh(); // re-fetch server component data
        } catch (e) {
            toast.error(prettifyApiError(e));

        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "New Application" : "Edit Application"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Input value={company} onChange={(e) => setCompanyId(e.target.value)} placeholder="e.g. AWS" />


                    </div>

                    <div className="space-y-2">
                        <Label>Role Title</Label>
                        <Input value={role} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g. Full Stack Developer" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Applied Date</label>
                            <input
                                type="date"
                                value={applied_date || ""}
                                onChange={(e) =>
                                    setapplied_date(e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Next Date</label>
                            <input
                                type="date"
                                value={next_date || ""}
                                onChange={(e) =>
                                    setNextDate(e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="LinkedIn / Seek / Referral" />
                        </div>
                        <div className="space-y-2">
                            <Label>Job URL</Label>
                            <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Brief Notes</Label>
                        <Textarea value={notesBrief} onChange={(e) => setNotesBrief(e.target.value)} className="min-h-[120px]" />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={!canSubmit}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
