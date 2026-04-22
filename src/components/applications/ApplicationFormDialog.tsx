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

type FormInitial = Partial<Application> & {
    id?: string | number;
    company?: string | null;
    companyName?: string | null;
    role?: string | null;
    jobTitle?: string | null;
    status?: string | null;
    source?: string | null;
    location?: string | null;
    job_url?: string | null;
    notes_brief?: string | null;
    note?: string | null;
    applied_date?: string | null;
    appliedDate?: string | null;
    applied?: string | null;
    next_date?: string | null;
    next?: string | null;
};

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    mode: "create" | "edit";
    initial?: FormInitial;
    onSaved?: () => void | Promise<void>;
};


export default function ApplicationFormDialog({
    open,
    onOpenChange,
    mode,
    initial,
    onSaved,
}: Props) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState<ApplicationStatus>("DRAFT");
    const [location, setLocation] = useState("");
    const [source, setSource] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [notesBrief, setNotesBrief] = useState("");
    const [appliedDate, setAppliedDate] = useState("");
    const [nextDate, setNextDate] = useState("");


    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initial) {
            setCompany(initial.company || initial.companyName || "");
            setRole(initial.role || initial.jobTitle || "");
            setStatus((initial.status as ApplicationStatus) ?? "DRAFT");
            setLocation(initial.location || "");
            setSource(initial.source || "");
            setJobUrl(initial.job_url || "");
            setNotesBrief(initial.notes_brief || initial.note || "");
            setAppliedDate(
                initial.applied_date || initial.appliedDate || initial.applied || ""
            );
            setNextDate(initial.next_date || initial.next || "");
            return;
        }

        if (mode === "create") {
            setCompany("");
            setRole("");
            setStatus("DRAFT");
            setLocation("");
            setSource("");
            setJobUrl("");
            setNotesBrief("");
            setAppliedDate(getTodayDateString());
            setNextDate("");
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
                    location: location.trim() || null,
                    source: source.trim() || null,
                    job_url: jobUrl.trim() || null,
                    notes_brief: notesBrief.trim() || null,
                    applied_date: appliedDate || null,
                    next_date: nextDate || null,
                });
                toast.success("Application created successfully");
            } else {
                if (!initial || initial.id === undefined || initial.id === null) return;

                await api.patchApplication(initial.id, {
                    company: company.trim(),
                    role: role.trim(),
                    status,
                    location: location.trim() || null,
                    source: source.trim() || null,
                    job_url: jobUrl.trim() || null,
                    notes_brief: notesBrief.trim() || null,
                    applied_date: appliedDate || null,
                    next_date: nextDate || null,
                });
                toast.success("Application updated successfully");

            }

            onOpenChange(false);

            if (onSaved) {
                await onSaved();
            } else {
                router.refresh();
            }
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
                    <DialogTitle>
                        {mode === "create" ? "New Application" : "Edit Application"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. AWS"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Role Title</Label>
                        <Input
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Full Stack Developer"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Applied Date</Label>
                            <input
                                type="date"
                                value={appliedDate}
                                onChange={(e) => setAppliedDate(e.target.value)}
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Next Date</Label>
                            <input
                                type="date"
                                value={nextDate}
                                onChange={(e) => setNextDate(e.target.value)}
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as ApplicationStatus)}
                        >
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Adelaide / Sydney / Remote"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Source</Label>
                            <Input
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="LinkedIn / Seek / Referral"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Job URL</Label>
                        <Input
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Brief Notes</Label>
                        <Textarea
                            value={notesBrief}
                            onChange={(e) => setNotesBrief(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
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