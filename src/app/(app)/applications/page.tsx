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
    { key: "INTERVIEWING", label: "INTERVIEWING" },
    { key: "CLOSED", label: "CLOSED" },
];

function normalizeStatus(status?: string | null) {
    return (status || "").trim().toUpperCase();
}

const PAGE_SIZE = 5;

export default function ApplicationsPage() {
    const router = useRouter();

    const [apps, setApps] = useState<ApplicationItem[]>([]);
    const [activeTab, setActiveTab] = useState<ApplicationTabKey>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);

    const [editOpen, setEditOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

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

    async function loadApplications(targetPage = 1) {
        try {
            setLoading(true);

            const params: Record<string, string> = {
                limit: String(PAGE_SIZE),
                page: String(targetPage),
            };

            const status = mapTabToStatus(activeTab);
            if (status) {
                params.status = status;
            }

            if (searchTerm.trim()) {
                params.q = searchTerm.trim();
            }

            const res = await api.listApplications(params);

            setApps(res.items);
            setPage(res.currentPage);
            setTotalCount(res.totalCount);
            setTotalPages(res.totalPages);
        } finally {
            setLoading(false);
        }
    }

    async function resetAndLoad() {
        await loadApplications(1);
    }

    async function handleSearch() {
        await loadApplications(1);
    }

    async function handlePrevPage() {
        if (page <= 1) return;
        await loadApplications(page - 1);
    }

    async function handleNextPage() {
        if (page >= totalPages) return;
        await loadApplications(page + 1);
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

    return (
        <div className="space-y-6">
            <section className="space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                    <div className="relative min-w-0 flex-1 lg:max-w-[520px]">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="Search applications, roles, or companies..."
                            className="h-12 rounded-lg border border-[#D9E4F2] bg-[#DFF2FF] pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={newApplication}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#1652C8] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(22,82,200,0.22)] transition hover:bg-[#1245A8]"
                        >
                            <Plus className="h-4 w-4" />
                            Add New
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-[46px] font-extrabold leading-none tracking-tight text-slate-900">
                            Applications
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#B8F0A8] px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2E7D32]">
                                {activeInterviewCount} Active Interviews
                            </span>

                            <span className="text-sm font-medium text-slate-500">
                                Total of {totalCount} applications submitted
                            </span>
                        </div>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-[#DFF2FF] p-2 xl:w-auto">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={[
                                        "rounded-xl px-8 py-3 text-sm font-bold tracking-[0.08em] transition",
                                        active
                                            ? "bg-white text-[#255FD5] shadow-sm"
                                            : "text-slate-500 hover:text-slate-900",
                                    ].join(" ")}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="rounded-[12px] border border-[#E6ECF5] bg-[#EAF7FF] p-5 shadow-[0_6px_18px_rgba(15,23,42,0.04)] md:p-6">
                <ApplicationTable
                    data={apps}
                    tabKey={activeTab}
                    loading={loading}
                    currentPage={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
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