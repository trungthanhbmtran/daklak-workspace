import React from "react";
import { Widget } from "../../core/types";
import { LeadershipData, LeaderInfo } from "./leadership.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHrmEmployeesQuery } from "../../services/dataBinding";
import { Search, Loader2, Check, X, ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface LeadershipEditorProps {
  widget: Widget<LeadershipData>;
  onChangeData: (data: LeadershipData) => void;
  activeLang: string;
}

export const LeadershipEditor: React.FC<LeadershipEditorProps> = ({ widget, onChangeData }) => {
  const { data: employees, isLoading } = useHrmEmployeesQuery();
  const [search, setSearch] = React.useState("");

  const selectedLeaders = widget.data?.leaders || [];
  const selectedLeaderIds = widget.data?.leaderIds || [];

  // Filter employees based on search text
  const filteredEmployees = React.useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return employees.filter((emp: any) =>
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (emp.positionName && emp.positionName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [employees, search]);

  const handleToggleLeader = (emp: any) => {
    const isSelected = selectedLeaderIds.includes(emp.id);
    let newLeaderIds = [...selectedLeaderIds];
    let newLeaders = [...selectedLeaders];

    if (isSelected) {
      newLeaderIds = newLeaderIds.filter((id) => id !== emp.id);
      newLeaders = newLeaders.filter((l) => l.id !== emp.id);
    } else {
      newLeaderIds.push(emp.id);
      newLeaders.push({
        id: emp.id,
        fullName: emp.fullName,
        positionName: emp.positionName,
        avatarUrl: emp.avatarUrl,
        email: emp.email,
        phoneNumber: emp.phoneNumber,
      });
    }

    onChangeData({
      leaderIds: newLeaderIds,
      leaders: newLeaders,
    });
  };

  const handleRemoveLeader = (id: number) => {
    onChangeData({
      leaderIds: selectedLeaderIds.filter((lid) => lid !== id),
      leaders: selectedLeaders.filter((l) => l.id !== id),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Selected leaders preview list */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          Lãnh đạo đã chọn ({selectedLeaders.length})
        </Label>
        
        {selectedLeaders.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/20">
            <span className="text-[10px] font-bold text-slate-400">Chưa chọn lãnh đạo nào từ danh sách bên dưới</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            {selectedLeaders.map((leader) => (
              <div 
                key={leader.id} 
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <span>{leader.fullName}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveLeader(leader.id)}
                  className="w-4 h-4 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-450 hover:text-rose-500 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database selection search list */}
      <div className="space-y-3 pt-3 border-t border-slate-50 dark:border-slate-800/80">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          Tìm kiếm từ cơ sở dữ liệu HRM
        </Label>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-450 dark:text-slate-500" />
          <Input 
            placeholder="Nhập tên cán bộ, chức vụ lãnh đạo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-11 pr-5 rounded-2xl border-slate-100 dark:border-slate-800 text-xs font-medium bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50/50"
          />
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 divide-y divide-slate-50 dark:divide-slate-900 shadow-sm">
            {filteredEmployees.length === 0 ? (
              <div className="py-8 text-center text-[10px] font-bold text-slate-400 flex flex-col items-center gap-1.5">
                <ShieldAlert className="w-6 h-6 text-slate-350" />
                Không tìm thấy cán bộ phù hợp
              </div>
            ) : (
              filteredEmployees.map((emp: any) => {
                const isSelected = selectedLeaderIds.includes(emp.id);
                return (
                  <div 
                    key={emp.id} 
                    onClick={() => handleToggleLeader(emp)}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-750 dark:text-slate-200">{emp.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-bold leading-normal">{emp.positionName || "Không rõ chức vụ"}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-600 text-white" 
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-transparent"
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadershipEditor;
