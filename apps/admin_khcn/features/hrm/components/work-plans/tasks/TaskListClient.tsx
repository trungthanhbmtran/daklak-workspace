'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Plus, Eye, Edit, Trash2,
  CheckCircle2, Clock, PlayCircle,
  AlertCircle, Filter,
  LayoutGrid, List as ListIcon,
  Calendar, User, Users, Split, MessageSquare, Send, Reply, X, ArrowLeftCircle, Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTasksList } from '../../../hooks';
import { hrmTasksApi } from '../../../api';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Search } from '@/components/ui/search';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetCategoryByGroup } from "@/features/system-admin/categories/hooks/useCategoryApi";

import { SmartAssignDrawer } from './SmartAssignDrawer';
import { SubTaskModal } from './SubTaskModal';
import { CoordinationModal } from './CoordinationModal';
import { AssignCoordinationModal } from './AssignCoordinationModal';

export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // New features state
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_TASKS' | 'ASSIGNED_BY_ME' | 'DEPT_TASKS'>('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Smart Assign states
  const [taskToAssign, setTaskToAssign] = useState<any>(null);

  // Delegation chain (chuỗi giao việc)
  const [delegationChain, setDelegationChain] = useState<any[]>([]);
  const [isLoadingChain, setIsLoadingChain] = useState(false);

  // Coordination modal (người thực hiện xin phối hợp lên lãnh đạo)
  const [isCoordinationModalOpen, setIsCoordinationModalOpen] = useState(false);

  // Assign coordination modal (lãnh đạo phân công chủ trì + phối hợp)
  const [isAssignCoordinationOpen, setIsAssignCoordinationOpen] = useState(false);

  // Sub task modal (phân rã nhiệm vụ - giao xuống cấp dưới)
  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);

  // Fetch priority categories
  const { data: prioritiesRes }: any = useGetCategoryByGroup('TASK_PRIORITY');
  const priorities = prioritiesRes?.data || [];

  const getPriorityName = (code: string) => {
    const codeUpper = (code || 'MEDIUM').toUpperCase();
    const matched = priorities.find((p: any) => p.code?.toUpperCase() === codeUpper);
    if (matched?.name) return matched.name;

    // Fallback
    switch (codeUpper) {
      case 'HIGH': return 'Cao';
      case 'MEDIUM': return 'Trung bình';
      case 'LOW': return 'Thấp';
      default: return codeUpper;
    }
  };

  // Server side filtering
  const { data, isLoading, refetch } = useTasksList({
    filter: undefined, // Let local filtering handle the new stats categories
    search: searchQuery,
    tab: activeTab,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
  });
  const tasks = data?.data || [];
  const statsData = (data as any)?.stats || { overdueCount: 0, dueIn3DaysCount: 0, dueIn7DaysCount: 0, dueOver7DaysCount: 0 };
  const currentUser: any = (data as any)?.meta?.currentUser;

  const computedStats = useMemo(() => {
    let overdue = 0;
    let warning = 0;
    let inTime = 0;
    let doneInTime = 0;
    let doneOverdue = 0;

    tasks.forEach((task: any) => {
      const due = task.dueDate ? new Date(task.dueDate) : null;
      const now = new Date();
      if (due) due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (task.status === 'DONE') {
        const completedDate = task.completedAt ? new Date(task.completedAt) : (task.updatedAt ? new Date(task.updatedAt) : new Date());
        completedDate.setHours(0, 0, 0, 0);
        if (due && completedDate.getTime() > due.getTime()) {
          doneOverdue++;
        } else {
          doneInTime++;
        }
      } else {
        if (!due) {
          inTime++;
        } else {
          const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) overdue++;
          else if (diffDays <= 3) warning++;
          else inTime++;
        }
      }
    });

    return { overdue, warning, inTime, doneInTime, doneOverdue };
  }, [tasks]);

  const displayedTasks = useMemo(() => {
    if (!activeFilter) return tasks;
    return tasks.filter((task: any) => {
      const due = task.dueDate ? new Date(task.dueDate) : null;
      const now = new Date();
      if (due) due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (activeFilter === 'doneInTime' || activeFilter === 'doneOverdue') {
        if (task.status !== 'DONE') return false;
        const completedDate = task.completedAt ? new Date(task.completedAt) : (task.updatedAt ? new Date(task.updatedAt) : new Date());
        completedDate.setHours(0, 0, 0, 0);
        const isOverdue = due ? completedDate.getTime() > due.getTime() : false;
        if (activeFilter === 'doneOverdue') return isOverdue;
        return !isOverdue;
      } else {
        if (task.status === 'DONE') return false;
        if (!due) return activeFilter === 'inTime';
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (activeFilter === 'overdue') return diffDays < 0;
        if (activeFilter === 'warning') return diffDays >= 0 && diffDays <= 3;
        if (activeFilter === 'inTime') return diffDays > 3;
        return true;
      }
    });
  }, [tasks, activeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE': return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Hoàn thành</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200">Đang xử lý</Badge>;
      case 'TODO': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">Cần làm</Badge>;
      case 'OVERDUE': return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200">Quá hạn</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-500';
      case 'MEDIUM': return 'text-amber-500';
      case 'LOW': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  const getDueDateDisplay = (dueDate: string | undefined | null, status: string) => {
    if (!dueDate) return { label: 'Không có thời hạn', text: '', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-100 dark:border-slate-800', icon: <Calendar className="w-4 h-4" /> };
    if (status === 'DONE') return { label: new Date(dueDate).toLocaleDateString('vi-VN'), text: 'Đã hoàn thành', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800/30', icon: <CheckCircle2 className="w-4 h-4" /> };

    const due = new Date(dueDate);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: due.toLocaleDateString('vi-VN'),
        text: `Quá hạn ${Math.abs(diffDays)} ngày`,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/10',
        border: 'border-rose-200 dark:border-rose-800/30',
        icon: <AlertCircle className="w-4 h-4" />
      };
    } else if (diffDays === 0) {
      return {
        label: due.toLocaleDateString('vi-VN'),
        text: 'Hạn cuối hôm nay!',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        border: 'border-orange-200 dark:border-orange-800/30',
        icon: <Clock className="w-4 h-4 animate-pulse" />
      };
    } else if (diffDays <= 3) {
      return {
        label: due.toLocaleDateString('vi-VN'),
        text: `Còn ${diffDays} ngày (Sắp đến hạn)`,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        border: 'border-amber-200 dark:border-amber-800/30',
        icon: <Clock className="w-4 h-4" />
      };
    } else {
      return {
        label: due.toLocaleDateString('vi-VN'),
        text: `Còn ${diffDays} ngày`,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
        border: 'border-indigo-100 dark:border-indigo-800/30',
        icon: <Calendar className="w-4 h-4" />
      };
    }
  };

  const fetchComments = async (taskId: number, silent = false) => {
    if (!silent) setIsLoadingComments(true);
    try {
      const res = await hrmTasksApi.getComments(taskId.toString());
      setTaskComments(res.data || []);
    } catch (e: any) {
      toast.error('Lỗi tải tin nhắn công việc');
    } finally {
      if (!silent) setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (selectedTask?.id) {
      fetchComments(selectedTask.id);
      // Lấy chuỗi giao việc
      setIsLoadingChain(true);
      hrmTasksApi.getSubTasks(selectedTask.id.toString())
        .then((res: any) => setDelegationChain(res?.data || []))
        .catch(() => setDelegationChain([]))
        .finally(() => setIsLoadingChain(false));
    }
  }, [selectedTask?.id]);

  const handleSendMessage = async () => {
    const trimmedMessage = chatMessage.trim();
    if (!trimmedMessage || !selectedTask || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      await hrmTasksApi.addComment(selectedTask.id.toString(), {
        content: trimmedMessage,
      });
      setChatMessage('');
      fetchComments(selectedTask.id, true); // silent reload để không bị chớp spinner
    } catch (e: any) {
      toast.error('Gửi tin nhắn thất bại');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const isRelatedUser = true; // Temporary bypass: allow commenting for any user who can view the task

  const handleRejectTask = async () => {
    if (!rejectReason.trim() || !selectedTask) return;
    try {
      await hrmTasksApi.updateStatus(selectedTask.id.toString(), {
        status: 'RETURNED',
        rejectReason: rejectReason,
      });
      toast.success('Đã trả lại công việc');
      setIsRejectOpen(false);
      setRejectReason('');
      setSelectedTask(null);
      refetch();
    } catch (e: any) {
      toast.error('Lỗi khi trả lại công việc');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    try {
      await hrmTasksApi.updateStatus(selectedTask.id.toString(), {
        status: 'DONE',
      });
      toast.success('Đã hoàn thành công việc!');
      setSelectedTask(null);
      refetch();
    } catch (e: any) {
      toast.error('Lỗi khi hoàn thành công việc');
    }
  };

  const handleRequestCoordination = () => {
    if (!selectedTask) return;
    setIsCoordinationModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 relative z-10">
        {[
          { id: 'overdue', label: 'Đang xử lý - Quá hạn', value: computedStats.overdue, icon: <AlertCircle className="h-6 w-6" />, colorClass: 'bg-rose-500 hover:bg-rose-600 text-white border-transparent ring-rose-200', iconBg: 'bg-white/20 text-white' },
          { id: 'warning', label: 'Đang xử lý - Sắp đến hạn', value: computedStats.warning, icon: <Clock className="h-6 w-6" />, colorClass: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-amber-200', iconBg: 'bg-white/20 text-white' },
          { id: 'inTime', label: 'Đang xử lý - Trong hạn', value: computedStats.inTime, icon: <Calendar className="h-6 w-6" />, colorClass: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent ring-blue-200', iconBg: 'bg-white/20 text-white' },
          { id: 'doneInTime', label: 'Đã xong - Đúng hạn', value: computedStats.doneInTime, icon: <CheckCircle2 className="h-6 w-6" />, colorClass: 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent ring-emerald-200', iconBg: 'bg-white/20 text-white' },
          { id: 'doneOverdue', label: 'Đã xong - Trễ hạn', value: computedStats.doneOverdue, icon: <AlertCircle className="h-6 w-6" />, colorClass: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent ring-orange-200', iconBg: 'bg-white/20 text-white' },
        ].map((stat) => (
          <div
            key={stat.id}
            onClick={() => setActiveFilter(activeFilter === stat.id ? null : stat.id)}
            className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${stat.colorClass} ${activeFilter === stat.id ? 'ring-4 shadow-lg scale-105' : 'opacity-95 hover:opacity-100'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <h3 className="text-4xl font-black">{stat.value}</h3>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-wider opacity-90 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="relative flex flex-col xl:flex-row justify-between items-center gap-4 mb-2">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto flex-1">
          <div className="w-full sm:max-w-[320px] relative group">
            <Search placeholder="Tìm kiếm công việc..." className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all" />
          </div>

          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full sm:w-[480px] h-11">
            <TabsList className="h-full w-full grid grid-cols-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <TabsTrigger value="ALL" className="rounded-lg text-[13px] font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all h-full">Tất cả</TabsTrigger>
              <TabsTrigger value="MY_TASKS" className="rounded-lg text-[13px] font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all h-full">Của tôi</TabsTrigger>
              <TabsTrigger value="ASSIGNED_BY_ME" className="rounded-lg text-[13px] font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 transition-all h-full">Đã giao</TabsTrigger>
              <TabsTrigger value="DEPT_TASKS" className="rounded-lg text-[13px] font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all h-full">Phòng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto shrink-0">
          <div className="flex-1 sm:flex-none">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
                <SelectItem value="ALL" className="rounded-lg font-semibold py-2.5 cursor-pointer">Tất cả trạng thái</SelectItem>
                <SelectItem value="TODO" className="rounded-lg font-semibold py-2.5 cursor-pointer text-blue-600 focus:bg-blue-50">Cần làm</SelectItem>
                <SelectItem value="IN_PROGRESS" className="rounded-lg font-semibold py-2.5 cursor-pointer text-amber-600 focus:bg-amber-50">Đang xử lý</SelectItem>
                <SelectItem value="DONE" className="rounded-lg font-semibold py-2.5 cursor-pointer text-emerald-600 focus:bg-emerald-50">Hoàn thành</SelectItem>
                <SelectItem value="OVERDUE" className="rounded-lg font-semibold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 sm:flex-none">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[170px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-rose-500" />
                  <SelectValue placeholder="Ưu tiên" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
                <SelectItem value="ALL" className="rounded-lg font-semibold py-2.5 cursor-pointer">Mọi ưu tiên</SelectItem>
                <SelectItem value="HIGH" className="rounded-lg font-semibold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50">🔴 Cao</SelectItem>
                <SelectItem value="MEDIUM" className="rounded-lg font-semibold py-2.5 cursor-pointer text-amber-600 focus:bg-amber-50">🟡 Trung bình</SelectItem>
                <SelectItem value="LOW" className="rounded-lg font-semibold py-2.5 cursor-pointer text-emerald-600 focus:bg-emerald-50">🟢 Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-lg h-9 w-11 p-0 transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-lg h-9 w-11 p-0 transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {activeFilter
              ? 'Không có công việc nào phù hợp với bộ lọc'
              : activeTab === 'ASSIGNED_BY_ME'
                ? 'Bạn chưa giao công việc nào'
                : activeTab === 'MY_TASKS'
                  ? 'Bạn chưa có công việc nào được giao'
                  : 'Hoan hô! Không có công việc nào'}
          </h3>
          <p className="text-slate-500 mt-2">
            {activeFilter
              ? 'Thử chọn một bộ lọc khác hoặc bỏ chọn.'
              : activeTab === 'ASSIGNED_BY_ME'
                ? 'Hãy phân công công việc từ Kế hoạch & Giao việc.'
                : 'Bạn đã hoàn thành tất cả hoặc chưa có công việc được giao.'}
          </p>
        </div>

      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {displayedTasks.map((task: any) => {
            const dueInfo = getDueDateDisplay(task.dueDate, task.status);
            return (
              <Card key={task.id} className="group relative hover:shadow-md transition-shadow duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
                {dueInfo.text && task.status !== 'DONE' && task.dueDate && (
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-[10px] uppercase tracking-widest z-10 ${dueInfo.bg} ${dueInfo.color} border-b border-l ${dueInfo.border}`}>
                    {dueInfo.text}
                  </div>
                )}
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2 items-center max-w-[70%]">
                        {getStatusBadge(task.status || 'TODO')}
                        {task.plan && (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:border-indigo-900/30 text-[10px] px-1.5 font-bold flex items-center gap-1 max-w-full">
                            <Target className="w-3 h-3 shrink-0" /> <span className="truncate">{task.plan.title}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {(!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 rounded-full text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setTaskToAssign(task);
                            }}
                          >
                            <PlayCircle className="w-3 h-3 mr-1" /> Phân công
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 hover:text-indigo-600">
                          <Edit className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[40px]">
                      {task.description || 'Chưa có mô tả chi tiết cho công việc này.'}
                    </p>

                    <div className="space-y-2 mt-auto">
                      {/* Người thực hiện (chỉ hiển thị assignee trên card) */}
                      <div className="flex items-center text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">
                          {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Người thực hiện</span>
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode || 'Chưa phân công')}
                          </span>
                        </div>
                      </div>

                      {/* Lãnh đạo chỉ đạo (nếu có) */}
                      {task.supervisorCode && (
                        <div className="flex items-center text-sm bg-amber-50/50 dark:bg-amber-900/10 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mr-2.5 text-amber-700 dark:text-amber-300 font-bold text-xs shrink-0">
                            {(task.supervisorName || task.supervisorCode)?.charAt(0) || '?'}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-500/70 mb-0.5">Theo dõi / Chỉ đạo</span>
                            <span className="truncate font-medium text-amber-900 dark:text-amber-100">
                              {task.supervisorName || task.supervisorCode}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Hạn xử lý */}
                      <div className={`flex items-center text-sm ${dueInfo.color} ${dueInfo.bg} p-2.5 rounded-xl border ${dueInfo.border}`}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2.5 bg-white/80 dark:bg-slate-900/60">
                          {dueInfo.icon}
                        </div>
                        <div className="flex flex-col">
                          {dueInfo.text && <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 mb-0.5">{dueInfo.text}</span>}
                          <span className="font-bold">{dueInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors duration-200">
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${getPriorityColor(task.priority)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current shadow-sm`} />
                      Ưu tiên: {getPriorityName(task.priority)}
                    </span>
                    <Button variant="link" onClick={() => setSelectedTask(task)} className="px-0 text-indigo-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                      Chi tiết &rarr;
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mt-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-5 font-bold tracking-wider">Tên công việc</th>
                  <th className="px-6 py-5 font-bold tracking-wider">Trạng thái</th>
                  <th className="px-6 py-5 font-bold tracking-wider">Mức độ ưu tiên</th>
                  <th className="px-6 py-5 font-bold tracking-wider">Thực hiện / Chỉ đạo</th>
                  <th className="px-6 py-5 font-bold tracking-wider">Hạn chót</th>
                  <th className="px-6 py-5 text-right font-bold tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((task: any) => (
                  <tr key={task.id} className="bg-transparent border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
                    <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white max-w-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <div className="truncate mb-1">{task.title}</div>
                      {task.plan && (
                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-indigo-100">
                          <Target className="w-3 h-3" /> {task.plan.title}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(task.status || 'TODO')}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-black tracking-widest text-xs flex items-center ${getPriorityColor(task.priority)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 flex justify-center items-center text-xs font-bold mr-2.5 shadow-sm border border-indigo-100/50 shrink-0">
                            {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                          </div>
                          <span className="font-medium text-sm truncate">{task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode || 'Chưa phân công')}</span>
                        </div>
                        {task.supervisorCode && (
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 flex justify-center items-center text-xs font-bold mr-2.5 shadow-sm border border-amber-100/50 shrink-0">
                              {(task.supervisorName || task.supervisorCode)?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-sm text-amber-700 dark:text-amber-500 truncate">{task.supervisorName || task.supervisorCode} (CĐ)</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const dueInfo = getDueDateDisplay(task.dueDate, task.status);
                        return (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${dueInfo.bg} ${dueInfo.border} ${dueInfo.color}`}>
                            {dueInfo.icon}
                            <div className="flex flex-col leading-tight">
                              {dueInfo.text && <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">{dueInfo.text}</span>}
                              <span className="font-bold text-sm">{dueInfo.label}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {(!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                          <Button variant="ghost" size="icon" onClick={() => setTaskToAssign(task)} className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm">
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTask(task)} className="h-9 w-9 rounded-full bg-slate-50 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-50 text-amber-600 hover:bg-amber-50 transition-colors shadow-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-50 text-rose-600 hover:bg-rose-50 transition-colors shadow-sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="w-[100vw] sm:w-[98vw] xl:w-[95vw] max-w-[1600px] h-[100dvh] sm:h-[97vh] font-sans p-0 overflow-hidden rounded-none sm:rounded-[2rem] border-0 sm:border border-slate-200/50 dark:border-slate-700/50 shadow-2xl bg-slate-50 dark:bg-slate-900 flex flex-col">
          {selectedTask && (
            <div className="flex flex-col flex-1 min-h-0">

              {/* ── TOP HEADER BAR ── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Status */}
                  <div className="scale-90 origin-left shrink-0">{getStatusBadge(selectedTask.status || 'TODO')}</div>
                  {/* Priority badge */}
                  <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border border-current ${getPriorityColor(selectedTask.priority)} bg-white dark:bg-slate-800`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {getPriorityName(selectedTask.priority)}
                  </span>
                  {/* Plan badge */}
                  {selectedTask.plan && (
                    <Badge variant="outline" className="hidden md:flex bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-1 rounded-lg font-bold items-center gap-1.5 shrink-0">
                      <Target className="w-3.5 h-3.5" /> {selectedTask.plan.title}
                    </Badge>
                  )}
                  {/* Title (truncated) */}
                  <h2 className="font-black text-slate-700 dark:text-slate-200 text-[15px] truncate">{selectedTask.title}</h2>
                </div>
                {/* Due Date pill */}
                {selectedTask.dueDate && (
                  <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold shrink-0 ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).color} ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).bg} border ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).border}`}>
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedTask.dueDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>

              {/* ── MAIN BODY (3 columns) ── */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px_280px] gap-0 h-full divide-x divide-slate-200/60 dark:divide-slate-800">

                  {/* ════ COL 1: Mô tả + Chat ════ */}
                  <div className="flex flex-col gap-0 overflow-y-auto">

                    {/* Description */}
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-slate-300 rounded" /> Mô tả công việc
                      </h3>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-200 rounded-full" />
                        <div className="pl-5 text-slate-600 dark:text-slate-300 leading-relaxed text-[14.5px] whitespace-pre-wrap">
                          {selectedTask.description || <span className="italic opacity-50">Chưa có mô tả chi tiết...</span>}
                        </div>
                      </div>
                    </div>

                    {/* Chat */}
                    <div className="flex flex-col flex-1 min-h-[360px]">
                      <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Trao đổi & Tiến độ
                        </h4>
                        <Badge variant="secondary" className="rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                          {taskComments.length} tin
                        </Badge>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20 dark:bg-slate-900/10 max-h-[400px]">
                        {isLoadingComments ? (
                          <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                          </div>
                        ) : taskComments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                              <MessageSquare className="w-7 h-7 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Chưa có trao đổi nào</p>
                          </div>
                        ) : (
                          taskComments.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.authorCode === currentUser?.username ? 'flex-row-reverse' : ''}`}>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-black shrink-0 ring-2 ring-white dark:ring-slate-800">
                                {msg.authorName?.charAt(0) || msg.authorCode?.charAt(0) || '🔔'}
                              </div>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] shadow-sm ${msg.isSystemMessage ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-800/50' : msg.authorCode === currentUser?.username ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-sm'}`}>
                                {!msg.isSystemMessage && msg.authorCode !== currentUser?.username && (
                                  <p className="text-[10px] font-black mb-1 opacity-50">{msg.authorName || msg.authorCode}</p>
                                )}
                                <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1.5 text-right ${msg.authorCode === currentUser?.username ? 'text-indigo-200' : 'opacity-30'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-400/50 focus-within:border-indigo-400 transition-all">
                          <input
                            type="text"
                            disabled={selectedTask.status === 'DONE' || isSendingMessage}
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSendMessage(); }}
                            placeholder={selectedTask.status === 'DONE' ? 'Công việc đã đóng' : 'Nhập nội dung trao đổi...'}
                            className="flex-1 bg-transparent border-none text-[13.5px] focus:ring-0 outline-none disabled:opacity-40 text-slate-800 dark:text-white"
                          />
                          <Button
                            disabled={selectedTask.status === 'DONE' || !chatMessage.trim() || isSendingMessage}
                            onClick={handleSendMessage}
                            className="rounded-full w-9 h-9 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:opacity-40"
                          >
                            {isSendingMessage ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5 text-white" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ════ COL 2: Nhân sự + Thao tác ════ */}
                  <div className="flex flex-col gap-0 bg-white dark:bg-slate-900 overflow-y-auto">

                    {/* Roles Card */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-slate-300 rounded" /> Phân công nhân sự
                      </h3>

                      <div className="space-y-3">
                        {/* Chủ trì */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40">
                          <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-black text-base shrink-0">
                            {selectedTask.assigneeCode === 'UNASSIGNED' ? '?' : ((selectedTask.assigneeName || selectedTask.assigneeCode)?.charAt(0) || '?')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">👑 Chủ trì</p>
                            <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 truncate">
                              {selectedTask.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (selectedTask.assigneeName || selectedTask.assigneeCode || 'Chưa phân công')}
                            </p>
                          </div>
                          {(!selectedTask.assigneeCode || selectedTask.assigneeCode === 'UNASSIGNED') && (
                            <Button size="sm" variant="ghost" className="rounded-full text-xs font-bold text-violet-600 bg-violet-100 hover:bg-violet-200" onClick={() => setTaskToAssign(selectedTask)}>
                              Giao
                            </Button>
                          )}
                        </div>

                        {/* Phối hợp */}
                        {(selectedTask.coAssigneeCodes || []).length > 0 && (
                          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">🤝 Phối hợp ({(selectedTask.coAssigneeCodes || []).length})</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(selectedTask.coAssigneeCodes || []).map((code: string) => (
                                <span key={code} className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700">
                                  {code}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lãnh đạo chỉ đạo */}
                        {selectedTask.supervisorCode && (
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-black text-sm shrink-0">
                              {(selectedTask.supervisorName || selectedTask.supervisorCode)?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⚡ Lãnh đạo chỉ đạo</p>
                              <p className="font-bold text-[13px] text-slate-700 dark:text-slate-300 truncate">
                                {selectedTask.supervisorName || selectedTask.supervisorCode}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Lãnh đạo giao (Assigner) */}
                        {selectedTask.assignerCode && (
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/60 dark:border-indigo-800/30">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-500 font-black text-sm shrink-0">
                              {(selectedTask.assignerName || selectedTask.assignerCode)?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">📋 Người giao</p>
                              <p className="font-bold text-[13px] text-slate-700 dark:text-slate-300 truncate">
                                {selectedTask.assignerName || selectedTask.assignerCode}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Panel */}
                    {selectedTask.status !== 'DONE' && (
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <div className="w-4 h-[2px] bg-slate-300 rounded" /> Thao tác
                        </h3>
                        <div className="flex flex-col gap-2.5">

                          {/* Hoàn thành - chủ trì */}
                          {selectedTask.assigneeCode === currentUser?.employeeCode && (
                            <Button
                              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                              onClick={handleCompleteTask}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Hoàn thành công việc
                            </Button>
                          )}

                          {/* Phân rã + Chủ trì & phối hợp - assigner hoặc assignee */}
                          {(selectedTask.assignerCode === currentUser?.employeeCode || selectedTask.assigneeCode === currentUser?.employeeCode) && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                className="h-10 rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold text-[12px]"
                                onClick={() => setIsSubTaskModalOpen(true)}
                              >
                                <Split className="w-3.5 h-3.5 mr-1.5" /> Phân rã
                              </Button>
                              {selectedTask.assignerCode === currentUser?.employeeCode && (
                                <Button
                                  variant="outline"
                                  className="h-10 rounded-xl border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 font-bold text-[12px]"
                                  onClick={() => setIsAssignCoordinationOpen(true)}
                                >
                                  <User className="w-3.5 h-3.5 mr-1.5" /> Phân công
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Xin phối hợp + Trả lại */}
                          <div className="grid grid-cols-2 gap-2">
                            {selectedTask.assigneeCode === currentUser?.employeeCode && (
                              <Button
                                variant="outline"
                                className="h-10 rounded-xl border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-[12px]"
                                onClick={handleRequestCoordination}
                              >
                                <Users className="w-3.5 h-3.5 mr-1.5" /> Xin phối hợp
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className={`h-10 rounded-xl border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-[12px] ${selectedTask.assigneeCode === currentUser?.employeeCode ? '' : 'col-span-2'}`}
                              onClick={() => setIsRejectOpen(true)}
                            >
                              <Reply className="w-3.5 h-3.5 mr-1.5" /> Trả lại
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Due Date */}
                    <div className="p-5">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-4 h-[2px] bg-slate-300 rounded" /> Thời hạn
                      </h3>
                      <div className={`flex items-center gap-3 p-3 rounded-2xl border ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).bg} ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).border}`}>
                        <div className={getDueDateDisplay(selectedTask.dueDate, selectedTask.status).color}>
                          {getDueDateDisplay(selectedTask.dueDate, selectedTask.status).icon}
                        </div>
                        <div>
                          {getDueDateDisplay(selectedTask.dueDate, selectedTask.status).text && (
                            <p className={`text-[10px] font-black uppercase tracking-wider ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).color}`}>
                              {getDueDateDisplay(selectedTask.dueDate, selectedTask.status).text}
                            </p>
                          )}
                          <p className={`font-bold text-[14px] ${getDueDateDisplay(selectedTask.dueDate, selectedTask.status).color}`}>
                            {getDueDateDisplay(selectedTask.dueDate, selectedTask.status).label}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ════ COL 3: Cây công việc ════ */}
                  <div className="flex flex-col bg-slate-50/60 dark:bg-slate-900/50 overflow-y-auto border-t xl:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 sticky top-0 backdrop-blur-md z-10">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeftCircle className="w-3.5 h-3.5 text-indigo-400 rotate-180" />
                        Cây công việc
                      </h3>
                    </div>

                    <div className="flex-1 p-4">
                      {isLoadingChain ? (
                        <div className="flex justify-center py-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                        </div>
                      ) : delegationChain.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                            <Split className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-xs font-medium text-slate-400">Chưa có cây công việc</p>
                          <p className="text-[11px] text-slate-300 mt-1">Sử dụng &quot;Phân rã&quot; để tạo task con</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
                          <div className="space-y-2">
                            {delegationChain.map((node: any, idx: number) => {
                              const isCurrent = node.id === selectedTask?.id;
                              const statusColors: Record<string, { dot: string; badge: string; label: string }> = {
                                DONE: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Xong' },
                                IN_PROGRESS: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Đang xử lý' },
                                TODO: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Chờ' },
                                OVERDUE: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', label: 'Trễ' },
                              };
                              const sc = statusColors[node.status] || { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', label: node.status };
                              return (
                                <div
                                  key={node.id}
                                  onClick={() => !isCurrent && setSelectedTask(node)}
                                  className={`relative flex items-start gap-3 pl-9 pr-3 py-3 rounded-2xl transition-all duration-200 ${isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-white dark:hover:bg-slate-800 cursor-pointer'}`}
                                >
                                  <div className={`absolute left-[13px] top-[18px] w-[11px] h-[11px] rounded-full ${sc.dot} ring-[3px] ring-white dark:ring-slate-900 shadow-sm z-10`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className={`text-[9.5px] font-black uppercase tracking-wider ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {node.isParent ? '🌳 Gốc' : isCurrent ? '▶ Đang xem' : idx === delegationChain.length - 1 ? '🌿 Lá' : '🪵 Nhánh'}
                                      </span>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${sc.badge}`}>{sc.label}</span>
                                    </div>
                                    <p className={`font-bold text-[12.5px] line-clamp-2 leading-snug mb-1.5 ${isCurrent ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {node.title}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                        {(node.assigneeName || node.assigneeCode)?.charAt(0) || '?'}
                                      </div>
                                      <span className="text-[11px] text-slate-500 truncate">{node.assigneeName || node.assigneeCode || 'Chưa phân công'}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Task Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md font-sans p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Trả lại công việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Vui lòng nhập lý do trả lại công việc (sai chức năng, không đủ thẩm quyền...)</p>
            <textarea
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none"
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="rounded-full">Hủy</Button>
            <Button onClick={handleRejectTask} disabled={!rejectReason.trim()} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white">Xác nhận trả lại</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Assign Drawer */}
      <SmartAssignDrawer
        task={taskToAssign}
        open={!!taskToAssign}
        onOpenChange={(open) => !open && setTaskToAssign(null)}
        onAssignSuccess={() => refetch()}
      />

      <SubTaskModal
        isOpen={isSubTaskModalOpen}
        onClose={(created) => {
          setIsSubTaskModalOpen(false);
          if (created) {
            refetch();
            // Refresh delegation chain if open
            if (selectedTask?.id) {
              hrmTasksApi.getSubTasks(selectedTask.id.toString())
                .then((res: any) => setDelegationChain(res?.data || []))
                .catch(() => setDelegationChain([]));
            }
          }
        }}
        parentTask={selectedTask}
        planId={selectedTask?.planId}
      />

      <CoordinationModal
        task={selectedTask}
        open={isCoordinationModalOpen}
        onOpenChange={setIsCoordinationModalOpen}
        onSuccess={() => {
          if (selectedTask?.id) {
            fetchComments(selectedTask.id, true);
          }
        }}
      />

      <AssignCoordinationModal
        task={selectedTask}
        open={isAssignCoordinationOpen}
        onOpenChange={setIsAssignCoordinationOpen}
        onSuccess={() => {
          refetch();
          if (selectedTask?.id) {
            fetchComments(selectedTask.id, true);
          }
        }}
      />
    </div>
  );
};
