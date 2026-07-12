'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PlayCircle,
  Search,
  Activity,
  Users,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { hrmTasksApi, hrmApi } from "@/features/hrm/api";
import { hrmKeys } from '@/features/hrm/keys';
import { cn } from '@/lib/utils';

interface SmartAssignDrawerProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmartAssignDrawer({ task, open, onOpenChange }: SmartAssignDrawerProps) {
  const queryClient = useQueryClient();
  const [assignStrategy, setAssignStrategy] = useState<string>('HIGH_PERFORMANCE');
  const [leadCode, setLeadCode] = useState<string>('');
  const [coordinatorCodes, setCoordinatorCodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lấy dữ liệu tất cả nhân sự để map Phòng ban/Chức vụ
  const { data: allEmployeesRes } = useQuery({
    queryKey: ['hrm-employees-dict'],
    queryFn: () => hrmApi.list({ pageSize: 150, assignableOnly: true }),
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

  // Lấy danh sách gợi ý phân công từ API
  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ['smart-assign', task?.id, assignStrategy],
    queryFn: async () => {
      const res: any = await hrmTasksApi.recommendAssignees({
        rankCode: 'ALL',
        strategy: assignStrategy,
        domainId: task?.domainId,
        jobTitleId: task?.jobTitleId
      });
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

  // Trộn dữ liệu Gợi ý + Thực tế
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

  // Bộ lọc tìm kiếm
  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return enrichedEmployees;
    return enrichedEmployees.filter((rec: any) =>
      (rec.employeeName || '').toLowerCase().includes(query) ||
      (rec.employeeCode || '').toLowerCase().includes(query) ||
      (rec.departmentName || '').toLowerCase().includes(query) ||
      (rec.jobTitleName || '').toLowerCase().includes(query)
    );
  }, [enrichedEmployees, searchQuery]);

  // API Call: Thực hiện giao việc
  const assignMutation = useMutation({
    mutationFn: (data: { leadCode: string; coordinatorCodes: string[] }) => {
      if (!task?.id) return Promise.reject(new Error("Missing task ID"));
      return hrmTasksApi.assignTask(task.id, {
        assigneeCode: data.leadCode,
        coAssigneeCodes: data.coordinatorCodes,
      });
    },
    onSuccess: () => {
      toast.success('Giao việc thành công!');
      queryClient.invalidateQueries({ queryKey: hrmKeys.tasks() });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || 'Giao việc thất bại')
  });

  // ─── CLICK BEHAVIOR ──────────────────────────────────────────────────────────

  const handleRowClick = (code: string) => {
    // Logic "1-click thông minh":
    // 1. Nếu người này đang là Chủ trì -> Bỏ Chủ trì
    // 2. Nếu người này đang là Phối hợp -> Bỏ Phối hợp
    // 3. Nếu chưa có Chủ trì -> Đặt làm Chủ trì
    // 4. Nếu đã có Chủ trì -> Đặt làm Phối hợp

    if (code === leadCode) {
      setLeadCode('');
    } else if (coordinatorCodes.includes(code)) {
      setCoordinatorCodes(prev => prev.filter(c => c !== code));
    } else if (!leadCode) {
      setLeadCode(code);
    } else {
      setCoordinatorCodes(prev => [...prev, code]);
    }
  };

  const handleSetLeadExplicit = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (leadCode === code) return;
    setLeadCode(code);
    setCoordinatorCodes(prev => prev.filter(c => c !== code));
  };

  const handleGroupAssignSubmit = () => {
    if (!leadCode) {
      toast.error('Vui lòng chọn 1 người Chủ trì');
      return;
    }
    assignMutation.mutate({ leadCode, coordinatorCodes });
  };

  // ─── UTILS ───────────────────────────────────────────────────────────────────

  const leadDetails = useMemo(() => enrichedEmployees.find((e: any) => e.employeeCode === leadCode), [leadCode, enrichedEmployees]);
  const coordinatorDetails = useMemo(() => enrichedEmployees.filter((e: any) => coordinatorCodes.includes(e.employeeCode)), [coordinatorCodes, enrichedEmployees]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl font-sans p-0 flex flex-col overflow-hidden h-[90vh] sm:h-[80vh] rounded-2xl bg-slate-50 dark:bg-slate-900 border-0 shadow-2xl">
        
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-950 px-6 py-4 border-b border-border z-10 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <PlayCircle className="w-5 h-5" /> Phân công người thực hiện
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-foreground line-clamp-1 mt-1">
              Nhiệm vụ: {task?.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* SEARCH & STRATEGY */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Tìm nhân sự..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-slate-800 border-border rounded-xl text-sm"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            </div>
            
            <Select value={assignStrategy} onValueChange={setAssignStrategy}>
              <SelectTrigger className="w-full sm:w-[220px] h-11 bg-white dark:bg-slate-800 border-border rounded-xl font-semibold text-sm">
                <SelectValue placeholder="Tiêu chí gợi ý" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="HIGH_PERFORMANCE">🏆 Giỏi nhất (Ưu tiên)</SelectItem>
                <SelectItem value="UNDER_QUOTA">⚖️ Ít tải nhất</SelectItem>
                <SelectItem value="LOW_PERFORMANCE">📈 Cần rèn luyện</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SELECTED AREA (CHỈ HIỆN KHI ĐÃ CHỌN) */}
          {(leadCode || coordinatorCodes.length > 0) && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Đã chọn
              </div>
              <div className="flex flex-wrap gap-2">
                {leadDetails && (
                  <Badge className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-[13px] gap-2 rounded-lg pr-1">
                    <span className="opacity-70 text-[10px] uppercase">👑 Chủ trì</span>
                    <span className="font-bold">{leadDetails.employeeName}</span>
                    <button onClick={() => setLeadCode('')} className="ml-1 p-0.5 hover:bg-white/20 rounded-md transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                )}
                
                {coordinatorDetails.map((coord: any) => (
                  <Badge key={coord.employeeCode} variant="outline" className="px-2 py-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[13px] gap-2 font-medium rounded-lg pr-1 shadow-sm">
                    <span className="opacity-50 text-[10px] uppercase text-slate-500">🤝 Phối hợp</span>
                    <span className="text-foreground">{coord.employeeName}</span>
                    <button onClick={() => setCoordinatorCodes(prev => prev.filter(c => c !== coord.employeeCode))} className="ml-1 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-md transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* LIST */}
          <div className="space-y-3">
            {isLoadingRecs ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
                <p className="text-sm font-medium">Đang tính toán nhân sự phù hợp...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Users className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-semibold text-sm">Không tìm thấy nhân sự phù hợp</p>
                <p className="text-xs mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredEmployees.map((rec: any) => {
                  const isLead = rec.employeeCode === leadCode;
                  const isCoordinator = coordinatorCodes.includes(rec.employeeCode);
                  const isSelected = isLead || isCoordinator;

                  // Tính thanh progress workload
                  const loadRatio = Math.min(1, rec.currentLoad / (rec.rankLimit || 5));
                  const loadPercentage = Math.round(loadRatio * 100);
                  const isOverload = loadPercentage >= 100;

                  return (
                    <div 
                      key={rec.employeeCode} 
                      onClick={() => handleRowClick(rec.employeeCode)}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-950 transition-all cursor-pointer",
                        isLead 
                          ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10" 
                          : isCoordinator 
                          ? "border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-900" 
                          : "border-border hover:border-indigo-300 hover:shadow-sm"
                      )}
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-[15px] transition-colors",
                          isLead ? "bg-indigo-600 text-white shadow-md" : isCoordinator ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                        )}>
                          {rec.employeeName?.charAt(0) || '?'}
                        </div>
                        
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className={cn("font-bold text-sm truncate", isLead && "text-indigo-700 dark:text-indigo-400")}>
                            {rec.employeeName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {rec.jobTitleName || 'Cán bộ'} • {rec.departmentName || 'Chưa phân phòng'}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Stats */}
                      <div className="hidden sm:flex flex-col gap-1 shrink-0 px-4 w-[120px] justify-center text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tải CV:</span>
                          <span className={cn("font-bold", isOverload ? "text-rose-500" : "text-foreground")}>
                            {rec.currentLoad}/{rec.rankLimit || 5}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">KPI:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {Math.round(rec.performanceScore)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions / Status */}
                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        {isLead ? (
                          <div className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-in zoom-in">
                            <CheckCircle2 className="w-4 h-4" /> Chủ trì
                          </div>
                        ) : isCoordinator ? (
                          <div className="px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-in zoom-in">
                            🤝 Phối hợp
                          </div>
                        ) : (
                          <>
                            {/* Nút ép chọn làm Chủ trì (dành cho trường hợp list đã có Chủ trì nhưng muốn đổi) */}
                            {leadCode && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hidden group-hover:flex h-8 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                onClick={(e) => handleSetLeadExplicit(rec.employeeCode, e)}
                              >
                                Chọn làm Chủ trì
                              </Button>
                            )}
                            <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:border-indigo-400 group-hover:text-indigo-400 transition-colors">
                              +
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white dark:bg-slate-950 p-4 border-t border-border z-10 shrink-0 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            {!leadCode ? (
              <span className="text-rose-500 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Vui lòng chọn 1 người Chủ trì
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Sẵn sàng giao việc
              </span>
            )}
          </div>
          
          <div className="flex flex-1 sm:flex-none gap-2">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-bold"
              onClick={() => onOpenChange(false)} 
              disabled={assignMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 sm:flex-none h-11 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
              disabled={!leadCode || assignMutation.isPending}
              onClick={handleGroupAssignSubmit}
            >
              Xác nhận
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
