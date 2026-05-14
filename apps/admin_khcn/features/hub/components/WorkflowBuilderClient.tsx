"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowEditor, WorkflowList, WorkflowInstanceList } from "@/features/workflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Activity, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border/60 rounded-2xl p-6 shadow-sm">
      {children}
    </div>
  );
}

export function WorkflowBuilderClient() {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("definitions");

  if (editingId || isCreating) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-background">
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
    <main className="min-h-screen bg-background/50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.push('/hub')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Trung tâm Quy trình</h1>
              <p className="text-muted-foreground text-sm">Quản lý và giám sát các luồng nghiệp vụ tự động.</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/60 p-1 rounded-xl h-11">
            <TabsTrigger value="definitions" className="rounded-lg data-[state=active]:shadow-sm px-6 gap-2">
              <Layers className="h-4 w-4" /> Định nghĩa
            </TabsTrigger>
            <TabsTrigger value="instances" className="rounded-lg data-[state=active]:shadow-sm px-6 gap-2">
              <Activity className="h-4 w-4" /> Đang thực thi
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="definitions" className="mt-0 outline-none">
            <WorkflowList 
              onEdit={(id) => setEditingId(id)}
              onCreate={() => setIsCreating(true)}
            />
          </TabsContent>
          
          <TabsContent value="instances" className="mt-0 outline-none">
            <CardContainer>
              <WorkflowInstanceList />
            </CardContainer>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
