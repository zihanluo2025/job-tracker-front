"use client";

import { useMemo, useState } from "react";
import { Application } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ApplicationOverviewTab from "./ApplicationOverviewTab";


export default function ApplicationJdTab({
    app,
    onUpdated,
}: {
    app: Application;
    onUpdated: (a: Application) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [jdUrl, setJdUrl] = useState(app.jd_url || "");
    const [jdText, setJdText] = useState(app.jd_text || "");

    const hasChanges = useMemo(() => {
        return (app.jd_url || "") !== jdUrl || (app.jd_text || "") !== jdText;
    }, [app.jd_url, app.jd_text, jdUrl, jdText]);

    async function save() {
        try {
            setSaving(true);
            const updated = await api.patchApplication(app.id, {
                jd_url: jdUrl || null,
                jd_text: jdText || null,
            });
            onUpdated(updated);
            setIsEditing(false);
        } finally {
            setSaving(false);
        }
    }

    function cancel() {
        setJdUrl(app.jd_url || "");
        setJdText(app.jd_text || "");
        setIsEditing(false);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit JD</Button>
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

            <div className="space-y-2">
                <div className="text-sm font-medium">JD Link</div>
                {isEditing ? (
                    <Input value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} placeholder="https://..." />
                ) : (
                    <div className="text-sm">
                        {app.jd_url ? (
                            <a className="underline" href={app.jd_url} target="_blank" rel="noreferrer">
                                {app.jd_url}
                            </a>
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
                    </div>
                )}
            </div>

            <Separator />

            <div className="space-y-2">
                <div className="text-sm font-medium">JD Content</div>

                {isEditing ? (
                    <Textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste job description here..."
                        className="min-h-[260px]"
                    />
                ) : (
                    <ScrollArea className="h-[320px] rounded-md border p-3">
                        <div className="whitespace-pre-wrap text-sm">
                            {app.jd_text ? app.jd_text : <span className="text-muted-foreground">-</span>}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
