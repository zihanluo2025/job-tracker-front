"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    BarChart,
    Bar,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type ApplicationLike = {
    applied_date?: string | null;
    createdAt?: string | null;
};

type Props = {
    apps: ApplicationLike[];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export default function WeeklyApplicationsChart({ apps }: Props) {
    const [weekOffset, setWeekOffset] = useState(0);

    const currentWeekStart = useMemo(() => {
        const today = new Date();
        const start = startOfWeekMonday(today);
        return addDays(start, weekOffset * 7);
    }, [weekOffset]);

    const currentWeekEnd = useMemo(() => {
        return endOfWeekSunday(currentWeekStart);
    }, [currentWeekStart]);

    const chartData = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];

        for (const app of apps) {
            const date = getApplicationDate(app);
            if (!date) continue;

            if (date < currentWeekStart || date > currentWeekEnd) continue;

            const jsDay = date.getDay(); // Sun=0
            const index = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 ... Sun=6
            counts[index] += 1;
        }

        return DAY_LABELS.map((label, index) => ({
            day: label,
            count: counts[index],
        }));
    }, [apps, currentWeekStart, currentWeekEnd]);

    const totalThisWeek = chartData.reduce((sum, item) => sum + item.count, 0);
    const isCurrentWeek = weekOffset === 0;

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Weekly Applications
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {/* <p className="mt-2 text-sm text-[#64748B]"> */}
                        {totalThisWeek} applications this week
                        {/* </p> */}
                    </h3>

                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setWeekOffset((prev) => prev - 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6ECF5] bg-white text-[#64748B] transition hover:bg-[#F5F8FF] hover:text-[#4F7CFF]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E6ECF5] bg-white px-4 text-sm font-medium text-[#0F172A] min-w-[220px]">
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

            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} stroke="#E9EEF6" strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 13 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 13 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: "#F3F7FF" }}
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #E6ECF5",
                                backgroundColor: "#FFFFFF",
                                color: "#0F172A",
                            }}
                        />
                        <Bar dataKey="count" fill="#7DA2FF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}