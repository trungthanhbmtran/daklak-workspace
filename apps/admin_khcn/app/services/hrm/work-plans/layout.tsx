"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ListTodo,
  Briefcase,
  Library,
  Settings,
  Calculator,
  FileText
} from "lucide-react";

export default function WorkPlansLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Danh sách công việc",
      href: "/services/hrm/work-plans/tasks",
      icon: ListTodo,
    },
    {
      name: "Thư viện nhiệm vụ (VTVL)",
      href: "/services/hrm/work-plans/rank-templates",
      icon: Library,
    },
    {
      name: "Định mức theo VTVL",
      href: "/services/hrm/work-plans/manual-selector",
      icon: Settings,
    },
    {
      name: "Công thức tính KPI",
      href: "/services/hrm/work-plans/kpi-formulas",
      icon: Calculator,
    },
    {
      name: "Mẫu đánh giá",
      href: "/services/hrm/work-plans/evaluation-forms",
      icon: FileText,
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-full">
      <div className="flex flex-col gap-1.5 mb-4 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý Công việc & KPI</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi tiến độ, phân công, thực hiện dự án và đánh giá chất lượng công việc.
        </p>
      </div>

      <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto hide-scrollbar mb-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="w-full flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

