"use client";

import Link from "next/link";
import { useState } from "react";
import type { Application } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import ApplicationFormDialog from "@/components/applications/ApplicationFormDialog";
import DeleteApplicationDialog from "@/components/applications/DeleteApplicationDialog";

export default function ApplicationTable({ data }: { data: Application[] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Application | undefined>(undefined);

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button onClick={() => setCreateOpen(true)}>+ New Application</Button>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-12 text-sm font-medium pb-2 border-b">
                    <div className="col-span-3">Company</div>
                    <div className="col-span-4">Role</div>

                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Applied</div>
                    <div className="col-span-1">Next</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y">
                    {data.map((a) => (

                        <div key={a.id} className="grid grid-cols-12 py-3 text-sm px-2 items-center">
                            <div className="col-span-3">{a.company}</div>
                            <Link href={`/applications/${a.id}`} className="col-span-4 font-medium hover:underline">
                                {a.role}
                            </Link>



                            <div className="col-span-1">
                                <Badge variant="secondary">{a.status}</Badge>
                            </div>

                            <div className="col-span-1">
                                {a.applied_date ? new Date(a.applied_date).toLocaleDateString() : "-"}
                            </div>
                            <div className="col-span-1">
                                {a.nextDate ? new Date(a.nextDate).toLocaleDateString() : "-"}
                            </div>

                            <div className="col-span-1 flex justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setEditing(a);
                                        setEditOpen(true);
                                    }}
                                >
                                    Edit
                                </Button>

                                <DeleteApplicationDialog appId={a.id} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Create dialog */}
            <ApplicationFormDialog open={createOpen} onOpenChange={setCreateOpen} mode="create" />

            {/* Edit dialog */}
            <ApplicationFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                mode="edit"
                initial={editing}
            />
        </div>
    );
}
