"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Activity, ChevronLeft, Sparkles, Network, ArrowRight, Plug, PieChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

function Loading() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
    </div>
  );
}

const WorkflowEditor = dynamic(() => import("@/features/workflow").then(mod => mod.WorkflowEditor), { ssr: false, loading: Loading });
const WorkflowList = dynamic(() => import("@/features/workflow").then(mod => mod.WorkflowList), { ssr: false, loading: Loading });
const WorkflowInstanceList = dynamic(() => import("@/features/workflow").then(mod => mod.WorkflowInstanceList), { ssr: false, loading: Loading });
const IntegrationConfig = dynamic(() => import("./IntegrationConfig").then(mod => mod.IntegrationConfig), { ssr: false, loading: Loading });
const IntegrationManager = dynamic(() => import("./IntegrationManager").then(mod => mod.IntegrationManager), { ssr: false, loading: Loading });
const ReportDashboard = dynamic(() => import("./reports/ReportDashboard").then(mod => mod.ReportDashboard), { ssr: false, loading: Loading });

function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      {children}
    </div>
  );
}

export function IntegrationClient({ initialView = 'dashboard' }: { initialView?: 'dashboard' | 'definitions' | 'instances' | 'gateway' | 'apis' | 'reports' }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'definitions' | 'instances' | 'gateway' | 'apis' | 'reports'>(initialView);

  if (editingId || isCreating) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <WorkflowEditor
          id={editingId || undefined}
          onBack={() => {
            setEditingId(null);
            setIsCreating(false);
          }}
        />
      </div>
    );
  }

  // Render sub-views with a unified back button header
  if (activeView !== 'dashboard') {
    return (
      <div className="w-full h-full flex flex-col space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('dashboard')}
            className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về
          </Button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {activeView === 'definitions' && "Định nghĩa Quy trình (BPMN)"}
            {activeView === 'instances' && "Theo dõi Quy trình Đang chạy"}
            {activeView === 'gateway' && "Cấu hình API Gateway"}
            {activeView === 'apis' && "Quản lý Kết nối API"}
            {activeView === 'reports' && "Bảng điều khiển Báo cáo (Dashboards)"}
          </h2>
        </div>

        <div className="flex-1">
          {activeView === 'definitions' && (
            <CardContainer>
              <WorkflowList
                onEdit={(id) => setEditingId(id)}
                onCreate={() => setIsCreating(true)}
              />
            </CardContainer>
          )}
          {activeView === 'instances' && (
            <CardContainer>
              <WorkflowInstanceList />
            </CardContainer>
          )}
          {activeView === 'gateway' && (
            <IntegrationConfig />
          )}
          {activeView === 'apis' && (
            <IntegrationManager />
          )}
          {activeView === 'reports' && (
            <ReportDashboard />
          )}
        </div>
      </div>
    );
  }

  // Main Dashboard View
  const modules = [
    {
      id: 'definitions',
      title: "Định nghĩa Quy trình",
      description: "Thiết kế và số hóa luồng nghiệp vụ bằng biểu đồ BPMN 2.0 kéo thả trực quan.",
      icon: Layers,
      theme: { light: "bg-blue-50", dark: "dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-600 dark:text-blue-400" },
    },
    {
      id: 'instances',
      title: "Quy trình Đang chạy",
      description: "Giám sát thời gian thực các luồng công việc đang được thực thi trên toàn hệ thống.",
      icon: Activity,
      theme: { light: "bg-emerald-50", dark: "dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600 dark:text-emerald-400" },
    },
    {
      id: 'gateway',
      title: "Cấu hình API Gateway",
      description: "Quản trị định tuyến (Routing), bảo mật và cấu hình NGINX cho các Microservices.",
      icon: Network,
      theme: { light: "bg-violet-50", dark: "dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800", icon: "text-violet-600 dark:text-violet-400" },
    },
    {
      id: 'apis',
      title: "Kết nối API Đầu vào",
      description: "Quản lý cấu hình, xác thực và Keys để kết nối với các hệ thống ngoài (LGSP, Webhook, Postman).",
      icon: Plug,
      theme: { light: "bg-amber-50", dark: "dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600 dark:text-amber-400" },
    },
    {
      id: 'reports',
      title: "Thiết kế Báo cáo",
      description: "Tạo và lưu trữ các biểu đồ, bảng dữ liệu thống kê từ các API hoặc Kho CSDL hệ thống.",
      icon: PieChart,
      theme: { light: "bg-pink-50", dark: "dark:bg-pink-900/20", border: "border-pink-200 dark:border-pink-800", icon: "text-pink-600 dark:text-pink-400" },
    }
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 w-fit text-sm font-medium shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Hệ thống quản trị BPMN & Microservices</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Trung tâm <span className="text-violet-600 dark:text-violet-400">Tích hợp & Quy trình</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
          Nơi hợp nhất sức mạnh của việc thiết kế luồng tự động hóa (Workflow) và quản trị giao tiếp dữ liệu (Gateway) giữa các phân hệ cốt lõi.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        {modules.map((module) => {
          const style = module.theme;
          return (
            <button
              key={module.id}
              onClick={() => setActiveView(module.id as any)}
              className="text-left group block outline-none w-full"
            >
              <div className={`h-full rounded-2xl bg-white dark:bg-slate-900 border ${style.border} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm flex flex-col`}>
                <div className={`w-14 h-14 rounded-xl ${style.light} ${style.dark} border ${style.border} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <module.icon className={`w-7 h-7 ${style.icon}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {module.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  {module.description}
                </p>
                
                <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mt-auto uppercase tracking-wide">
                  Truy cập phân hệ
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
