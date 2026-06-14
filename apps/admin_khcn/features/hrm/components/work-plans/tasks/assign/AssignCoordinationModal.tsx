'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Search, CheckCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { hrmTasksApi } from "@/features/hrm/api";

interface AssignCoordinationModalProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Modal for SUPERVISORS after receiving a coordination request.
 * Supervisor assigns:
 *   - 1 Lead (primary responsible person, defaults to current assignee)
 *   - N Coordinators (supporting members)
 * No new sub-task is created — same task, clear role separation.
 */
export function AssignCoordinationModal({ task, open, onOpenChange, onSuccess }: AssignCoordinationModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Lead: defaults to current assignee
  const [leadCode, setLeadCode] = useState<string>('');
  // Coordinators: array of employeeCodes
  const [coordinatorCodes, setCoordinatorCodes] = useState<string[]>([]);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['assignees', task?.id],
    queryFn: async () => {
      const res: any = await hrmTasksApi.recommendAssignees({ rankCode: 'ALL', strategy: 'HIGH_PERFORMANCE' });
      return Array.isArray(res.data) ? res.data : (res.data?.topEmployees || []);
    },
    enabled: !!open && !!task,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open || !task) {
      setSearch('');
      setLeadCode('');
      setCoordinatorCodes([]);
      return;
    }
    // Initialize defaults
    setLeadCode(task.assigneeCode || '');
    setCoordinatorCodes(task.coAssigneeCodes || []);
  }, [open, task?.id]);


  const filteredEmployees = employees.filter((emp: any) => {
    const name = (emp.employeeName || '').toLowerCase();
    const code = (emp.employeeCode || '').toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || code.includes(q);
  });

  const toggleCoordinator = (code: string) => {
    if (code === leadCode) return; // Lead cannot be added as coordinator
    setCoordinatorCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const assignMutation = useMutation({
    mutationFn: () => hrmTasksApi.assignCoordination(task?.id?.toString() || '', {
      leadCode,
      coordinatorCodes,
    }),
    onSuccess: () => {
      toast.success('Lead & Coordinators assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['hrm-tasks'] });
      onSuccess();
      onOpenChange(false);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Error assigning roles');
    }
  });

  const handleSubmit = () => {
    if (!task || !leadCode) {
      toast.error('Please select a Lead');
      return;
    }
    assignMutation.mutate();
  };


  const getDisplayName = (code: string) => {
    const emp = employees.find((e: any) => e.employeeCode === code);
    return emp?.employeeName || code;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!assignMutation.isPending) { onOpenChange(o); } }}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-linear-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-b border-violet-100 dark:border-violet-800/30">
          <DialogTitle className="flex items-center gap-3 text-lg font-bold text-violet-900 dark:text-violet-100">
            <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            Assign Lead &amp; Coordinators
          </DialogTitle>
          {task && (
            <p className="text-sm text-violet-700/80 dark:text-violet-300/80 mt-1 line-clamp-1">
              📋 {task.title}
            </p>
          )}
        </DialogHeader>

        <div className="px-6 pt-4 pb-2 space-y-4">
          {/* Current Lead display */}
          <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800/40">
            <p className="text-[11px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /> Lead (primary responsible)
            </p>
            {leadCode ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {getDisplayName(leadCode)?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{getDisplayName(leadCode)}</p>
                  <p className="text-xs text-slate-400">{leadCode}</p>
                </div>
                <Badge className="ml-auto bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300">
                  Lead
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not selected</p>
            )}
          </div>

          {/* Selected coordinators */}
          {coordinatorCodes.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/40">
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">
                Coordinators ({coordinatorCodes.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {coordinatorCodes.map(code => (
                  <div key={code} className="flex items-center gap-1.5 bg-white dark:bg-slate-700 rounded-full pl-2 pr-1 py-1 border border-amber-200 dark:border-amber-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{getDisplayName(code)}</span>
                    <button
                      onClick={() => toggleCoordinator(code)}
                      className="w-4 h-4 rounded-full bg-amber-100 hover:bg-rose-100 text-amber-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
            />
          </div>

          {/* Instructions */}
          <p className="text-xs text-slate-400 -mt-2">
            <span className="text-violet-600 font-bold">Click once</span> = set as Lead &nbsp;|&nbsp;
            <span className="text-amber-600 font-bold">Click twice</span> = add as Coordinator &nbsp;|&nbsp;
            Or use the buttons next to each person
          </p>

          {/* Employee list */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-7 w-7 border-4 border-violet-100 border-t-violet-500" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">No results found</div>
            ) : (
              filteredEmployees.map((emp: any) => {
                const isLead = emp.employeeCode === leadCode;
                const isCoordinator = coordinatorCodes.includes(emp.employeeCode);
                return (
                  <div key={emp.employeeCode} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${isLead ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20'
                    : isCoordinator ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200'
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${isLead ? 'bg-violet-500' : isCoordinator ? 'bg-amber-500' : 'bg-slate-400'
                      }`}>
                      {isLead ? <Crown className="w-4 h-4" /> : emp.employeeName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{emp.employeeName}</p>
                      <p className="text-xs text-slate-400">{emp.employeeCode}</p>
                    </div>
                    {/* Buttons: set as Lead or Coordinator */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setLeadCode(emp.employeeCode)}
                        title="Set as Lead"
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${isLead ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200'
                          }`}
                      >
                        {isLead ? <CheckCheck className="w-3 h-3" /> : 'Lead'}
                      </button>
                      <button
                        onClick={() => toggleCoordinator(emp.employeeCode)}
                        title="Add as Coordinator"
                        disabled={isLead}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all disabled:opacity-30 ${isCoordinator ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                          }`}
                      >
                        {isCoordinator ? <CheckCheck className="w-3 h-3" /> : 'Coordinator'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-b-3xl flex items-center justify-between gap-3 shrink-0">
          <div className="text-sm text-slate-500 font-medium">
            {coordinatorCodes.length > 0 && (
              <span>1 Lead + <span className="font-bold text-amber-600">{coordinatorCodes.length} coordinator(s)</span></span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="rounded-xl font-medium" onClick={() => onOpenChange(false)} disabled={assignMutation.isPending}>Cancel</Button>
            <Button
              className="rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 dark:shadow-none"
              onClick={handleSubmit}
              disabled={!leadCode || assignMutation.isPending}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
