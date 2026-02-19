"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Application, Company, ApplicationStatus } from "@/lib/types";
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


    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [companyId, setCompanyId] = useState<string>("");
    const [roleTitle, setRoleTitle] = useState("");
    const [status, setStatus] = useState<ApplicationStatus>("DRAFT");
    const [source, setSource] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [notesBrief, setNotesBrief] = useState("");

    // Load companies when dialog opens
    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                setLoadingCompanies(true);
                const list = await api.listCompanies();
                setCompanies(list);
            } finally {
                setLoadingCompanies(false);
            }
        })();
    }, [open]);

    // Init fields for edit/create
    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initial) {
            setCompanyId(String(initial.company?.id ?? ""));
            setRoleTitle(initial.role_title || "");
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
        return Boolean(companyId) && roleTitle.trim().length > 0 && !saving;
    }, [companyId, roleTitle, saving]);

    async function onSubmit() {
        if (!canSubmit) return;

        try {
            setSaving(true);

            if (mode === "create") {
                await api.createApplication({
                    company_id: Number(companyId),
                    role_title: roleTitle.trim(),
                    status,
                    source: source || null,
                    job_url: jobUrl || null,
                    notes_brief: notesBrief || null,
                });
                toast.success("Application created successfully");
            } else {
                if (!initial) return;
                await api.patchApplication(initial.id, {
                    company_id: Number(companyId),
                    role_title: roleTitle.trim(),
                    status,
                    source: source || null,
                    job_url: jobUrl || null,
                    notes_brief: notesBrief || null,
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
                        <Select
                            value={companyId}
                            onValueChange={setCompanyId}
                            disabled={loadingCompanies}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingCompanies ? "Loading..." : "Select a company"} />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!companies.length && !loadingCompanies ? (
                            <p className="text-xs text-muted-foreground">
                                No companies yet. 先在后端创建公司（或我下一步带你做 Company CRUD）。
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label>Role Title</Label>
                        <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g. Full Stack Developer" />
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
                            <Label>Source</Label>
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
