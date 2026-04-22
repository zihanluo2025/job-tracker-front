"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApplicationTabKey } from "@/app/(app)/applications/page";
import DeleteApplicationDialog from "@/components/applications/DeleteApplicationDialog";

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

type Props = {
    data: ApplicationItem[];
    tabKey: ApplicationTabKey;
    loading?: boolean;
    onRefresh?: () => void;
    onDeleted?: (appId: string | number) => void;
    onEdit?: (item: ApplicationItem) => void;

    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPrevPage: () => void;
    onNextPage: () => void;
};

function normalizeStatus(status?: string | null) {
    return (status || "").trim().toUpperCase();
}

function mapStatus(status?: string | null) {
    const value = normalizeStatus(status);

    if (value === "INTERVIEW") return "INTERVIEWING";
    if (value === "REJECTED") return "CLOSED";
    if (value === "OFFER") return "OFFERED";
    return value || "APPLIED";
}

function getStatusClass(status: string) {
    switch (status) {
        case "APPLIED":
            return "bg-[#dfe6ff] text-[#5570d8]";
        case "INTERVIEWING":
            return "bg-[#f8dcc3] text-[#ae6d2f]";
        case "OFFERED":
            return "bg-[#cff0bf] text-[#5c9b45]";
        case "CLOSED":
            return "bg-[#e9edf4] text-[#7b8794]";
        case "PENDING":
            return "bg-[#fde8c8] text-[#a66a14]";
        default:
            return "bg-slate-100 text-slate-600";
    }
}

function formatDate(input?: string | null) {
    if (!input) return "-";
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return input;

    return date.toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getInitial(name?: string | null) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase() || "A";
}

export default function ApplicationTable({
    data,
    tabKey,
    loading = false,
    onRefresh,
    onDeleted,
    onEdit,
    currentPage,
    totalPages,
    totalCount,
    onPrevPage,
    onNextPage,
}: Props) {
    const filteredData = useMemo(() => {
        // 这里保留兼容逻辑，但正常情况下后端已经按 tab 过滤了
        if (tabKey === "ALL") return data;

        if (tabKey === "APPLIED") {
            return data.filter((item) => normalizeStatus(item.status) === "APPLIED");
        }

        if (tabKey === "INTERVIEWING") {
            return data.filter((item) => {
                const status = normalizeStatus(item.status);
                return status === "INTERVIEW" || status === "INTERVIEWING";
            });
        }

        if (tabKey === "CLOSED") {
            return data.filter((item) => {
                const status = normalizeStatus(item.status);
                return status === "REJECTED" || status === "CLOSED";
            });
        }

        return data;
    }, [data, tabKey]);

    if (loading) {
        return (
            <div className="rounded-[20px] bg-white px-6 py-10 text-center text-sm text-slate-500">
                Loading applications...
            </div>
        );
    }

    return (
        <div>
            <div className="hidden grid-cols-[1.3fr_1.5fr_1fr_1fr_56px] gap-6 px-5 pb-4 pt-2 md:grid">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Company
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Role
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Status
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Date Applied
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Actions
                </div>
            </div>

            <div className="space-y-4">
                {filteredData.length === 0 ? (
                    <div className="rounded-[20px] bg-white px-6 py-10 text-center text-sm text-slate-500">
                        No applications found.
                    </div>
                ) : (
                    filteredData.map((item) => {
                        const company = item.company || item.companyName || "Unknown Company";
                        const role = item.role || item.jobTitle || "Unknown Role";
                        const status = mapStatus(item.status);
                        const appliedDate = formatDate(
                            item.applied_date || item.appliedDate || item.applied
                        );

                        return (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 gap-4 rounded-[20px] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:grid-cols-[1.3fr_1.5fr_1fr_1fr_56px] md:items-center md:gap-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f4ec] text-sm font-bold text-slate-700">
                                        {getInitial(company)}
                                    </div>

                                    <div>
                                        <p className="text-base font-bold text-slate-900">{company}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-800">{role}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {item.location || "Location not specified"}
                                    </p>
                                </div>

                                <div>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${getStatusClass(
                                            status
                                        )}`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                <div className="text-sm font-semibold text-slate-600">
                                    {appliedDate}
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onEdit?.(item)}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        Edit
                                    </button>

                                    <DeleteApplicationDialog
                                        appId={item.id}
                                        onDeleted={(id) => {
                                            onDeleted?.(id);
                                            onRefresh?.();
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm italic text-slate-400">
                    Page {currentPage} of {totalPages} · Showing {filteredData.length} of {totalCount} applications
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevPage}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button className="h-9 min-w-9 rounded-xl bg-white px-3 text-sm font-semibold text-[#4a66d6] shadow-sm">
                        {currentPage}
                    </button>

                    <button
                        onClick={onNextPage}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}