import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PlayCircle, 
  Search, 
  CheckCheck, 
  Activity, 
  Target,
  User,
  Users
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
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto font-sans p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600" /> Phân công thông minh
          </SheetTitle>
          <SheetDescription>
            Hệ thống tự động tính toán dựa trên khối lượng công việc hiện tại và hiệu suất của Phòng ban / Nhân viên.
          </SheetDescription>
        </SheetHeader>

        {task && (
          <div className="space-y-6 pb-24">
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
            <div className="flex flex-col gap-2">
              <Label className="font-semibold text-sm uppercase tracking-wider mb-2">
                Chiến lược phân công ưu tiên
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  onClick={() => setAssignStrategy('HIGH_PERFORMANCE')}
                  className={cn(
                    "cursor-pointer transition-all",
                    assignStrategy === 'HIGH_PERFORMANCE' 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm' 
                      : 'hover:border-indigo-300'
                  )}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <div className="text-2xl mb-2">🏆</div>
                      <p className={cn("font-bold text-sm", assignStrategy === 'HIGH_PERFORMANCE' ? 'text-indigo-700 dark:text-indigo-400' : '')}>Giỏi nhất</p>
                      <p className="text-xs text-muted-foreground mt-1">Ưu tiên cán bộ có điểm KPI & hiệu suất cao nhất.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => setAssignStrategy('UNDER_QUOTA')}
                  className={cn(
                    "cursor-pointer transition-all",
                    assignStrategy === 'UNDER_QUOTA' 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm' 
                      : 'hover:border-emerald-300'
                  )}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <div className="text-2xl mb-2">⚖️</div>
                      <p className={cn("font-bold text-sm", assignStrategy === 'UNDER_QUOTA' ? 'text-emerald-700 dark:text-emerald-400' : '')}>Ít tải nhất</p>
                      <p className="text-xs text-muted-foreground mt-1">Ưu tiên nhân sự có ít đầu việc đang làm nhất.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => setAssignStrategy('LOW_PERFORMANCE')}
                  className={cn(
                    "cursor-pointer transition-all",
                    assignStrategy === 'LOW_PERFORMANCE' 
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm' 
                      : 'hover:border-amber-300'
                  )}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <div className="text-2xl mb-2">📈</div>
                      <p className={cn("font-bold text-sm", assignStrategy === 'LOW_PERFORMANCE' ? 'text-amber-700 dark:text-amber-400' : '')}>Cần rèn luyện</p>
                      <p className="text-xs text-muted-foreground mt-1">Ưu tiên tạo cơ hội cọ xát cho cán bộ mới/ít việc.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main listing and search section */}
            <div className="flex flex-col h-full mt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h4 className="text-sm font-semibold flex items-center shrink-0">
                  Danh sách đề xuất nhân viên
                </h4>
                <div className="relative w-full sm:w-72 shrink-0">
                  <Input
                    placeholder="Tìm tên, mã cán bộ, phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                </div>
              </div>

              {isLoadingRecs ? (
                <Card className="py-12 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
                    <p className="text-sm text-muted-foreground">Đang tổng hợp dữ liệu nhân sự...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-6">
                  {Object.entries(
                    filteredEmployees.reduce((acc: any, emp: any) => {
                      const dept = emp.departmentName || 'Chưa phân phòng';
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(emp);
                      return acc;
                    }, {})
                  ).map(([deptName, emps]: [string, any]) => (
                    <Card key={deptName} className="overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {deptName.charAt(0).toUpperCase()}
                        </div>
                        <h5 className="font-semibold text-sm">{deptName}</h5>
                        <Badge variant="secondary" className="ml-auto">
                          {emps.length} nhân sự
                        </Badge>
                      </div>
                      
                      <div className="divide-y">
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
                                "flex flex-col md:flex-row md:items-center justify-between p-4 transition-colors",
                                isLead ? "bg-indigo-50/50 dark:bg-indigo-900/20" : isCoordinator ? "bg-amber-50/50 dark:bg-amber-900/20" : "hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                  <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm truncate text-foreground">
                                      {rec.employeeName}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] uppercase font-mono px-1">
                                      {rec.employeeCode}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {rec.jobTitleName}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Activity className="w-3.5 h-3.5" />
                                      Tải: {rec.currentLoad}/{rec.rankLimit || 5}
                                    </div>
                                    <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                      <div 
                                        className={cn(
                                          "h-full rounded-full transition-all duration-500",
                                          loadPercentage >= 100 ? "bg-destructive" : loadPercentage >= 60 ? "bg-warning" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${loadPercentage}%` }} 
                                      />
                                    </div>
                                    <div className="text-xs font-semibold">KPI: {Math.round(rec.performanceScore)}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <Button
                                  variant={isLead ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleSetLead(rec.employeeCode)}
                                  className={cn("text-xs shadow-none", isLead ? "" : "border-dashed")}
                                >
                                  {isLead && <CheckCheck className="w-3.5 h-3.5 mr-1.5" />}
                                  Giao chính
                                </Button>
                                <Button
                                  variant={isCoordinator ? "secondary" : "outline"}
                                  size="sm"
                                  onClick={() => toggleCoordinator(rec.employeeCode)}
                                  className={cn("text-xs shadow-none", isCoordinator ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-dashed")}
                                  disabled={isLead}
                                >
                                  {isCoordinator && <CheckCheck className="w-3.5 h-3.5 mr-1.5" />}
                                  Phối hợp
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                  
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
                <span className="text-destructive font-medium">Vui lòng chọn 1 người Giao chính</span>
              ) : (
                <span className="text-foreground">
                  Đã chọn <b className="font-bold">1 Giao chính</b> 
                  {coordinatorCodes.length > 0 && (
                    <span> và <b className="font-bold">{coordinatorCodes.length} Phối hợp</b></span>
                  )}
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
                Hủy
              </Button>
              <Button
                className="flex-1 sm:flex-none"
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

