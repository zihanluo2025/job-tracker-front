import { api } from "@/lib/api";
import ApplicationTable from "@/components/applications/ApplicationTable";

function getStatusCount(apps: Array<{ status?: string | null }>, target: string) {
  return apps.filter((item) => (item.status || "").toUpperCase() === target).length;
}

export default async function ApplicationsPage() {
  const apps = await api.listApplications();

  const totalCount = apps.length;
  const appliedCount = getStatusCount(apps, "APPLIED");
  const pendingCount = getStatusCount(apps, "PENDING");
  const interviewCount = getStatusCount(apps, "INTERVIEW");
  const rejectedCount = getStatusCount(apps, "REJECTED");

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
      <section className=" w-full">
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

          <ApplicationTable data={apps} />
        </div>

      </section>
    </div>
  );
}