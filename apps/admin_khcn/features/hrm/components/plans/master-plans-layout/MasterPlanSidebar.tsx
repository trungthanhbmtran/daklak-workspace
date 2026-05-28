"use client";

import { Plus, Calendar, FileText, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";
import { AdvancedAIPlanDialog } from "../AdvancedAIPlanDialog";
import { useMasterPlanContext } from "./MasterPlanContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { useSearchParams } from "next/navigation";

export function MasterPlanSidebar() {
  const { state, actions } = useMasterPlanContext();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";

  const filteredPlans = state.masterPlans.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full lg:w-[320px] shrink-0 h-full flex flex-col bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Kế hoạch & Phân bổ
          </h3>
        <div className="flex items-center gap-2">
          <AdvancedAIPlanDialog />
          <Button 
            size="sm" 
            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
            onClick={() => {
              actions.select(null);
              actions.setMode("create");
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Tạo mới
          </Button>
        </div>
        </div>
        
        <Search placeholder="Tìm kế hoạch..." className="w-full" />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {state.isLoadingPlans ? (
          <div className="text-center py-10 text-slate-400 text-sm">Đang tải dữ liệu...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Chưa có kế hoạch nào.</div>
        ) : (
          filteredPlans.map(plan => {
            const isActive = state.selectedId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => actions.select(plan.id)}
                className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                  isActive ? "bg-indigo-50 border border-indigo-100 shadow-sm" : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-md ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${isActive ? "text-indigo-900" : "text-slate-700"}`}>
                    {plan.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border uppercase font-mono font-medium">
                      {plan.type || 'BSC_KPI'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {plan.totalTasks || 0} nhiệm vụ
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  );
}
