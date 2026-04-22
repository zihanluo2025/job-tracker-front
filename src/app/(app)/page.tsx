import { api } from "@/lib/api";

function normalizeStatus(status?: string | null) {
  return (status || "").trim().toUpperCase();
}

function getStatusCount(apps: Array<{ status?: string | null }>, targets: string[]) {
  const normalizedTargets = targets.map((item) => item.toUpperCase());
  return apps.filter((item) => normalizedTargets.includes(normalizeStatus(item.status))).length;
}

export default async function ApplicationsPage() {
  // 这里为了让 dashboard 的统计卡片拿到全量数据，
  // 先一次性请求一个较大的 limit。
  // 如果你后续数据可能超过 1000，建议改成专门的 stats 接口。
  const res = await api.listApplications({
    limit: "1000",
    page: "1",
  });

  const apps = res.items;

  const totalCount = res.totalCount;
  const appliedCount = getStatusCount(apps, ["APPLIED"]);
  const pendingCount = getStatusCount(apps, ["PENDING"]);
  const interviewCount = getStatusCount(apps, ["INTERVIEW", "INTERVIEWING"]);
  const rejectedCount = getStatusCount(apps, ["REJECTED", "CLOSED"]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage your job applications in one place.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Total
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalCount}</p>
          <p className="mt-2 text-xs text-slate-500">All applications</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Applied
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{appliedCount}</p>
          <p className="mt-2 text-xs text-slate-500">Submitted successfully</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Interview
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{interviewCount}</p>
          <p className="mt-2 text-xs text-slate-500">In progress</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Rejected
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{rejectedCount}</p>
          <p className="mt-2 text-xs text-slate-500">Closed applications</p>
        </div>
      </section>

      {/* Main content */}
      <section className="w-full">
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Application List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View, edit and manage your current pipeline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}