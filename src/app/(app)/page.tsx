import { api } from "@/lib/api";
import WeeklyApplicationsChart from "@/components/applications/WeeklyApplicationsChart";
import WeeklyLocationPieChart from "@/components/applications/WeeklyLocationPieChart";
import {
  MoreHorizontal,
  Phone,
  Video,
  Users,
  Star,
} from "lucide-react";

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

function formatMonthChange(change: number, percent: number) {
  if (change === 0) {
    return {
      label: "0%",
      subLabel: "No change",
      colorClass: "text-slate-400",
    };
  }

  if (change > 0) {
    return {
      label: `↗ ${formatPercent(percent)}`,
      subLabel: `+${change} vs last month`,
      colorClass: "text-emerald-500",
    };
  }

  return {
    label: `↘ ${formatPercent(Math.abs(percent))}`,
    subLabel: `${change} vs last month`,
    colorClass: "text-red-500",
  };
}

export default async function ApplicationsPage() {
  const [statsRes, applicationsRes] = await Promise.all([
    api.getApplicationStats(7),
    api.listApplications({
      limit: "100",
      page: "1",
    }),
  ]);

  const summary = statsRes.summary;
  const apps = applicationsRes.items ?? [];

  const totalCount = summary.total;
  const rejectedCount = summary.rejected;

  const rejectedPercent =
    totalCount > 0 ? (rejectedCount / totalCount) * 100 : 0;

  const monthChangeInfo = formatMonthChange(
    summary.monthChange,
    summary.monthChangePercent
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[36px] font-extrabold leading-none tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track and manage your job applications in one place.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <TotalSummaryCard
            total={totalCount}
            thisMonth={summary.thisMonth}
            monthChangeLabel={monthChangeInfo.label}
            monthChangeSubLabel={monthChangeInfo.subLabel}
            monthChangeColorClass={monthChangeInfo.colorClass}
          />

          <RejectedSummaryCard
            rejected={rejectedCount}
            rejectedPercent={rejectedPercent}
          />
        </div>

        <InterviewFunnelCard
          phoneScreen={summary.phoneScreen}
          onlineInterview={summary.onlineInterview}
          inPersonInterview={summary.inPersonInterview}
          offers={summary.offer}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <WeeklyApplicationsChart apps={apps} />
        <WeeklyLocationPieChart apps={apps} />
      </div>
    </div>
  );
}

function TotalSummaryCard({
  total,
  thisMonth,
  monthChangeLabel,
  monthChangeSubLabel,
  monthChangeColorClass,
}: {
  total: number;
  thisMonth: number;
  monthChangeLabel: string;
  monthChangeSubLabel: string;
  monthChangeColorClass: string;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
        Total
      </p>

      <div className="mt-4 flex items-end gap-2">
        <p className="text-[42px] font-extrabold leading-none tracking-tight text-[#0B3F9C]">
          {total}
        </p>
        <p className="pb-1.5 text-sm font-semibold text-slate-700">
          applications
        </p>
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <p className="text-xl font-extrabold leading-none text-slate-900">
            {thisMonth}
          </p>

          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
            This Month
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className={`text-xs font-extrabold ${monthChangeColorClass}`}>
            {monthChangeLabel}
          </p>

          <p className="text-xs font-semibold leading-tight text-slate-500">
            {monthChangeSubLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function RejectedSummaryCard({
  rejected,
  rejectedPercent,
}: {
  rejected: number;
  rejectedPercent: number;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
        Rejected
      </p>

      <p className="mt-5 text-[42px] font-extrabold leading-none tracking-tight text-slate-950">
        {rejected}
      </p>

      <p className="mt-3 text-sm font-extrabold leading-tight text-slate-700">
        Closed
        applications
      </p>

      <div className="mt-8">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-red-300"
            style={{ width: `${Math.min(rejectedPercent, 100)}%` }}
          />
        </div>

        <p className="mt-2 text-right text-xs font-extrabold text-slate-500">
          {formatPercent(rejectedPercent)} of total flow
        </p>
      </div>
    </div>
  );
}

function InterviewFunnelCard({
  phoneScreen,
  onlineInterview,
  inPersonInterview,
  offers,
}: {
  phoneScreen: number;
  onlineInterview: number;
  inPersonInterview: number;
  offers: number;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          Interview Funnel Status
        </h2>

        <button className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FunnelStatusItem
          label={
            <>
              Phone
              Screen
            </>
          }
          value={8}
          icon={<Phone className="h-5 w-5" />}
          iconClassName="bg-white text-[#0B4EDB]"
        />

        <FunnelStatusItem
          label="Online"
          value={3}
          icon={<Video className="h-5 w-5" />}

          iconClassName="bg-[#0052D9] text-white"
        />

        <FunnelStatusItem
          label="In-person"
          value={inPersonInterview}
          icon={<Users className="h-5 w-5" />}
          iconClassName="bg-white text-slate-700"
        />

        <FunnelStatusItem
          label="Offers"
          value={offers}
          icon={<Star className="h-5 w-5 fill-current" />}
          iconClassName="bg-[#B9F5A7] text-[#2E7D32]"
          labelClassName="text-[#2E7D32]"
        />
      </div>
    </div>
  );
}

function FunnelStatusItem({
  label,
  value,
  icon,
  active = false,
  iconClassName,
  labelClassName = "text-slate-500",
}: {
  label: React.ReactNode;
  value: number;
  icon: React.ReactNode;
  active?: boolean;
  iconClassName: string;
  labelClassName?: string;
}) {
  return (

    <div
      className={[
        "relative flex min-h-[130px] flex-col items-center justify-center rounded-lg bg-[#F3FAFF] text-center",
        active
          ? "after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:rounded-b-lg after:bg-[#0052D9]"
          : "",
      ].join(" ")}
    >
      <div className="flex w-full items-center justify-between px-4">
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-full shadow-sm",
            iconClassName,
          ].join(" ")}
        >
          {icon}
        </div>

        <p className="text-[30px] font-extrabold leading-none text-slate-950">
          {value}
        </p>
      </div>

      <p
        className={[
          "mt-4 text-xs font-extrabold uppercase leading-tight tracking-[0.08em]",
          active ? "text-[#0052D9]" : labelClassName,
        ].join(" ")}
      >
        {label}
      </p>
    </div>
  );

}