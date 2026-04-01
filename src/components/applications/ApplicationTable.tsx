"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import type { ApplicationTabKey } from "@/app/(app)/applications/page";

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
    logoUrl?: string | null;
};

type Props = {
    data: ApplicationItem[];
    tabKey: ApplicationTabKey;
    loading?: boolean;
    onRefresh?: () => void;
};

const PAGE_SIZE = 4;

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
}: Props) {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [tabKey]);

    const filteredData = useMemo(() => {
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

    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const pagedData = filteredData.slice(start, start + PAGE_SIZE);

    function prevPage() {
        setPage((p) => Math.max(1, p - 1));
    }

    function nextPage() {
        setPage((p) => Math.min(totalPages, p + 1));
    }

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
                {pagedData.length === 0 ? (
                    <div className="rounded-[20px] bg-white px-6 py-10 text-center text-sm text-slate-500">
                        No applications found.
                    </div>
                ) : (
                    pagedData.map((item) => {
                        const company = item.company || item.companyName || "Unknown Company";
                        const role = item.role || item.jobTitle || "Unknown Role";
                        const status = mapStatus(item.status);
                        const appliedDate = formatDate(item.applied || item.appliedDate);

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

                                <div className="flex items-center justify-end">
                                    <button className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm italic text-slate-400">
                    Viewing {pagedData.length} of {filteredData.length} applications
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={prevPage}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        const active = pageNumber === page;

                        return (
                            <button
                                key={pageNumber}
                                onClick={() => setPage(pageNumber)}
                                className={[
                                    "h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition",
                                    active
                                        ? "bg-white text-[#4a66d6] shadow-sm"
                                        : "text-slate-400 hover:bg-white hover:text-slate-700",
                                ].join(" ")}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}

                    <button
                        onClick={nextPage}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}