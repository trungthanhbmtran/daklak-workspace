"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Layout, Palette } from "lucide-react";

export function PortalSubNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Cấu hình chung",
      href: "/services/posts/portal-config",
      icon: Settings,
    },
    {
      name: "Trình tạo trang trực quan",
      href: "/services/posts/portal-page-builder",
      icon: Layout,
    },
    {
      name: "Quản trị Giao diện",
      href: "/services/posts/appearance",
      icon: Palette,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md w-fit">
      {tabs.map((tab) => {
        // Match path exactly or check if path starts with it (for child pages/nested parameters)
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none ${
              isActive
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30 dark:border-slate-700/20"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-650 dark:text-indigo-400 animate-pulse" : ""}`} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
