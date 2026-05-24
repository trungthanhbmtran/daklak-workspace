"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle2 } from "lucide-react";
import { PlanBasicInfoForm } from './CreatePlan/PlanBasicInfoForm';
import { PlanTaskConfigList } from './CreatePlan/PlanTaskConfigList';
import { AssigneeSelectModal } from './CreatePlan/AssigneeSelectModal';
import { useCreateMasterPlan } from './hooks/useCreateMasterPlan';

export function CreateMasterPlanClient() {
  const router = useRouter();

  const {
    plan,
    setPlan,
    tasks,
    activeTab,
    setActiveTab,
    uiLabels,
    criteriaLibrary,
    departments,
    fields,
    employees,
    isAssigneeModalOpen,
    setIsAssigneeModalOpen,
    fileInputRef,
    isSaving,
    handleTaskChange,
    addTask,
    removeTask,
    openAssigneeModal,
    selectAssignee,
    applyKpiCriteria,
    handleExcelUpload,
    isGeneratingAI,
    generateTasksWithAI,
    handleSave,
  } = useCreateMasterPlan();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Target className="w-8 h-8 text-indigo-600" />
            Khởi tạo Kế hoạch Chiến lược & Mục tiêu Tổng thể
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Mô hình Quản trị theo Mục tiêu (OKR) kết hợp phân rã cấu trúc công việc (WBS) và chấm điểm tự động.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="h-11 rounded-xl">Hủy bỏ</Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 px-8">
            {isSaving ? 'Đang lưu...' : <><CheckCircle2 className="w-5 h-5 mr-2" /> Ban hành Kế hoạch</>}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 h-12 p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="info" className="rounded-lg text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
            {uiLabels.tab1}
          </TabsTrigger>
          <TabsTrigger value="kpi" className="rounded-lg text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
            {uiLabels.tab2}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <PlanBasicInfoForm plan={plan} onChange={setPlan} onNext={() => setActiveTab('kpi')} />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <PlanTaskConfigList
            tasks={tasks}
            uiLabels={uiLabels}
            criteriaLibrary={criteriaLibrary}
            onAddTask={addTask}
            onRemoveTask={removeTask}
            onTaskChange={handleTaskChange}
            onApplyKpiCriteria={applyKpiCriteria}
            onOpenAssigneeModal={openAssigneeModal}
            onImportExcel={() => fileInputRef.current?.click()}
            isGeneratingAI={isGeneratingAI}
            onGenerateWithAI={generateTasksWithAI}
          />
          <input type="file" ref={fileInputRef} onChange={handleExcelUpload} accept=".xlsx, .xls" className="hidden" />
        </TabsContent>
      </Tabs>

      <AssigneeSelectModal
        isOpen={isAssigneeModalOpen}
        onOpenChange={setIsAssigneeModalOpen}
        departments={departments}
        fields={fields}
        employees={employees}
        onSelectAssignee={selectAssignee}
      />
    </div>
  );
}
