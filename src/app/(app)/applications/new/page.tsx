"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import ApplicationTable from "@/components/applications/ApplicationTable";
import ApplicationFormDialog from "@/components/applications/ApplicationFormDialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export type ApplicationTabKey = "ALL" | "APPLIED" | "INTERVIEWING" | "CLOSED";

type ApplicationItem = {
    id: string | number;
    company?: string | null;
    companyName?: string | null;
    role?: string | null;
    jobTitle?: string | null;
    status?: string | null;
    location?: string | null;
    applied?: string | null;
    appliedDate?: string | null;
    applied_date?: string | null;
    next?: string | null;
    logoUrl?: string | null;
};

const tabs: { key: ApplicationTabKey; label: string }[] = [
    { key: "ALL", label: "ALL" },
    { key: "APPLIED", label: "APPLIED" },
    { key: "INTERVIEWING", label: "INTERVIEWING" },
    { key: "CLOSED", label: "CLOSED" },
];

function normalizeStatus(status?: string | null) {
    return (status || "").trim().toUpperCase();
}

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
    const router = useRouter();

    const [apps, setApps] = useState<ApplicationItem[]>([]);
    const [activeTab, setActiveTab] = useState<ApplicationTabKey>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const [totalCount, setTotalCount] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        resetAndLoad();
    }, [activeTab]);

    function newApplication() {
        router.push("/applications/new");
    }

    function mapTabToStatus(tab: ApplicationTabKey): string | undefined {
        if (tab === "ALL") return undefined;
        if (tab === "APPLIED") return "APPLIED";
        if (tab === "INTERVIEWING") return "INTERVIEWING";
        if (tab === "CLOSED") return "CLOSED";
        return undefined;
    }

    async function loadApplications(cursor?: string | null) {
        try {
            setLoading(true);

            const params: Record<string, string> = {
                limit: String(PAGE_SIZE),
            };

            const status = mapTabToStatus(activeTab);
            if (status) {
                params.status = status;
            }

            if (searchTerm.trim()) {
                params.company = searchTerm.trim();
            }

            if (cursor) {
                params.cursor = cursor;
            }

            const res = await api.listApplications(params);

            setApps(res.items);
            setTotalCount(res.totalCount);
            setNextCursor(res.nextCursor);
        } finally {
            setLoading(false);
        }
    }

    async function resetAndLoad() {
        setPage(1);
        setCursorStack([null]);
        await loadApplications(null);
    }

    async function handleSearch() {
        setPage(1);
        setCursorStack([null]);
        await loadApplications(null);
    }

    async function handlePrevPage() {
        if (page === 1) return;

        const prevPage = page - 1;
        const prevCursor = cursorStack[prevPage - 1] ?? null;

        setPage(prevPage);
        await loadApplications(prevCursor);
    }

    async function handleNextPage() {
        if (!nextCursor) return;

        const newStack = [...cursorStack, nextCursor];
        setCursorStack(newStack);
        setPage((p) => p + 1);
        await loadApplications(nextCursor);
    }

    function handleApplicationDeleted(appId: string | number) {
        setApps((prev) => prev.filter((item) => item.id !== appId));
        resetAndLoad();
    }

    const activeInterviewCount = useMemo(() => {
        return apps.filter((item) => {
            const status = normalizeStatus(item.status);
            return status === "INTERVIEW" || status === "INTERVIEWING";
        }).length;
    }, [apps]);

    const appliedCount = useMemo(() => {
        return apps.filter((item) => normalizeStatus(item.status) === "APPLIED").length;
    }, [apps]);

    const closedCount = useMemo(() => {
        return apps.filter((item) => {
            const status = normalizeStatus(item.status);
            return status === "REJECTED" || status === "CLOSED";
        }).length;
    }, [apps]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <h1 className="text-[44px] font-extrabold leading-none tracking-tight text-slate-900">
                        Applications
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#97e28c] px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#346d2a]">
                            {activeInterviewCount} Active Interviews
                        </span>

                        <span className="text-sm font-medium text-slate-500">
                            Total of {totalCount} applications submitted
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={newApplication}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#1652c8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1245a8]"
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                    </button>
                </div>
            </section>

            <section className="rounded-[12px] bg-[#eaf7ff] p-5 shadow-sm md:p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="grid w-full gap-3 md:w-auto md:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="flex items-center gap-1 rounded-2xl bg-[#eef7ff] p-1">
                            {tabs.map((tab) => {
                                const active = activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={[
                                            "rounded-xl px-5 py-2 text-xs font-bold tracking-[0.08em] transition",
                                            active
                                                ? "bg-white text-[#4a66d6] shadow-sm"
                                                : "text-slate-500 hover:text-slate-900",
                                        ].join(" ")}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                            <Search className="h-4 w-4 text-slate-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Search company"
                                className="border-0 bg-transparent px-3 py-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Applied: {appliedCount}</span>
                        <span>Closed: {closedCount}</span>
                    </div>
                </div>

                <ApplicationTable
                    data={apps}
                    tabKey={activeTab}
                    loading={loading}
                    currentPage={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    hasNextPage={Boolean(nextCursor)}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                    onRefresh={resetAndLoad}
                    onDeleted={handleApplicationDeleted}
                    onEdit={(item) => {
                        setEditingApp(item);
                        setEditOpen(true);
                    }}
                />
            </section>

            <ApplicationFormDialog
                open={editOpen}
                onOpenChange={(value) => setEditOpen(value)}
                mode="edit"
                initial={editingApp ?? undefined}
            />
        </div>
    );
}