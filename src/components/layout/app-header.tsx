import { Bell, Search } from "lucide-react";

export default function AppHeader() {
    return (
        <header className="flex h-[70px] items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
                <Search size={16} />
                <input
                    placeholder="Search..."
                    className="outline-none text-sm"
                />
            </div>

            <div className="flex items-center gap-4">
                <Bell size={18} />
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                    Z
                </div>
            </div>
        </header>
    );
}