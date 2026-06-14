import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  PlayCircle, 
  Search, 
  Crown, 
  CheckCheck, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  Target 
} from 'lucide-react';
import { toast } from 'sonner';
import { hrmTasksApi, hrmApi } from "@/features/hrm/api";

interface SmartAssignDrawerProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignSuccess: () => void;
}

export function SmartAssignDrawer({ task, open, onOpenChange, onAssignSuccess }: SmartAssignDrawerProps) {
  const queryClient = useQueryClient();
  const [assignStrategy, setAssignStrategy] = useState<string>('LOW_PERFORMANCE');
  const [leadCode, setLeadCode] = useState<string>('');
  const [coordinatorCodes, setCoordinatorCodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all employees to enrich recommended list with actual department & job title names
  const { data: allEmployeesRes } = useQuery({
    queryKey: ['hrm-employees-dict'],
    queryFn: () => hrmApi.list({ pageSize: 150 }),
    staleTime: 5 * 60 * 1000,
    enabled: !!open,
  });

  const employeeDetailsMap = useMemo(() => {
    const map = new Map<string, any>();
    (allEmployeesRes?.data || []).forEach((emp: any) => {
      map.set(emp.employeeCode, emp);
    });
    return map;
  }, [allEmployeesRes]);

  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ['smart-assign', task?.id, assignStrategy],
    queryFn: async () => {
      const res: any = await hrmTasksApi.recommendAssignees({ rankCode: 'ALL', strategy: assignStrategy });
      if (res.success) {
        if (Array.isArray(res.data)) {
          return { topEmployees: res.data, topDepartments: [] };
        }
        return {
          topEmployees: res.data?.topEmployees || [],
          topDepartments: res.data?.topDepartments || [],
        };
      }
      throw new Error('Lỗi lấy danh sách gợi ý');
    },
    enabled: !!open && !!task,
    staleTime: 60_000,
  });

  const topEmployees = useMemo(() => recommendations?.topEmployees || [], [recommendations]);

  // Enrich recommended list with real department & job title names
  const enrichedEmployees = useMemo(() => {
    return topEmployees.map((emp: any) => {
      const details = employeeDetailsMap.get(emp.employeeCode);
      return {
        ...emp,
        departmentName: details?.department?.name || emp.departmentName || 'Chưa phân phòng',
        jobTitleName: details?.jobTitle?.name || emp.jobTitleName || 'Cán bộ',
        avatar: details?.avatar || '',
      };
    });
  }, [topEmployees, employeeDetailsMap]);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return enrichedEmployees.slice(0, 12);
    }
    return enrichedEmployees.filter((rec: any) =>
      (rec.employeeName || '').toLowerCase().includes(query) ||
      (rec.employeeCode || '').toLowerCase().includes(query) ||
      (rec.departmentName || '').toLowerCase().includes(query) ||
      (rec.jobTitleName || '').toLowerCase().includes(query)
    );
  }, [enrichedEmployees, searchQuery]);

  const assignMutation = useMutation({
    mutationFn: (data: { leadCode: string; coordinatorCodes: string[] }) => {
      return hrmTasksApi.assignTask(task!.id.toString(), {
        assigneeCode: data.leadCode,
        coAssigneeCodes: data.coordinatorCodes || [],
      });
    },
    onSuccess: () => {
      toast.success('Giao việc thành công!');
      queryClient.invalidateQueries({ queryKey: ['hrm-tasks'] });
      onAssignSuccess();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || 'Giao việc thất bại')
  });

  const toggleCoordinator = (code: string) => {
    if (code === leadCode) {
      setLeadCode('');
    }
    setCoordinatorCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSetLead = (code: string) => {
    if (leadCode === code) {
      setLeadCode('');
    } else {
      setLeadCode(code);
      setCoordinatorCodes(prev => prev.filter(c => c !== code));
    }
  };

  const handleGroupAssignSubmit = () => {
    if (!leadCode) {
      toast.error('Vui lòng chọn 1 người Giao chính');
      return;
    }
    assignMutation.mutate({ leadCode, coordinatorCodes });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto custom-scrollbar font-sans bg-slate-50/90 dark:bg-slate-950/95 backdrop-blur-md border-l border-slate-200/80 dark:border-slate-800/80">
        <SheetHeader className="mb-6 relative">
          <div className="absolute top-0 right-0 p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          </div>
          <SheetTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <PlayCircle className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" /> Phân công thông minh
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400 text-sm">
            Hệ thống tự động tính toán dựa trên khối lượng công việc hiện tại và hiệu suất của Phòng ban / Nhân viên.
          </SheetDescription>
        </SheetHeader>

        {task && (
          <div className="space-y-6 pb-24">
            {/* Task Card details */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Nhiệm vụ cần giao
              </p>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-base leading-snug">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Strategic select section */}
            <div className="flex flex-col gap-2">
              <Label className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Chiến lược phân công ưu tiên
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  onClick={() => setAssignStrategy('HIGH_PERFORMANCE')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col justify-between ${
                    assignStrategy === 'HIGH_PERFORMANCE' 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md scale-[1.02]' 
                      : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">🏆</span>
                      {assignStrategy === 'HIGH_PERFORMANCE' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      )}
                    </div>
                    <p className={`font-bold text-sm ${assignStrategy === 'HIGH_PERFORMANCE' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>Giỏi nhất</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Ưu tiên những cán bộ có điểm KPI và hiệu suất công việc cao nhất.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setAssignStrategy('UNDER_QUOTA')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col justify-between ${
                    assignStrategy === 'UNDER_QUOTA' 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md scale-[1.02]' 
                      : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">⚖️</span>
                      {assignStrategy === 'UNDER_QUOTA' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                    <p className={`font-bold text-sm ${assignStrategy === 'UNDER_QUOTA' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>Ít tải nhất</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Ưu tiên những nhân sự có ít đầu việc đang thực hiện nhất để cân bằng tải.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setAssignStrategy('LOW_PERFORMANCE')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col justify-between ${
                    assignStrategy === 'LOW_PERFORMANCE' 
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md scale-[1.02]' 
                      : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">📈</span>
                      {assignStrategy === 'LOW_PERFORMANCE' && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </div>
                    <p className={`font-bold text-sm ${assignStrategy === 'LOW_PERFORMANCE' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>Cần rèn luyện</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Ưu tiên tạo cơ hội cho những người cần bổ sung kinh nghiệm, nâng cao hiệu quả.
                    </p>
                  </div>
                </div>
              </div>
            </div>



            {/* Main listing and search section */}
            <div className="flex flex-col h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center shrink-0">
                  <span className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded mr-2" />
                  Danh sách đề xuất theo Đơn vị
                </h4>
                <div className="relative w-full sm:w-72 shrink-0">
                  <Input
                    placeholder="Tìm tên, mã cán bộ, phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-xl pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-indigo-400 dark:focus:border-indigo-700 text-xs font-medium shadow-sm transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {isLoadingRecs ? (
                <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-indigo-600" />
                    <p className="text-xs text-slate-500 font-semibold">Đang tổng hợp dữ liệu nhân sự...</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(
                    filteredEmployees.reduce((acc: any, emp: any) => {
                      const dept = emp.departmentName || 'Chưa phân phòng';
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(emp);
                      return acc;
                    }, {})
                  ).map(([deptName, emps]: [string, any], groupIdx) => (
                    <div key={deptName} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/50 dark:bg-slate-900/80 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xs shrink-0">
                          {deptName.charAt(0).toUpperCase()}
                        </div>
                        <h5 className="font-extrabold text-slate-700 dark:text-slate-300 text-xs tracking-wide">{deptName}</h5>
                        <Badge className="ml-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 border border-slate-200/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {emps.length} nhân sự
                        </Badge>
                      </div>
                      <div className="flex flex-col p-3 gap-2.5">
                        {emps.map((rec: any, idx: number) => {
                          const isLead = rec.employeeCode === leadCode;
                          const isCoordinator = coordinatorCodes.includes(rec.employeeCode);

                          // Workload capacity bar calculation
                          const loadRatio = Math.min(1, rec.currentLoad / (rec.rankLimit || 5));
                          const loadPercentage = Math.round(loadRatio * 100);
                          let loadColor = 'bg-emerald-500';
                          let loadTextColor = 'text-emerald-600 dark:text-emerald-400';
                          if (loadPercentage >= 100) {
                            loadColor = 'bg-rose-500';
                            loadTextColor = 'text-rose-600 dark:text-rose-400';
                          } else if (loadPercentage >= 60) {
                            loadColor = 'bg-amber-500';
                            loadTextColor = 'text-amber-600 dark:text-amber-400';
                          }

                          return (
                            <div 
                              key={rec.employeeCode} 
                              className={`group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                                isLead 
                                  ? 'bg-violet-50/50 dark:bg-violet-950/10 border-violet-400/80 dark:border-violet-800/80 shadow-md shadow-violet-200/20' 
                                  : isCoordinator 
                                  ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-400/80 dark:border-amber-800/80 shadow-md shadow-amber-200/20' 
                                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.005]'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                                <div className={`shrink-0 w-11 h-11 rounded-full shadow-inner flex justify-center items-center font-bold text-sm text-white transition-all duration-300 ${
                                  isLead 
                                    ? 'bg-violet-600 ring-4 ring-violet-100 dark:ring-violet-950' 
                                    : isCoordinator 
                                    ? 'bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950' 
                                    : 'bg-gradient-to-br from-indigo-500 to-violet-500 ring-2 ring-transparent group-hover:ring-indigo-100 dark:group-hover:ring-indigo-950'
                                }`}>
                                  {isLead ? <Crown className="w-5.5 h-5.5 text-white" /> : rec.employeeName?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {rec.employeeName}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                                      {rec.employeeCode}
                                    </span>
                                    {groupIdx === 0 && idx === 0 && !searchQuery && (
                                      <Badge className="bg-indigo-600 hover:bg-indigo-700 text-[9px] uppercase px-2 py-0 h-4.5 animate-pulse shadow-sm shadow-indigo-200">
                                        Gợi ý tối ưu
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                    {rec.jobTitleName}
                                  </p>

                                  {/* Workload Capacity Progress Bar */}
                                  <div className="w-full mt-2.5 max-w-sm">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                      <span className="flex items-center gap-1">
                                        <Activity className="w-3 h-3 text-indigo-500" />
                                        Khối lượng: {rec.currentLoad}/{rec.rankLimit || 5} việc
                                      </span>
                                      <span className={loadTextColor}>{loadPercentage}% tải</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${loadColor} rounded-full transition-all duration-500`} 
                                        style={{ width: `${loadPercentage}%` }} 
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800 md:border-0 shrink-0">
                                <div className="text-right hidden xl:block mr-2">
                                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Điểm KPI</div>
                                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end mt-0.5">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    {Math.round(rec.performanceScore)}
                                  </div>
                                </div>

                                  <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                      onClick={() => handleSetLead(rec.employeeCode)}
                                      title="Đặt làm Giao chính"
                                      className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1 hover:scale-103 ${
                                        isLead 
                                          ? 'bg-violet-600 text-white shadow-violet-200 dark:shadow-violet-950' 
                                          : 'bg-violet-50 dark:bg-violet-950/35 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900 border border-violet-200/50 dark:border-violet-900/50'
                                      }`}
                                    >
                                      {isLead ? <CheckCheck className="w-3.5 h-3.5" /> : null}
                                      Giao chính
                                    </button>
                                    <button
                                      onClick={() => toggleCoordinator(rec.employeeCode)}
                                      title="Thêm vào Phối hợp"
                                      disabled={isLead}
                                      className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-sm disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-1 hover:scale-103 ${
                                        isCoordinator 
                                          ? 'bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-950' 
                                          : 'bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200/50 dark:border-amber-900/50'
                                      }`}
                                    >
                                      {isCoordinator ? <CheckCheck className="w-3.5 h-3.5" /> : null}
                                      Phối hợp
                                    </button>
                                  </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                      <Search className="w-9 h-9 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Không tìm thấy nhân sự phù hợp</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Footer */}
        {task && (
          <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 p-5 shadow-[0_-12px_42px_rgba(0,0,0,0.06)] z-20 flex items-center justify-between transition-all duration-300">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
              {!leadCode ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Vui lòng chọn 1 người Giao chính</span>
              ) : (
                <span>
                  Đã chọn <b className="text-violet-700 dark:text-violet-400 font-black">1 Giao chính</b> 
                  {coordinatorCodes.length > 0 && (
                    <span> và <b className="text-amber-600 dark:text-amber-400 font-black">{coordinatorCodes.length} Phối hợp</b></span>
                  )}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold" 
                onClick={() => onOpenChange(false)} 
                disabled={assignMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200/50 dark:shadow-violet-950/20 text-xs font-bold transition-all px-5"
                disabled={!leadCode || assignMutation.isPending}
                onClick={handleGroupAssignSubmit}
              >
                Xác nhận giao việc
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
