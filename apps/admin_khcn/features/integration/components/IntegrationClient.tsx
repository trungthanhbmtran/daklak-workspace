/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="bg-background border border-border rounded-3xl p-6 shadow-sm">
      {children}
    </div>
  );
}

export function IntegrationClient({ initialView = 'dashboard' }: { initialView?: 'dashboard' | 'definitions' | 'instances' | 'gateway' | 'apis' | 'reports' }) {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'definitions' | 'instances' | 'gateway' | 'apis' | 'reports'>(initialView);

  if (editingId || isCreating) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-background rounded-2xl border border-border shadow-xl animate-in fade-in zoom-in-95 duration-300">
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
      <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 bg-background">
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('dashboard')}
            className="rounded-xl border-border hover:bg-muted bg-background text-foreground"
          >
            <ChevronLeft className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Trở về</span>
          </Button>
          <h2 className="text-lg md:text-xl font-bold text-foreground line-clamp-1">
            {activeView === 'definitions' && "Định nghĩa Quy trình (BPMN)"}
            {activeView === 'instances' && "Theo dõi Quy trình Đang chạy"}
            {activeView === 'gateway' && "Cấu hình API Gateway"}
            {activeView === 'apis' && "Quản lý Kết nối API"}
            {activeView === 'reports' && "Bảng điều khiển Báo cáo (Dashboards)"}
          </h2>
        </div>

        <div className="flex-1 min-h-0">
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
      theme: { wrapper: "bg-primary/10 text-primary", border: "border-primary/20", icon: "text-primary" },
    },
    {
      id: 'instances',
      title: "Quy trình Đang chạy",
      description: "Giám sát thời gian thực các luồng công việc đang được thực thi trên toàn hệ thống.",
      icon: Activity,
      theme: { wrapper: "bg-secondary text-secondary-foreground", border: "border-border", icon: "text-secondary-foreground" },
    },
    {
      id: 'gateway',
      title: "Cấu hình API Gateway",
      description: "Quản trị định tuyến (Routing), bảo mật và cấu hình NGINX cho các Microservices.",
      icon: Network,
      theme: { wrapper: "bg-accent text-accent-foreground", border: "border-border", icon: "text-accent-foreground" },
    },
    {
      id: 'apis',
      title: "Kết nối API Đầu vào",
      description: "Quản lý cấu hình, xác thực và Keys để kết nối với các hệ thống ngoài (LGSP, Webhook, Postman).",
      icon: Plug,
      theme: { wrapper: "bg-muted text-muted-foreground", border: "border-border", icon: "text-muted-foreground" },
    },
    {
      id: 'reports',
      title: "Thiết kế Báo cáo",
      description: "Tạo và lưu trữ các biểu đồ, bảng dữ liệu thống kê từ các API hoặc Kho CSDL hệ thống.",
      icon: PieChart,
      theme: { wrapper: "bg-primary/5 text-primary", border: "border-primary/10", icon: "text-primary" },
    }
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-background">
      
      {/* Header Section */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit text-xs md:text-sm font-medium shadow-sm">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="truncate">Hệ thống quản trị BPMN & Microservices</span>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Trung tâm <span className="text-primary">Tích hợp & Quy trình</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed">
          Nơi hợp nhất sức mạnh của việc thiết kế luồng tự động hóa (Workflow) và quản trị giao tiếp dữ liệu (Gateway) giữa các phân hệ cốt lõi.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-10">
        {modules.map((module) => {
          const style = module.theme;
          return (
            <button
              key={module.id}
              onClick={() => setActiveView(module.id as any)}
              className="text-left group block outline-none w-full"
            >
              <div className={`h-full rounded-2xl bg-card border border-border p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm flex flex-col`}>
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${style.wrapper} border ${style.border} flex items-center justify-center mb-4 md:mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <module.icon className={`w-6 h-6 md:w-7 md:h-7 ${style.icon}`} />
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4 md:mb-6 flex-1">
                  {module.description}
                </p>
                
                <div className="flex items-center text-xs md:text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors mt-auto uppercase tracking-wide">
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
