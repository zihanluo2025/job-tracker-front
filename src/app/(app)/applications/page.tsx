"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import ApplicationTable from "@/components/applications/ApplicationTable";

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
    next?: string | null;
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

export default function ApplicationsPage() {
    const [apps, setApps] = useState<ApplicationItem[]>([]);
    const [activeTab, setActiveTab] = useState<ApplicationTabKey>("ALL");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        try {
            setLoading(true);
            const res = await api.listApplications();
            setApps(res);
        } finally {
            setLoading(false);
        }
    }

    const totalCount = apps.length;

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
        <div className="space-y-8">
            {/* Header */}
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
                    <button className="inline-flex items-center gap-2 rounded-2xl bg-[#1652c8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1245a8]">
                        <Plus className="h-4 w-4" />
                        Add New
                    </button>
                </div>
            </section>

            {/* Tabs + Table */}
            <section className="rounded-[28px] bg-[#eaf7ff] p-5 shadow-sm md:p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="rounded-2xl bg-[#eef7ff] p-1">
                        <div className="flex items-center gap-1">
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
                    onRefresh={loadApplications}
                />
            </section>
        </div>
    );
}