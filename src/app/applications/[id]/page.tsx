import { api } from "@/lib/api";
import ApplicationDetail from "@/components/applications/ApplicationDetail";

export default async function ApplicationDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const app = await api.getApplication(params.id);
    return (
        <div className="p-6">
            <ApplicationDetail initial={app} />
        </div>
    );
}
