"use client";

import { Plus, FileText, CheckCircle2, ChevronRight, Briefcase, Loader2, Inbox } from "lucide-react";
import { useMasterPlanContext } from "./MasterPlanContext";
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
    <div className="w-full lg:w-[320px] shrink-0 h-full flex flex-col bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2.5 text-sm">
            <div className="p-1.5 bg-indigo-100 rounded-md">
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            Kế hoạch & Phân bổ
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => {
                actions.select(null);
                actions.setMode("create");
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Lập Kế hoạch
            </Button>
          </div>
        </div>

        <Search placeholder="Tìm kế hoạch..." className="w-full transition-shadow focus-within:shadow-sm" />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {state.isLoadingPlans ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-indigo-400" />
            <p className="text-sm font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Inbox className="w-8 h-8 mb-3 text-slate-300" />
            <p className="text-sm font-medium">
              {searchTerm ? "Không tìm thấy kết quả." : "Chưa có kế hoạch nào."}
            </p>
          </div>
        ) : (
          filteredPlans.map(plan => {
            const isActive = state.selectedId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => actions.select(plan.id)}
                className={`group w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ease-in-out ${isActive
                  ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-500/10"
                  : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm"
                  } border`}
              >
                <div className={`shrink-0 p-2 rounded-lg transition-colors duration-200 ${isActive
                  ? "bg-indigo-100/80 text-indigo-700"
                  : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-sm"
                  }`}>
                  <FileText className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className={`font-semibold text-sm truncate transition-colors duration-200 ${isActive ? "text-indigo-950" : "text-slate-700 group-hover:text-slate-900"
                    }`}>
                    {plan.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium">
                    <span className={`px-1.5 py-0.5 rounded border uppercase font-mono tracking-wider ${isActive
                      ? "bg-indigo-100/50 border-indigo-200 text-indigo-700"
                      : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}>
                      {plan.type || 'BSC_KPI'}
                    </span>
                    <span className={`flex items-center gap-1 ${isActive ? "text-indigo-600/80" : "text-slate-500"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {plan.totalTasks || 0} nhiệm vụ
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-all duration-200 ${isActive
                  ? "text-indigo-600 opacity-100 translate-x-0"
                  : "text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`} />
              </button>
            )
          })
        )}
      </div>
    </div>
  );
}