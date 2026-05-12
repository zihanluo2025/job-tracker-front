"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

type ApplicationLike = {
    location?: string | null;
    applied_date?: string | null;
    createdAt?: string | null;
};

type Props = {
    apps: ApplicationLike[];
};

const COLORS = [
    "#7DA2FF",
    "#9B8CFF",
    "#67D5B5",
    "#FFB86B",
    "#FF8A8A",
    "#B6C2D1",
];

function parseDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
}

function startOfWeekMonday(date: Date) {
    const d = new Date(date);
    const day = d.getDay(); // Sun=0, Mon=1...
    const diff = day === 0 ? -6 : 1 - day;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + diff);
    return d;
}

function endOfWeekSunday(start: Date) {
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getApplicationDate(app: ApplicationLike) {
    return parseDate(app.applied_date) || parseDate(app.createdAt);
}

function normalizeLocation(input?: string | null): string {
    if (!input || !input.trim()) return "Unknown";

    const value = input.trim().toLowerCase();

    if (["unknown", "n/a", "na", "-", "--"].includes(value)) {
        return "Unknown";
    }

    if (
        value.includes("remote") ||
        value.includes("work from home") ||
        value.includes("wfh") ||
        value.includes("anywhere")
    ) {
        return "Remote";
    }

    if (value.includes("hybrid")) {
        return "Hybrid";
    }

    if (value.includes("adelaide")) return "Adelaide";
    if (value.includes("sydney")) return "Sydney";
    if (value.includes("melbourne")) return "Melbourne";
    if (value.includes("brisbane")) return "Brisbane";
    if (value.includes("perth")) return "Perth";
    if (value.includes("canberra")) return "Canberra";
    if (value.includes("hobart")) return "Hobart";
    if (value.includes("darwin")) return "Darwin";

    return "Other";
}

function buildLocationChartData(apps: ApplicationLike[]) {
    const counter = new Map<string, number>();

    for (const app of apps) {
        const normalized = normalizeLocation(app.location);
        counter.set(normalized, (counter.get(normalized) || 0) + 1);
    }

    const sorted = Array.from(counter.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    const restTotal = rest.reduce((sum, item) => sum + item.value, 0);

    if (restTotal > 0) {
        const existingOther = top.find((item) => item.name === "Other");
        if (existingOther) {
            existingOther.value += restTotal;
        } else {
            top.push({ name: "Other", value: restTotal });
        }
    }

    return top;
}

export default function WeeklyLocationPieChart({ apps }: Props) {
    const [weekOffset, setWeekOffset] = useState(0);

    const currentWeekStart = useMemo(() => {
        const today = new Date();
        const start = startOfWeekMonday(today);
        return addDays(start, weekOffset * 7);
    }, [weekOffset]);

    const currentWeekEnd = useMemo(() => {
        return endOfWeekSunday(currentWeekStart);
    }, [currentWeekStart]);

    const currentWeekApps = useMemo(() => {
        return apps.filter((app) => {
            const date = getApplicationDate(app);
            if (!date) return false;
            return date >= currentWeekStart && date <= currentWeekEnd;
        });
    }, [apps, currentWeekStart, currentWeekEnd]);

    const chartData = useMemo(() => {
        return buildLocationChartData(currentWeekApps);
    }, [currentWeekApps]);

    const totalThisWeek = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-lg border border-[#E6ECF5] bg-white p-6 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                        Applications by Location
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#0F172A]">
                        Location Distribution
                    </h3>
                    <p className="mt-1 text-sm text-[#64748B]">
                        {totalThisWeek} applications in this week
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setWeekOffset((prev) => prev - 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6ECF5] bg-white text-[#64748B] transition hover:bg-[#F5F8FF] hover:text-[#4F7CFF]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="inline-flex h-10 min-w-[220px] items-center justify-center rounded-xl border border-[#E6ECF5] bg-white px-4 text-sm font-medium text-[#0F172A]">
                        {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
                    </div>

                    <button
                        type="button"
                        onClick={() => setWeekOffset((prev) => prev + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6ECF5] bg-white text-[#64748B] transition hover:bg-[#F5F8FF] hover:text-[#4F7CFF]"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="h-[340px]">
                {chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-2xl bg-[#F8FBFF] text-sm text-[#64748B]">
                        No application data for this week
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid #E6ECF5",
                                    backgroundColor: "#FFFFFF",
                                    color: "#0F172A",
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ color: "#64748B", fontSize: "13px" }}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                outerRadius={110}
                                innerRadius={58}
                                paddingAngle={3}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.name}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}