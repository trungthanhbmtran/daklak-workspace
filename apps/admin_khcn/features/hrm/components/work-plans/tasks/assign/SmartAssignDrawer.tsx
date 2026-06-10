import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlayCircle, Search } from 'lucide-react';
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
      (rec.departmentId && String(rec.departmentId).includes(query))
    );
  }, [topEmployees, searchQuery]);

  const assignMutation = useMutation({
    mutationFn: (data: { departmentId?: number, employeeCode?: string }) =>
      hrmTasksApi.assignTask(task.id.toString(), {
        assigneeCode: data.employeeCode || '',
        departmentId: data.departmentId,
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.departmentId ? 'Đã giao việc cho Phòng ban!' : 'Đã giao việc trực tiếp cho cá nhân!');
      queryClient.invalidateQueries({ queryKey: ['hrm-tasks'] });
      onAssignSuccess();
      onOpenChange(false);
    },
    onError: () => toast.error('Giao việc thất bại')
  });

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Cột Đề xuất Phòng ban */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <span className="w-1.5 h-5 bg-emerald-500 rounded mr-2"></span> Top Đề xuất Phòng ban
                </h4>
                {isLoadingRecs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topDepartments.map((rec: any, idx: number) => (
                      <div key={rec.departmentId} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                              P{rec.departmentId}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800">Phòng ban {rec.departmentId}</p>
                              <p className="text-xs text-slate-500">{rec.employeeCount} nhân sự</p>
                            </div>
                          </div>
                          {idx === 0 && <Badge className="bg-emerald-500 text-[9px] uppercase">Phù hợp nhất</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 p-2 bg-slate-50 rounded-lg">
                          <div>Tải TB: <b className="text-slate-700 block text-sm mt-0.5">{Math.round(rec.currentLoad)}</b></div>
                          <div>Hiệu suất TB: <b className="text-slate-700 block text-sm mt-0.5">{Math.round(rec.performanceScore)}</b></div>
                        </div>
                        <Button
                          size="sm"
                          disabled={assignMutation.isPending}
                          className="w-full rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          onClick={() => handleAssignToDepartment(rec.departmentId)}
                        >
                          Giao cho Phòng này
                        </Button>
                      </div>
                    ))}
                    {topDepartments.length === 0 && !isLoadingRecs && (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium">Không có gợi ý phòng ban phù hợp</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cột Đề xuất Cá nhân */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center">
                  <span className="w-1.5 h-5 bg-indigo-500 rounded mr-2"></span> Đề xuất Cá nhân
                </h4>
                
                {/* Search input to look for any employee */}
                <div className="relative mb-4">
                  <Input
                    placeholder="Tìm tên, mã cán bộ, phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-xl pl-9 bg-slate-50/50 border-slate-200 dark:border-slate-700 focus:bg-white transition-all text-xs font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {isLoadingRecs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {filteredEmployees.map((rec: any, idx: number) => (
                      <div key={rec.employeeCode} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-white flex justify-center items-center font-bold">
                              {rec.employeeName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800">{rec.employeeName}</p>
                              <p className="text-xs text-slate-500">Phòng {rec.departmentId || '?'}</p>
                            </div>
                          </div>
                          {idx === 0 && !searchQuery && <Badge className="bg-indigo-500 text-[9px] uppercase">Phù hợp nhất</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 p-2 bg-slate-50 rounded-lg">
                          <div>Tải việc: <b className="text-slate-700 block text-sm mt-0.5">{Math.round(rec.currentLoad)}</b></div>
                          <div>Hiệu suất: <b className="text-slate-700 block text-sm mt-0.5">{Math.round(rec.performanceScore)}</b></div>
                        </div>
                        <Button
                          size="sm"
                          disabled={assignMutation.isPending}
                          className="w-full rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                          onClick={() => handleAssignToEmployee(rec.employeeCode)}
                        >
                          Giao trực tiếp
                        </Button>
                      </div>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium">Không tìm thấy nhân sự phù hợp</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
