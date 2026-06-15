import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PlayCircle, 
  Search, 
  Activity, 
  Target,
  User,
  Users,
  X,
  CheckCircle2,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { hrmTasksApi, hrmApi } from "@/features/hrm/api";
import { cn } from '@/lib/utils';

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
      return enrichedEmployees.slice(0, 50); // Show more by default since it's compact
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

  const toggleSelectAllDept = (deptEmps: any[]) => {
    const deptCodes = deptEmps.map(emp => emp.employeeCode);
    // Remove leadCode from deptCodes if present
    const validCodes = deptCodes.filter(c => c !== leadCode);
    
    const allSelected = validCodes.every(c => coordinatorCodes.includes(c));
    
    if (allSelected) {
      // Remove all validCodes from coordinatorCodes
      setCoordinatorCodes(prev => prev.filter(c => !validCodes.includes(c)));
    } else {
      // Add all validCodes to coordinatorCodes
      setCoordinatorCodes(prev => Array.from(new Set([...prev, ...validCodes])));
    }
  };

  const handleGroupAssignSubmit = () => {
    if (!leadCode) {
      toast.error('Vui lòng chọn 1 người Giao chính');
      return;
    }
    assignMutation.mutate({ leadCode, coordinatorCodes });
  };

  const leadDetails = useMemo(() => enrichedEmployees.find((e: any) => e.employeeCode === leadCode), [leadCode, enrichedEmployees]);
  const coordinatorDetails = useMemo(() => enrichedEmployees.filter((e: any) => coordinatorCodes.includes(e.employeeCode)), [coordinatorCodes, enrichedEmployees]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto font-sans p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600" /> Phân công thông minh
          </SheetTitle>
          <SheetDescription>
            Hệ thống tự động tính toán khối lượng công việc và gợi ý nhân sự phù hợp. Chọn nhanh người bằng checkbox.
          </SheetDescription>
        </SheetHeader>

        {task && (
          <div className="space-y-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Task Card details */}
              <Card className="border-l-4 border-l-indigo-600 rounded-lg">
                <CardHeader className="py-4">
                  <CardDescription className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Target className="w-3.5 h-3.5" /> Nhiệm vụ cần giao
                  </CardDescription>
                  <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
                </CardHeader>
                {task.description && (
                  <CardContent className="pt-0 pb-4">
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {task.description}
                    </p>
                  </CardContent>
                )}
              </Card>

              {/* Strategic select section */}
              <Card className="rounded-lg bg-slate-50 dark:bg-slate-900 border-dashed">
                <CardContent className="p-4 flex flex-col justify-center h-full gap-3">
                  <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Chiến lược ưu tiên gợi ý
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={assignStrategy === 'HIGH_PERFORMANCE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAssignStrategy('HIGH_PERFORMANCE')}
                      className={cn("text-xs h-9", assignStrategy === 'HIGH_PERFORMANCE' && "bg-indigo-600 hover:bg-indigo-700")}
                    >
                      🏆 Giỏi nhất
                    </Button>
                    <Button
                      variant={assignStrategy === 'UNDER_QUOTA' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAssignStrategy('UNDER_QUOTA')}
                      className={cn("text-xs h-9", assignStrategy === 'UNDER_QUOTA' && "bg-emerald-600 hover:bg-emerald-700")}
                    >
                      ⚖️ Ít tải nhất
                    </Button>
                    <Button
                      variant={assignStrategy === 'LOW_PERFORMANCE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAssignStrategy('LOW_PERFORMANCE')}
                      className={cn("text-xs h-9", assignStrategy === 'LOW_PERFORMANCE' && "bg-amber-600 hover:bg-amber-700")}
                    >
                      📈 Cần rèn luyện
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Assignees Area */}
            {(leadCode || coordinatorCodes.length > 0) && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-4 animate-in fade-in zoom-in-95 duration-200">
                <Label className="font-semibold text-xs text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-3 block">
                  Nhân sự đã chọn ({1 + coordinatorCodes.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {/* Lead Chip */}
                  {leadDetails && (
                    <Badge variant="default" className="pl-1 pr-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-sm gap-2">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                        L
                      </div>
                      <span className="font-semibold">{leadDetails.employeeName}</span>
                      <button onClick={() => setLeadCode('')} className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {/* Coordinator Chips */}
                  {coordinatorDetails.map((coord: any) => (
                    <Badge key={coord.employeeCode} variant="secondary" className="pl-1 pr-2 py-1 bg-white dark:bg-slate-800 border-slate-200 text-sm gap-2 font-medium">
                      <div className="w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs text-slate-500">
                        C
                      </div>
                      {coord.employeeName}
                      <button onClick={() => toggleCoordinator(coord.employeeCode)} className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5 transition-colors text-slate-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Main listing and search section */}
            <div className="flex flex-col h-full mt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h4 className="text-sm font-semibold flex items-center shrink-0">
                  Danh sách nhân sự (Gợi ý)
                </h4>
                <div className="relative w-full sm:w-80 shrink-0">
                  <Input
                    placeholder="Tìm theo tên, mã cán bộ, phòng ban..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                </div>
              </div>

              {isLoadingRecs ? (
                <Card className="py-12 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
                    <p className="text-sm text-muted-foreground">Đang phân tích dữ liệu hiệu suất...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {Object.entries(
                    filteredEmployees.reduce((acc: any, emp: any) => {
                      const dept = emp.departmentName || 'Chưa phân phòng';
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(emp);
                      return acc;
                    }, {})
                  ).map(([deptName, emps]: [string, any]) => {
                    const validCoords = emps.filter((e: any) => e.employeeCode !== leadCode);
                    const isAllSelected = validCoords.length > 0 && validCoords.every((e: any) => coordinatorCodes.includes(e.employeeCode));
                    
                    return (
                      <Card key={deptName} className="overflow-hidden shadow-sm">
                        {/* Department Header */}
                        <div className="bg-slate-50/80 dark:bg-slate-900/50 px-4 py-2 border-b flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {deptName} <Badge variant="secondary" className="text-[10px] ml-1">{emps.length}</Badge>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleSelectAllDept(emps)}
                            className={cn("h-7 text-xs px-2", isAllSelected ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500")}
                            disabled={validCoords.length === 0}
                          >
                            {isAllSelected ? <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> : <Users className="w-3.5 h-3.5 mr-1.5" />}
                            {isAllSelected ? 'Đã chọn tất cả phối hợp' : 'Chọn tất cả phối hợp'}
                          </Button>
                        </div>
                        
                        {/* Compact Employee List */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {emps.map((rec: any) => {
                            const isLead = rec.employeeCode === leadCode;
                            const isCoordinator = coordinatorCodes.includes(rec.employeeCode);

                            // Workload capacity bar calculation
                            const loadRatio = Math.min(1, rec.currentLoad / (rec.rankLimit || 5));
                            const loadPercentage = Math.round(loadRatio * 100);

                            return (
                              <div 
                                key={rec.employeeCode} 
                                className={cn(
                                  "flex items-center justify-between p-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                                  isLead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : isCoordinator ? "bg-slate-50/80 dark:bg-slate-800/30" : ""
                                )}
                              >
                                {/* Left: Info & Stats */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {/* Avatar */}
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all",
                                    isLead ? "bg-indigo-600 text-white ring-2 ring-indigo-200" : isCoordinator ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-500"
                                  )}>
                                    {rec.employeeName?.charAt(0) || '?'}
                                  </div>
                                  
                                  {/* Details */}
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className={cn("font-semibold text-sm truncate", isLead && "text-indigo-700 dark:text-indigo-400")}>
                                        {rec.employeeName}
                                      </p>
                                      <span className="text-[10px] text-muted-foreground uppercase">{rec.employeeCode}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                      <span className="truncate max-w-[120px]" title={rec.jobTitleName}>{rec.jobTitleName}</span>
                                      
                                      <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                                        <Activity className="w-3 h-3 text-indigo-400" />
                                        <span>Tải: <b className={cn(loadPercentage >= 100 ? "text-rose-500" : "text-slate-700 dark:text-slate-300")}>{rec.currentLoad}/{rec.rankLimit || 5}</b></span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                                        <span>KPI: <b className="text-emerald-600 dark:text-emerald-400">{Math.round(rec.performanceScore)}</b></span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Actions (Radio for Lead, Checkbox for Coordinator) */}
                                <div className="flex items-center gap-4 shrink-0 pl-4">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium hover:text-indigo-600 transition-colors">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                      isLead ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                                    )}>
                                      {isLead && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={cn(isLead ? "text-indigo-700 dark:text-indigo-400 font-bold" : "text-muted-foreground")} onClick={() => handleSetLead(rec.employeeCode)}>
                                      Giao chính
                                    </span>
                                  </label>

                                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium hover:text-slate-800 transition-colors">
                                    <Checkbox 
                                      checked={isCoordinator}
                                      onCheckedChange={() => toggleCoordinator(rec.employeeCode)}
                                      disabled={isLead}
                                      className="w-4 h-4"
                                    />
                                    <span className={cn(isCoordinator ? "text-foreground font-bold" : "text-muted-foreground")}>
                                      Phối hợp
                                    </span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    );
                  })}
                  
                  {filteredEmployees.length === 0 && (
                    <Card className="py-12 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center text-center">
                        <Users className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="font-semibold text-sm">Không tìm thấy nhân sự phù hợp</p>
                        <p className="text-xs text-muted-foreground mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Footer */}
        {task && (
          <div className="absolute bottom-0 left-0 w-full bg-background border-t p-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              {!leadCode ? (
                <span className="text-destructive font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Vui lòng chọn 1 người Giao chính
                </span>
              ) : (
                <span className="text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Sẵn sàng giao việc
                </span>
              )}
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => onOpenChange(false)} 
                disabled={assignMutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700"
                disabled={!leadCode || assignMutation.isPending}
                onClick={handleGroupAssignSubmit}
              >
                Xác nhận phân công
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

