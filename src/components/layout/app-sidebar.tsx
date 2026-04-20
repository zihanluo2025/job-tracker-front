"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BriefcaseBusiness,
    // BarChart3,
    // Settings,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Applications", href: "/applications", icon: BriefcaseBusiness },
    // { label: "Analytics", href: "/analytics", icon: BarChart3 },
    // { label: "Settings", href: "/settings", icon: Settings },
];

export default function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-[260px] flex-col border-r border-slate-200 bg-[#f8fbff] px-5 py-6">
            <div className="mb-10">
                <h1 className="text-[30px] font-extrabold tracking-tight text-[#2154d6]">
                    TheApplications
                </h1>

            </div>

            <nav className="flex flex-1 flex-col gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                                active
                                    ? "bg-[#edf4ff] text-[#2154d6]"
                                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-6 rounded-2xl bg-[#eaf4ff] p-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2154d6] text-sm font-bold text-white">
                        ZH
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Zihan</p>
                        <p className="text-xs text-slate-500">Career Pipeline</p>
                    </div>
                </div>
            </div>
        </div>
    );
}