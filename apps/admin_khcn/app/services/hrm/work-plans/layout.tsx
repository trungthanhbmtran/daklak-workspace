"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ListTodo, 
  LayoutDashboard, 
  FolderKanban, 
  UserCheck, 
  ClipboardCheck,
  PieChart
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
      name: "Tổng quan tiến độ",
      href: "/services/hrm/work-plans/tasks/dashboard",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="flex flex-col p-6 h-full overflow-hidden bg-slate-50/50">
      <div className="flex flex-col gap-2 mb-4 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Công việc & KPI</h1>
        <p className="text-muted-foreground">
          Theo dõi tiến độ, phân công, thực hiện dự án và đánh giá chất lượng công việc.
        </p>
      </div>

      <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="flex-col flex-1 min-h-0 pt-4 flex relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
