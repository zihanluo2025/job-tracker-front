"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { Application } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusStyle } from "@/lib/utils";

import ApplicationFormDialog from "@/components/applications/ApplicationFormDialog";
import DeleteApplicationDialog from "@/components/applications/DeleteApplicationDialog";

export default function ApplicationTable({ data }: { data: Application[] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Application | undefined>(undefined);

    // 🔥 分页状态
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // 🔥 总数统计
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // 🔥 当前页数据
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [page, data]);

    // 🔥 防止删除后出现空页
    // useEffect(() => {
    //     if (page > totalPages) {
    //         setPage(totalPages);
    //     }
    // }, [totalPages, page]);

    const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, total);

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button onClick={() => setCreateOpen(true)}>
                    + New Application
                </Button>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-12 text-sm font-medium pb-2 border-b">
                    <div className="col-span-3">Company</div>
                    <div className="col-span-4">Role</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Location</div>
                    <div className="col-span-1">Applied</div>
                    <div className="col-span-1">Next</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y">
                    {paginatedData.map((a) => (
                        <div
                            key={a.id}
                            className="grid grid-cols-12 py-3 text-sm px-2 items-center"
                        >
                            <div className="col-span-3">{a.company}</div>

                            <Link
                                href={`/applications/${a.id}`}
                                className="col-span-4 font-medium hover:underline"
                            >
                                {a.role}
                            </Link>

                            <div className="col-span-1">
                                <Badge className={getStatusStyle(a.status)}>
                                    {a.status}
                                </Badge>
                                {/* <Badge variant="secondary">{a.status}</Badge> */}
                            </div>

                            <div className="col-span-1">
                                {a.source || "-"}
                            </div>

                            <div className="col-span-1">
                                {a.applied_date
                                    ? new Date(a.applied_date).toLocaleDateString()
                                    : "-"}
                            </div>

                            <div className="col-span-1">
                                {a.next_date
                                    ? new Date(a.next_date).toLocaleDateString()
                                    : "-"}
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

                {/* 🔥 分页区域 */}
                <div className="flex justify-between items-center mt-4 text-sm">
                    <div>
                        Showing {startIndex}-{endIndex} of {total}
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </Button>

                        <span>
                            Page {page} of {totalPages}
                        </span>

                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>

            <ApplicationFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                mode="create"
            />

            <ApplicationFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                mode="edit"
                initial={editing}
            />
        </div>
    );
}
