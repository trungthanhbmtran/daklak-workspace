"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowEditor, WorkflowList, WorkflowInstanceList } from "@/features/workflow";
import { IntegrationConfig } from "./IntegrationConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Activity, ChevronLeft, Sparkles, Workflow, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-blue-900/5">
      {children}
    </div>
  );
}

export function IntegrationClient() {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("definitions");

  if (editingId || isCreating) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <WorkflowEditor 
          id={editingId || undefined} 
          onBack={() => {
            setEditingId(null);
            setIsCreating(false);
          }} 
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Premium Background Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/10 blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      {/* Header Area */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/40 backdrop-blur-xl supports-backdrop-filter:bg-background/20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300" 
              onClick={() => router.push('/hub')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                <Workflow className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 tracking-tight">
                  Trung tâm Tích hợp & Quy trình
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Thiết kế, quản lý và tự động hóa các luồng nghiệp vụ
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50">
            <Sparkles className="w-4 h-4 text-violet-500 mr-2" />
            <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Hệ thống BPMN 2.0</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-1.5 rounded-2xl shadow-sm inline-flex h-14">
              <TabsTrigger 
                value="definitions" 
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 data-[state=active]:shadow-md px-8 py-2.5 gap-2 text-sm font-semibold transition-all duration-300"
              >
                <Layers className="h-4 w-4" /> 
                Định nghĩa Quy trình
              </TabsTrigger>
              <TabsTrigger 
                value="instances" 
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 data-[state=active]:shadow-md px-8 py-2.5 gap-2 text-sm font-semibold transition-all duration-300"
              >
                <Activity className="h-4 w-4" /> 
                Quy trình Đang chạy
              </TabsTrigger>
              <TabsTrigger 
                value="gateway" 
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 data-[state=active]:shadow-md px-8 py-2.5 gap-2 text-sm font-semibold transition-all duration-300"
              >
                <Network className="h-4 w-4" /> 
                Cấu hình Gateway
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="definitions" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-2 sm:p-8 shadow-2xl shadow-violet-900/5">
              <WorkflowList 
                onEdit={(id) => setEditingId(id)}
                onCreate={() => setIsCreating(true)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="instances" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContainer>
              <WorkflowInstanceList />
            </CardContainer>
          </TabsContent>
          
          <TabsContent value="gateway" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <IntegrationConfig />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
