import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen overflow-hidden bg-[#f5f9ff]">
            <div className="flex h-full">
                {/* Sidebar */}
                <aside className="h-screen shrink-0">
                    <AppSidebar />
                </aside>

                {/* Right side */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Fixed header */}
                    {/* <div className="shrink-0">
                        <AppHeader />
                    </div> */}

                    {/* Scrollable content only */}
                    <main className="min-h-0 flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}