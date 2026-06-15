"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Check,
  ChevronsUpDown,
  Activity,
  Sparkles,
  Calendar,
  AlertTriangle,
  UserCheck,
  Layers,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmTasksApi } from "@/features/hrm/api";
import { useHrmEmployeesList } from "@/features/hrm/hooks";
import { organizationApi } from "@/features/system-admin/organization/api";

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: (assignedTaskId?: string) => void;
  task: any;
}

function flattenUnits(nodes: any[], acc: any[] = [], parentPath: string = "", level: number = 0): any[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({ id: node.id, name: node.name, fullPath: currentPath, code: node.code, level });
    }
    flattenUnits(node.children ?? [], acc, currentPath, level + 1);
  }
  return acc;
}

// ==========================================
// SUB-COMPONENTS (MEMOIZED FOR PERFORMANCE)
// ==========================================

const HeaderCard = React.memo(function HeaderCard({
  title,
  assigneeName,
  assigneeUnitName,
}: {
  title: string;
  assigneeName?: string;
  assigneeUnitName?: string;
}) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 md:p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10 md:pr-12">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-100" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200/90">Phân công thực hiện</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight truncate">
            {title}
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          {assigneeName && (
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <span className="opacity-75">Chủ trì hiện tại:</span>
              <span className="font-bold text-indigo-100">{assigneeName}</span>
            </div>
          )}
          {assigneeUnitName && (
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <span className="opacity-75">Đơn vị:</span>
              <span className="font-bold text-indigo-100">{assigneeUnitName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const DepartmentSelector = React.memo(function DepartmentSelector({
  selectedDeptId,
  setSelectedDeptId,
  units,
}: {
  selectedDeptId: string;
  setSelectedDeptId: (id: string) => void;
  units: any[];
}) {
  const [openDeptPopover, setOpenDeptPopover] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đơn vị chuyên môn</label>
      <Popover open={openDeptPopover} onOpenChange={setOpenDeptPopover}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-left font-semibold px-4 rounded-xl text-slate-700 dark:text-slate-350">
            <span className="truncate">
              {selectedDeptId === 'ALL' 
                ? "🏢 Tất cả đơn vị" 
                : (units.find(u => String(u.id) === selectedDeptId)?.name || "Chọn đơn vị...")}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[320px] sm:min-w-[420px] max-w-[95vw] p-0 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" align="start">
          <Command className="dark:bg-slate-900">
            <CommandInput placeholder="Tìm kiếm đơn vị..." className="h-11 border-none focus:ring-0" />
            <CommandList className="max-h-[280px]">
              <CommandEmpty className="p-4 text-center text-xs text-slate-500">Không tìm thấy đơn vị</CommandEmpty>
              <CommandGroup className="p-1.5">
                <CommandItem
                  value="ALL"
                  onSelect={() => {
                    setSelectedDeptId('ALL');
                    setOpenDeptPopover(false);
                  }}
                  className={cn(
                    "px-4 py-2.5 my-0.5 rounded-xl cursor-pointer flex items-center text-xs transition-all",
                    selectedDeptId === 'ALL'
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400", selectedDeptId === 'ALL' ? "opacity-100" : "opacity-0")} />
                  <span className="mr-1.5 shrink-0">🏢</span>
                  <span className="truncate font-bold">Tất cả đơn vị</span>
                </CommandItem>
                {units.map((unit) => {
                  const isSelected = selectedDeptId === String(unit.id);
                  return (
                    <CommandItem
                      key={unit.id}
                      value={`${unit.name} ${unit.code || ''} ${unit.fullPath || ''}`}
                      onSelect={() => {
                        setSelectedDeptId(String(unit.id));
                        setOpenDeptPopover(false);
                      }}
                      className={cn(
                        "px-4 py-2.5 my-0.5 rounded-xl cursor-pointer flex items-center text-xs transition-all",
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                      style={{ paddingLeft: `${unit.level * 16 + 16}px` }}
                    >
                      <Check className={cn("mr-2 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="mr-1.5 text-slate-400 dark:text-slate-500 shrink-0">
                        {unit.level > 0 ? "↳ 📁" : "🏢"}
                      </span>
                      <span className="truncate">{unit.name}</span>
                      {unit.code && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 font-normal shrink-0">
                          ({unit.code})
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});

const EmployeeSelector = React.memo(function EmployeeSelector({
  assigneeCode,
  coAssigneeCodes,
  onChangeAssignee,
  onChangeCoAssignees,
  groupedEmployees,
  assignableEmployees,
}: {
  assigneeCode: string;
  coAssigneeCodes: string[];
  onChangeAssignee: (code: string) => void;
  onChangeCoAssignees: (codes: string[]) => void;
  groupedEmployees: { [key: string]: any[] };
  assignableEmployees: any[];
}) {
  const [openPopover, setOpenPopover] = useState(false);

  const currentEmpMapped = assignableEmployees.find(e => e.code === assigneeCode);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
          Nhân sự <span className="text-red-500">*</span>
        </label>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-[10px] bg-indigo-50 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 font-bold rounded-full flex items-center gap-1 transition-all"
          onClick={() => {
            if (assignableEmployees.length > 0) {
              onChangeAssignee(assignableEmployees[0].code);
              toast.success(`Đã chọn chủ trì chính: ${assignableEmployees[0].name}`);
            }
          }}
          type="button"
        >
          <Sparkles className="w-3 h-3" /> Giao thông minh
        </Button>
      </div>

      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-between h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-left font-semibold px-4 rounded-xl", !currentEmpMapped && "text-slate-500")}>
            <span className="truncate">
              {currentEmpMapped
                ? `${currentEmpMapped.name}${coAssigneeCodes.length > 0 ? ` (+ ${coAssigneeCodes.length} người)` : ''}`
                : "Bấm để chọn nhân sự..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[320px] sm:min-w-[420px] max-w-[95vw] p-0 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden" align="end">
          <Command className="dark:bg-slate-900">
            <CommandInput placeholder="Tìm kiếm theo tên hoặc chức vụ..." className="h-11 border-none focus:ring-0" />
            <CommandList className="max-h-[320px] overflow-y-auto">
              <CommandEmpty className="p-4 text-center text-xs text-slate-500">Không tìm thấy nhân sự phù hợp</CommandEmpty>
              <CommandGroup className="p-1.5">
                {assignableEmployees.map((emp: any, idx: number) => {
                    const isMain = assigneeCode === emp.code;
                    const isCo = coAssigneeCodes.includes(emp.code);
                    const isSelected = isMain || isCo;

                    return (
                      <CommandItem
                        key={emp.code}
                        value={`${emp.name} ${emp.jobTitle?.name || ''} ${emp.department?.name || ''}`}
                        onSelect={() => {
                          if (isMain) {
                            onChangeAssignee('');
                          } else if (isCo) {
                            onChangeCoAssignees(coAssigneeCodes.filter(c => c !== emp.code));
                          } else if (!assigneeCode) {
                            onChangeAssignee(emp.code);
                          } else {
                            onChangeCoAssignees([...coAssigneeCodes, emp.code]);
                          }
                        }}
                        className={cn("px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all my-0.5",
                          idx === 0 && "bg-slate-50/50 dark:bg-slate-800/30",
                          emp.isOverloaded && "opacity-80"
                        )}
                      >
                        <div className={cn("flex items-center justify-center w-5 h-5 rounded-md border transition-all shrink-0", isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white dark:bg-slate-950")}>
                          <Check className={cn("h-3.5 w-3.5", isSelected ? "opacity-100" : "opacity-0")} />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{emp.name}</span>
                              <span className="text-[10px] text-slate-500 truncate">- {emp.jobTitle?.name || 'Cán bộ'} ({emp.department?.name || 'Chưa xác định'})</span>
                            </div>
                            {(isMain || isCo || emp.isOverloaded) && (
                              <div className="flex gap-1.5 mt-1">
                                {isMain && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">Chủ trì</span>}
                                {isCo && <span className="text-[9px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">Phối hợp</span>}
                                {emp.isOverloaded && <span className="text-[9px] bg-red-100 dark:bg-red-950/20 text-red-655 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">Quá tải</span>}
                              </div>
                            )}
                          </div>
                          <span className={cn("text-[10px] font-bold shrink-0 whitespace-nowrap px-2 py-1 rounded bg-slate-100 dark:bg-slate-800", emp.isOverloaded ? "text-red-500 bg-red-50 dark:bg-red-950/20" : "text-indigo-600 dark:text-indigo-400")}>
                            Còn {emp.availableCapacity}đ
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});

const SelectedPersonnel = React.memo(function SelectedPersonnel({
  currentEmpMapped,
  coAssigneeCodes,
  allEmployees,
  onChangeAssignee,
  onChangeCoAssignees,
}: {
  currentEmpMapped: any;
  coAssigneeCodes: string[];
  allEmployees: any[];
  onChangeAssignee: (code: string) => void;
  onChangeCoAssignees: (codes: string[]) => void;
}) {
  const getEmployeeName = (code: string) => {
    const emp = allEmployees.find((e: any) => e.employeeCode === code);
    return emp ? emp.fullName || [emp.firstname, emp.lastname].filter(Boolean).join(' ') : code;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhân sự tham gia thực hiện</h3>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 font-bold">
          Tổng: {currentEmpMapped ? 1 : 0 + coAssigneeCodes.length} cán bộ
        </span>
      </div>
      
      {/* Chủ trì chính */}
      {currentEmpMapped && (
        <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/80 dark:border-indigo-900/20 flex items-start gap-3.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            {currentEmpMapped.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{currentEmpMapped.name}</span>
              <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Chủ trì chính</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{currentEmpMapped.jobTitle?.name || 'Cán bộ thực hiện'} • {currentEmpMapped.department?.name || 'Đơn vị'}</p>
            
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-350">
                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-indigo-500" /> Năng lực định mức:</span>
                <span className={currentEmpMapped.isOverloaded ? "text-red-655" : "text-indigo-600 dark:text-indigo-400"}>
                  {currentEmpMapped.currentLoad} / {currentEmpMapped.rankLimit} đ (còn {currentEmpMapped.availableCapacity}đ)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    currentEmpMapped.isOverloaded ? "bg-red-500" : "bg-indigo-600"
                  )}
                  style={{ width: `${Math.min(100, (currentEmpMapped.currentLoad / currentEmpMapped.rankLimit) * 100)}%` }}
                />
              </div>
            </div>
            
            {currentEmpMapped.isOverloaded && (
              <div className="text-[10px] text-red-655 font-bold mt-1.5 flex items-center gap-1 bg-red-50 dark:bg-red-950/20 p-1.5 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Cán bộ chủ trì đang bị quá tải công việc!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danh sách phối hợp */}
      {coAssigneeCodes.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cán bộ phối hợp</span>
          <div className="max-h-[200px] overflow-y-auto pr-1.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <div className="grid grid-cols-1 gap-2">
              {coAssigneeCodes.map(code => {
                const name = getEmployeeName(code);
                const emp = allEmployees.find((e: any) => e.employeeCode === code);
                return (
                  <div key={code} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/60 flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-350 font-bold text-xs">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-xs truncate">{name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{emp?.jobTitle?.name || 'Cán bộ phối hợp'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-1.5 text-indigo-650 hover:bg-indigo-100/40 font-bold rounded"
                        onClick={() => {
                          onChangeAssignee(code);
                          onChangeCoAssignees([...coAssigneeCodes.filter(c => c !== code), ...(currentEmpMapped ? [currentEmpMapped.code] : [])]);
                        }}
                      >
                        Đổi chủ trì
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 rounded"
                        onClick={() => {
                          onChangeCoAssignees(coAssigneeCodes.filter(c => c !== code));
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const TaskParameters = React.memo(function TaskParameters({
  priority,
  weight,
  baseScore,
  startDate,
  dueDate,
  onChange,
}: {
  priority: string;
  weight: number;
  baseScore: number;
  startDate: string;
  dueDate: string;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-5">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-500" /> Tham số & Kế hoạch
      </h3>
      
      <div className="space-y-4">
        {/* Độ ưu tiên */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Độ ưu tiên</label>
          <Select value={priority} onValueChange={(v) => onChange('priority', v)}>
            <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold rounded-xl text-slate-700 dark:text-slate-350">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="HIGH">🔴 Cao (High)</SelectItem>
              <SelectItem value="MEDIUM">🟡 Trung bình (Medium)</SelectItem>
              <SelectItem value="LOW">🟢 Thấp (Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid 2 cột cho các tham số điểm/trọng số */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Trọng số */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trọng số</label>
            <div className="relative">
              <Input
                type="number"
                value={weight}
                onChange={(e) => onChange('weight', Number(e.target.value))}
                className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold rounded-xl pr-8"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* Điểm số */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm gốc</label>
            <Input
              type="number"
              value={baseScore}
              onChange={(e) => onChange('baseScore', Number(e.target.value))}
              className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold rounded-xl"
            />
          </div>
        </div>

        {/* Grid 2 cột cho thời gian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Ngày bắt đầu */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày bắt đầu</label>
            <div className="relative">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onChange('startDate', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold rounded-xl pl-9"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Hạn chót */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hạn chót</label>
            <div className="relative">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => onChange('dueDate', e.target.value)}
                className="h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold rounded-xl pl-9"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ==========================================
// MAIN COMPONENT
// ==========================================

export function TaskAssignModal({ isOpen, onClose, task }: TaskAssignModalProps) {
  const queryClient = useQueryClient();

  const [taskState, setTaskState] = useState({
    assigneeCode: '',
    coAssigneeCodes: [] as string[],
    priority: 'MEDIUM',
    baseScore: 10,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    weight: 20
  });

  useEffect(() => {
    if (task && isOpen) {
      setTaskState({
        assigneeCode: (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') ? task.assigneeCode : '',
        coAssigneeCodes: [],
        priority: task.priority || 'MEDIUM',
        baseScore: task.baseScore || task.targetValue || 10,
        startDate: task.startDate ? task.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: task.endDate ? task.endDate.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        weight: task.weight || 20
      });
    }
  }, [task, isOpen]);

  const [crossDepartment, setCrossDepartment] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  // Fetch departments from api-gateway organization tree
  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
    enabled: isOpen,
  });

  const units = React.useMemo(() => {
    return flattenUnits(treeNodes?.items || []);
  }, [treeNodes]);

  // Fetch employees list filtered by selected department
  const { data: employeesData } = useHrmEmployeesList({
    pageSize: 200,
    departmentId: selectedDeptId !== 'ALL' ? Number(selectedDeptId) : undefined,
    crossDepartment: crossDepartment,
    assignableOnly: true,
  } as any);

  // Fetch all employees for complete mapping lookup (names instead of codes)
  const { data: allEmployeesData } = useHrmEmployeesList({
    pageSize: 500,
  } as any);

  const allEmployees = allEmployeesData?.data || [];

  const assignableEmployees = (employeesData?.data || []).map((emp: any) => {
    const fullName = emp.fullName || [emp.firstname, emp.lastname].filter(Boolean).join(' ');
    return {
      code: emp.employeeCode,
      name: fullName,
      rankLimit: emp.rankLimit,
      availableCapacity: emp.availableCapacity,
      currentLoad: emp.currentTaskCount,
      priorityScore: emp.priorityScore,
      isOverloaded: emp.isOverloaded,
      department: emp.department,
      jobTitle: emp.jobTitle,
      civilServantRank: emp.civilServantRank,
    };
  });

  const groupedEmployees = React.useMemo(() => {
    const groups: { [key: string]: typeof assignableEmployees } = {};
    for (const emp of assignableEmployees) {
      const deptName = emp.department?.name || "Khác / Chưa xác định";
      if (!groups[deptName]) {
        groups[deptName] = [];
      }
      groups[deptName].push(emp);
    }
    return groups;
  }, [assignableEmployees]);

  const currentEmp = (allEmployees.find((e: any) => e.employeeCode === taskState.assigneeCode) || (employeesData?.data || []).find((e: any) => e.employeeCode === taskState.assigneeCode)) as any;

  const currentEmpMapped = currentEmp ? {
    code: currentEmp.employeeCode,
    name: currentEmp.fullName || [currentEmp.firstname, currentEmp.lastname].filter(Boolean).join(' '),
    rankLimit: currentEmp.rankLimit,
    availableCapacity: currentEmp.availableCapacity,
    currentLoad: currentEmp.currentTaskCount,
    priorityScore: currentEmp.priorityScore,
    isOverloaded: currentEmp.isOverloaded,
    department: currentEmp.department,
    jobTitle: currentEmp.jobTitle,
    civilServantRank: currentEmp.civilServantRank,
  } : null;

  const isOverload = currentEmpMapped?.isOverloaded || false;

  const isTransfer = task?.assigneeCode && task.assigneeCode !== 'UNASSIGNED';

  const assignMutation = useMutation({
    mutationFn: async () => {
      const taskId = task.id;
      await hrmTasksApi.update(taskId, {
        weight: taskState.weight,
        startDate: taskState.startDate,
        dueDate: taskState.dueDate,
        priority: taskState.priority,
        baseScore: taskState.baseScore,
      });

      await hrmTasksApi.assignTask(taskId, {
        assigneeCode: taskState.assigneeCode,
        coAssigneeCodes: taskState.coAssigneeCodes
      });
      return taskId;
    },
    onSuccess: (taskId) => {
      toast.success(isTransfer ? `Đã chuyển giao việc thành công: ${task.title}` : `Đã giao việc thành công: ${task.title}`);
      queryClient.invalidateQueries({ queryKey: ['hrm-tasks'] });
      onClose(taskId);
    },
    onError: () => {
      toast.error('Lỗi khi giao việc');
    }
  });

  const handleSubmit = () => {
    if (!taskState.assigneeCode) return toast.error('Vui lòng chọn người chủ trì chính!');
    if (isOverload) return toast.error('Người chủ trì chính đang quá tải khối lượng công việc.');
    assignMutation.mutate();
  };

  const handleParamChange = React.useCallback((field: string, value: any) => {
    setTaskState(p => ({ ...p, [field]: value }));
  }, []);

  const handleChangeAssignee = React.useCallback((code: string) => {
    setTaskState(p => ({ ...p, assigneeCode: code }));
  }, []);

  const handleChangeCoAssignees = React.useCallback((codes: string[]) => {
    setTaskState(p => ({ ...p, coAssigneeCodes: codes }));
  }, []);

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[96vw] max-h-[95vh] overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl p-0 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden">
        
        <HeaderCard 
          title={task.title}
          assigneeName={task.assigneeName}
          assigneeUnitName={task.assigneeUnitName}
        />

        {/* Form Body - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-4 sm:p-6 md:p-8 lg:p-10">
          
          {/* Left Column - Assignee Picker (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" /> Chọn cán bộ thực hiện
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DepartmentSelector 
                  selectedDeptId={selectedDeptId}
                  setSelectedDeptId={setSelectedDeptId}
                  units={units}
                />

                <EmployeeSelector 
                  assigneeCode={taskState.assigneeCode}
                  coAssigneeCodes={taskState.coAssigneeCodes}
                  onChangeAssignee={handleChangeAssignee}
                  onChangeCoAssignees={handleChangeCoAssignees}
                  groupedEmployees={groupedEmployees}
                  assignableEmployees={assignableEmployees}
                />
              </div>

              {/* Tùy chọn liên phòng ban */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Chế độ phối hợp</span>
                <label className={cn(
                  "flex items-center gap-2 cursor-pointer select-none rounded-xl px-3 py-1.5 border transition-all text-xs font-bold",
                  crossDepartment
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}>
                  <input
                    type="checkbox"
                    checked={crossDepartment}
                    onChange={(e) => setCrossDepartment(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-350 dark:border-slate-700 text-amber-655 focus:ring-amber-500/20 bg-white dark:bg-slate-900"
                  />
                  🤝 Phối hợp liên phòng ban
                </label>
              </div>

              {crossDepartment && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed shadow-sm">
                  <span className="text-base leading-none">💡</span>
                  <p>
                    Chế độ <strong>Phối hợp liên phòng ban</strong>: Danh sách sẽ ưu tiên lọc và hiển thị <strong>lãnh đạo phòng ban khác</strong>. Bạn nên chọn người chịu trách nhiệm chính làm <strong>Chủ trì</strong>, các thành viên khác làm <strong>Phối hợp</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Selected personnel display cards */}
            {(taskState.assigneeCode || taskState.coAssigneeCodes.length > 0) && (
              <SelectedPersonnel 
                currentEmpMapped={currentEmpMapped}
                coAssigneeCodes={taskState.coAssigneeCodes}
                allEmployees={allEmployees}
                onChangeAssignee={handleChangeAssignee}
                onChangeCoAssignees={handleChangeCoAssignees}
              />
            )}
          </div>

          {/* Right Column - Task Parameters (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <TaskParameters 
              priority={taskState.priority}
              weight={taskState.weight}
              baseScore={taskState.baseScore}
              startDate={taskState.startDate}
              dueDate={taskState.dueDate}
              onChange={handleParamChange}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 md:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <Button 
            variant="ghost" 
            onClick={() => onClose()} 
            className="font-semibold text-slate-650 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl h-11 px-5 transition-colors"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!taskState.assigneeCode || isOverload || assignMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-7 shadow-md transition-all hover:translate-y-[-1px] active:translate-y-[0] disabled:opacity-50 disabled:pointer-events-none"
          >
            {assignMutation.isPending ? "Đang xử lý..." : (isTransfer ? "Xác nhận chuyển giao" : "Xác nhận giao việc")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
