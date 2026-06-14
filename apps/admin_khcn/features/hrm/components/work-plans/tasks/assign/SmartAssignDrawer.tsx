import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlayCircle, Search, Users, Crown, CheckCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { hrmTasksApi } from "@/features/hrm/api";

interface SmartAssignDrawerProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignSuccess: () => void;
}

export function SmartAssignDrawer({ task, open, onOpenChange, onAssignSuccess }: SmartAssignDrawerProps) {
  const queryClient = useQueryClient();
  const [assignStrategy, setAssignStrategy] = useState<string>('LOW_PERFORMANCE');
  const [isGroupMode, setIsGroupMode] = useState<boolean>(false);
  const [leadCode, setLeadCode] = useState<string>('');
  const [coordinatorCodes, setCoordinatorCodes] = useState<string[]>([]);

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

  const [searchQuery, setSearchQuery] = useState<string>('');

  const topEmployees = recommendations?.topEmployees || [];
  const topDepartments = recommendations?.topDepartments || [];

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      // Show top 10 recommended by default
      return topEmployees.slice(0, 10);
    }
    return topEmployees.filter((rec: any) => 
      rec.employeeName?.toLowerCase().includes(query) ||
      rec.employeeCode?.toLowerCase().includes(query) ||
      rec.departmentName?.toLowerCase().includes(query) ||
      (rec.departmentId && String(rec.departmentId).includes(query))
    );
  }, [topEmployees, searchQuery]);

  const assignMutation = useMutation({
    mutationFn: (data: { departmentId?: number, employeeCode?: string, leadCode?: string, coordinatorCodes?: string[] }) => {
      if (data.leadCode) {
        return hrmTasksApi.assignCoordination(task.id.toString(), {
          leadCode: data.leadCode,
          coordinatorCodes: data.coordinatorCodes || [],
        });
      }
      return hrmTasksApi.assignTask(task.id.toString(), {
        assigneeCode: data.employeeCode || '',
        departmentId: data.departmentId,
      });
    },
    onSuccess: (_, variables) => {
      if (variables.leadCode) {
        toast.success('Đã giao việc theo nhóm thành công!');
      } else {
        toast.success(variables.departmentId ? 'Đã giao việc cho Phòng ban!' : 'Đã giao việc trực tiếp cho cá nhân!');
      }
      queryClient.invalidateQueries({ queryKey: ['hrm-tasks'] });
      onAssignSuccess();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || 'Giao việc thất bại')
  });

  const toggleCoordinator = (code: string) => {
    if (code === leadCode) return;
    setCoordinatorCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleGroupAssignSubmit = () => {
    if (!leadCode) {
      toast.error('Vui lòng chọn 1 người Chủ trì');
      return;
    }
    assignMutation.mutate({ leadCode, coordinatorCodes });
  };

  const handleAssignToDepartment = (departmentId: number) => {
    if (!task) return;
    assignMutation.mutate({ departmentId });
  };

  const handleAssignToEmployee = (employeeCode: string) => {
    if (!task) return;
    assignMutation.mutate({ employeeCode });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600" /> Phân công thông minh
          </SheetTitle>
          <SheetDescription>
            Hệ thống tự động tính toán dựa trên khối lượng công việc hiện tại và hiệu suất của Phòng ban / Nhân viên.
          </SheetDescription>
        </SheetHeader>

        {task && (
          <div className="space-y-6 pb-20">
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Nhiệm vụ cần giao</p>
              <h4 className="font-semibold text-indigo-900">{task.title}</h4>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="font-bold text-slate-700 mb-2">Chiến lược phân công ưu tiên</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  onClick={() => setAssignStrategy('HIGH_PERFORMANCE')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${assignStrategy === 'HIGH_PERFORMANCE' ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02] z-10' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                >
                  <p className={`font-bold text-sm ${assignStrategy === 'HIGH_PERFORMANCE' ? 'text-indigo-700' : 'text-slate-700'}`}>🏆 Giỏi nhất</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Đảm bảo chất lượng công việc cao nhất</p>
                </div>
                <div
                  onClick={() => setAssignStrategy('UNDER_QUOTA')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${assignStrategy === 'UNDER_QUOTA' ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02] z-10' : 'border-slate-100 hover:border-emerald-200 bg-white'}`}
                >
                  <p className={`font-bold text-sm ${assignStrategy === 'UNDER_QUOTA' ? 'text-emerald-700' : 'text-slate-700'}`}>⚖️ Chưa đủ mức</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Ưu tiên người/phòng đang rảnh rỗi</p>
                </div>
                <div
                  onClick={() => setAssignStrategy('LOW_PERFORMANCE')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${assignStrategy === 'LOW_PERFORMANCE' ? 'border-amber-500 bg-amber-50 shadow-md scale-[1.02] z-10' : 'border-slate-100 hover:border-amber-200 bg-white'}`}
                >
                  <p className={`font-bold text-sm ${assignStrategy === 'LOW_PERFORMANCE' ? 'text-amber-700' : 'text-slate-700'}`}>📈 Cần cải thiện</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Tạo cơ hội nâng cao hiệu suất</p>
                </div>
              </div>
            </div>

            {/* Chế độ giao việc Toggle */}
            <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl w-full sm:max-w-md mx-auto my-8 border border-slate-200">
              <button
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${!isGroupMode ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => {
                  setIsGroupMode(false);
                  setLeadCode('');
                  setCoordinatorCodes([]);
                }}
              >
                Giao Cá nhân
              </button>
              <button
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isGroupMode ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setIsGroupMode(true)}
              >
                <Users className="w-4 h-4" />
                Giao theo nhóm
              </button>
            </div>

            <div className="flex flex-col h-full mt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center shrink-0">
                  <span className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded mr-3"></span> 
                  Danh sách đề xuất theo Đơn vị
                </h4>
                {/* Search input to look for any employee */}
                <div className="relative w-64 shrink-0">
                  <Input
                    placeholder="Tìm tên, mã cán bộ, phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-xl pl-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-indigo-300 transition-all text-sm font-medium shadow-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {isLoadingRecs ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(
                    filteredEmployees.reduce((acc: any, emp: any) => {
                      const dept = emp.departmentName || 'Chưa phân phòng';
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(emp);
                      return acc;
                    }, {})
                  ).map(([deptName, emps]: [string, any], groupIdx) => (
                    <div key={deptName} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          {deptName.charAt(0).toUpperCase()}
                        </div>
                        <h5 className="font-bold text-slate-700 text-sm">{deptName}</h5>
                        <Badge className="ml-auto bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors text-[10px]">{emps.length} nhân sự</Badge>
                      </div>
                      <div className="flex flex-col p-2 gap-2">
                        {emps.map((rec: any, idx: number) => {
                          const isLead = rec.employeeCode === leadCode;
                          const isCoordinator = coordinatorCodes.includes(rec.employeeCode);

                          return (
                            <div key={rec.employeeCode} className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${isLead ? 'bg-violet-50 border-violet-300 shadow-[0_4px_12px_rgba(139,92,246,0.15)]' : isCoordinator ? 'bg-amber-50 border-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.15)]' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200'}`}>
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`shrink-0 w-12 h-12 rounded-full shadow-inner flex justify-center items-center font-bold text-base text-white ${isLead ? 'bg-violet-500 ring-4 ring-violet-100' : isCoordinator ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-gradient-to-br from-indigo-500 to-violet-500 ring-2 ring-transparent group-hover:ring-indigo-100'}`}>
                                  {isLead ? <Crown className="w-5 h-5" /> : rec.employeeName?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{rec.employeeName}</p>
                                    {!isGroupMode && groupIdx === 0 && idx === 0 && !searchQuery && <Badge className="bg-indigo-500 text-[9px] uppercase px-1.5 py-0 h-4 animate-pulse shadow-sm shadow-indigo-200">Đề xuất ưu tiên</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                      Khối lượng: <b className="text-indigo-700">{Math.round(rec.currentLoad)}</b>
                                    </div>
                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                      Hiệu suất: <b className="text-emerald-600">{Math.round(rec.performanceScore)}</b>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {!isGroupMode ? (
                                <Button
                                  size="sm"
                                  disabled={assignMutation.isPending}
                                  className="shrink-0 ml-4 h-9 px-5 rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:shadow-indigo-200"
                                  onClick={() => handleAssignToEmployee(rec.employeeCode)}
                                >
                                  Giao việc
                                </Button>
                              ) : (
                                <div className="flex gap-2 shrink-0 ml-4">
                                  <button
                                    onClick={() => setLeadCode(rec.employeeCode)}
                                    title="Đặt làm Chủ trì"
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${isLead ? 'bg-violet-500 text-white shadow-violet-200 scale-105' : 'bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 hover:scale-105'}`}
                                  >
                                    {isLead ? <CheckCheck className="w-4 h-4" /> : 'Chủ trì'}
                                  </button>
                                  <button
                                    onClick={() => toggleCoordinator(rec.employeeCode)}
                                    title="Thêm vào Phối hợp"
                                    disabled={isLead}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm disabled:opacity-40 disabled:hover:scale-100 ${isCoordinator ? 'bg-amber-500 text-white shadow-amber-200 scale-105' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 hover:scale-105'}`}
                                  >
                                    {isCoordinator ? <CheckCheck className="w-4 h-4" /> : 'Phối hợp'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium">Không tìm thấy nhân sự phù hợp</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Sticky Footer for Group Mode */}
        {task && isGroupMode && (
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex items-center justify-between">
            <div className="text-sm text-slate-600 font-medium">
              {!leadCode ? (
                <span className="text-amber-600">Vui lòng chọn Chủ trì</span>
              ) : (
                <span>Đã chọn <b className="text-violet-700">1 Chủ trì</b> {coordinatorCodes.length > 0 && <span>và <b className="text-amber-600">{coordinatorCodes.length} Phối hợp</b></span>}</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={assignMutation.isPending}>Hủy</Button>
              <Button 
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md font-bold" 
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
