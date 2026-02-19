import { api } from "@/lib/api";
import ApplicationTable from "@/components/applications/ApplicationTable";

export default async function ApplicationsPage() {
    const apps = await api.listApplications();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Applications</h1>
            </div>

            <ApplicationTable data={apps} />
        </div>
    );
}
