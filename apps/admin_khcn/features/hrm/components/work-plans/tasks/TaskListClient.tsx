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
  Calendar, User, MessageSquare, Send, Reply, X, ArrowLeftCircle, Split, Target
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

  const handleRequestCoordination = async () => {
    if (!selectedTask) return;
    try {
      await hrmTasksApi.addComment(selectedTask.id.toString(), {
        content: `⚠️ [ĐỀ NGHỊ PHỐI HỢP]: Tôi cần hỗ trợ để xử lý công việc này.`,
      });
      toast.success('Đã gửi đề nghị phối hợp');
      fetchComments(selectedTask.id, true);
    } catch (e: any) {
      toast.error('Lỗi khi gửi đề nghị');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Trung tâm Giao việc
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Điều phối, theo dõi và quản lý tiến độ công việc toàn diện
          </p>
        </div>
        <Link href="/services/hrm/work-plans/master-plans">
          <Button className="rounded-xl h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors border-none">
            <Target className="mr-2 h-4 w-4" /> Kế hoạch & Giao việc
          </Button>
        </Link>
      </div>

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
                  <th className="px-6 py-5 font-bold tracking-wider">Người nhận</th>
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
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 flex justify-center items-center text-xs font-bold mr-3 shadow-sm border border-indigo-100/50">
                          {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                        </div>
                        <span className="font-medium">{task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode || 'Chưa phân công')}</span>
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
        <DialogContent className="w-[95vw] max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] h-[95vh] lg:h-[90vh] font-sans p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-white dark:bg-slate-900 flex flex-col">
          {selectedTask && (
            <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
              {/* Cover/Header area */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 pb-12 relative text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                      {selectedTask.priority || 'MEDIUM'} PRIORITY
                    </span>
                    {selectedTask.plan && (
                      <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest flex items-center border border-indigo-400">
                        <Target className="w-3 h-3 mr-1" /> {selectedTask.plan.title}
                      </span>
                    )}
                    {selectedTask.status === 'DONE' && (
                      <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest flex items-center border border-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> HOÀN THÀNH
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-3xl md:text-4xl font-black leading-tight drop-shadow-md mb-2">
                    {selectedTask.title}
                  </DialogTitle>
                </div>
              </div>

              {/* Content area */}
              <div className="p-8 -mt-8 relative z-20">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-indigo-900/5 border border-slate-100 dark:border-slate-700 p-6 flex justify-between items-center mb-8 gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                    <div className="scale-110 origin-left mt-2">
                      {getStatusBadge(selectedTask.status || 'TODO')}
                    </div>
                  </div>
                  <div className="w-px h-12 bg-slate-100 dark:bg-slate-700 hidden md:block"></div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hạn chót</p>
                    <div className="flex items-center text-slate-800 dark:text-slate-100 font-bold text-lg">
                      <Calendar className="w-5 h-5 text-rose-500 mr-2" />
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('vi-VN') : 'Không có thời hạn'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-2 flex flex-col space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
                        Mô tả chi tiết
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800 text-sm">
                        {selectedTask.description || 'Chưa có mô tả chi tiết cho công việc này.'}
                      </div>
                    </div>

                    {/* Chat Box / Trao đổi công việc */}
                    <div className="flex-1 min-h-[300px] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-0 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center">
                          <span className="w-2 h-6 bg-cyan-500 rounded-full mr-3"></span>
                          Trao đổi công việc
                        </h4>
                      </div>
                      <div className="flex-1 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {isLoadingComments ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                          ) : taskComments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                              <p className="text-sm">Chưa có trao đổi nào</p>
                            </div>
                          ) : (
                            taskComments.map((msg, idx) => (
                              <div key={idx} className={`flex gap-3 ${msg.authorCode === currentUser?.username ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                                  {msg.authorName?.charAt(0) || msg.authorCode?.charAt(0) || '?'}
                                </div>
                                <div className={`max-w-[75%] rounded-2xl p-3 ${msg.isSystemMessage ? 'bg-rose-50 text-rose-600 border border-rose-100' : msg.authorCode === currentUser?.username ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-tl-none'}`}>
                                  {!msg.isSystemMessage && msg.authorCode !== currentUser?.username && (
                                    <p className="text-xs font-bold mb-1 opacity-70">{msg.authorName || msg.authorCode}</p>
                                  )}
                                  <p className="text-sm">{msg.content}</p>
                                  <p className="text-[10px] opacity-50 mt-1 text-right">
                                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            disabled={selectedTask.status === 'DONE' || isSendingMessage}
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                handleSendMessage();
                              }
                            }}
                            placeholder={
                              selectedTask.status === 'DONE'
                                ? "Công việc đã hoàn thành, không thể chat"
                                : "Nhập tin nhắn trao đổi..."
                            }
                            className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                          />
                          <Button
                            disabled={selectedTask.status === 'DONE' || !chatMessage.trim() || isSendingMessage}
                            onClick={handleSendMessage}
                            className="rounded-full w-10 h-10 p-0 bg-indigo-600 hover:bg-indigo-700 shrink-0 disabled:opacity-50"
                          >
                            {isSendingMessage ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-6">
                    {/* Chuỗi giao việc - Delegation Timeline */}
                    {(isLoadingChain || delegationChain.length > 0) && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center">
                          <span className="w-2 h-6 bg-amber-500 rounded-full mr-3"></span>
                          Chuỗi giao việc
                        </h4>
                        {isLoadingChain ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {delegationChain.map((node: any, idx: number) => {
                              const isLast = idx === delegationChain.length - 1;
                              const level: number = node.level ?? (node.isParent ? -1 : node.isCurrent ? 0 : 1);
                              const statusColors: Record<string, string> = {
                                DONE: 'bg-emerald-500',
                                IN_PROGRESS: 'bg-amber-500',
                                TODO: 'bg-blue-500',
                                TEMPLATE: 'bg-slate-400',
                                OVERDUE: 'bg-rose-500',
                              };
                              const dotColor = statusColors[node.status] || 'bg-slate-400';

                              // Màu card theo level
                              const bgColor = node.isCurrent
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
                                : node.isParent
                                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200'
                                  : level === 1
                                    ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100'
                                    : level === 2
                                      ? 'bg-violet-50/60 dark:bg-violet-900/10 border-violet-100'
                                      : level === 3
                                        ? 'bg-orange-50/60 dark:bg-orange-900/10 border-orange-100'
                                        : 'bg-rose-50/60 dark:bg-rose-900/10 border-rose-100'; // cấp 4+

                              // Label theo level
                              const levelLabel = node.isParent
                                ? '↑ Task gốc'
                                : node.isCurrent
                                  ? '▶ Task này'
                                  : level === 1
                                    ? `↓ Giao tiếp cấp 1`
                                    : `↓ Giao tiếp cấp ${level}`;

                              // Indent theo cấp (cấp con thụt vào)
                              const indentPx = Math.max(0, level) * 12;

                              return (
                                <div key={node.id} className="flex items-stretch gap-2" style={{ paddingLeft: `${indentPx}px` }}>
                                  {/* Timeline dot + line */}
                                  <div className="flex flex-col items-center w-6 shrink-0">
                                    <div className={`w-3 h-3 rounded-full ${dotColor} mt-3.5 shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-800`}></div>
                                    {!isLast && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1"></div>}
                                  </div>
                                  {/* Node content */}
                                  <div 
                                    onClick={() => node.id !== selectedTask?.id && setSelectedTask(node)}
                                    className={`flex-1 border rounded-xl p-3 mb-1.5 transition-all duration-200 ${
                                      node.id !== selectedTask?.id ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:ring-2 hover:ring-indigo-500/50' : 'ring-2 ring-indigo-500 shadow-sm'
                                    } ${bgColor}`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {levelLabel}
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${dotColor}`}>
                                        {node.status}
                                      </span>
                                    </div>
                                    <p className={`font-semibold text-sm line-clamp-1 mb-2 ${node.id === selectedTask?.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                      {node.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      {node.assignerName && (
                                        <span className="flex items-center gap-1">
                                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px]">
                                            {node.assignerName?.charAt(0)}
                                          </span>
                                          <span className="text-slate-400">giao</span>
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[9px]">
                                          {(node.assigneeName || node.assigneeCode)?.charAt(0) || '?'}
                                        </span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{node.assigneeName || node.assigneeCode}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Người tiếp nhận */}
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                        Người tiếp nhận
                      </h4>
                      <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800/50 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex justify-center items-center font-black text-3xl mb-4 shadow-xl shadow-indigo-200/50 border-4 border-indigo-50 dark:border-indigo-900/50">
                          {selectedTask.assigneeCode === 'UNASSIGNED' ? '?' : ((selectedTask.assigneeName || selectedTask.assigneeCode)?.charAt(0) || '?')}
                        </div>
                        <p className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                          {selectedTask.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (selectedTask.assigneeName || selectedTask.assigneeCode || 'Chưa phân công')}
                        </p>
                        {selectedTask.assigneeCode && selectedTask.assigneeCode !== 'UNASSIGNED' && (
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/50 px-3 py-1 rounded-full uppercase tracking-wider">
                            ID: {selectedTask.assigneeCode}
                          </p>
                        )}
                        {(!selectedTask.assigneeCode || selectedTask.assigneeCode === 'UNASSIGNED') && (
                          <Button
                            className="mt-4 rounded-full w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                            onClick={() => setTaskToAssign(selectedTask)}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" /> Giao việc ngay
                          </Button>
                        )}
                      </div>
                    </div>

                    {selectedTask.supervisorCode && (
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center mt-6">
                          <span className="w-2 h-6 bg-orange-500 rounded-full mr-3"></span>
                          Lãnh đạo theo dõi, chỉ đạo
                        </h4>
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-5 rounded-3xl border border-orange-100 dark:border-orange-800/30 flex items-center">
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 flex justify-center items-center font-bold text-lg shadow-sm border-2 border-orange-100 dark:border-orange-900/50 mr-4 shrink-0">
                            {(selectedTask.supervisorName || selectedTask.supervisorCode)?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-md text-slate-800 dark:text-slate-100">
                              {selectedTask.supervisorName || selectedTask.supervisorCode}
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Lãnh đạo Sở</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hành động */}
                    {selectedTask.status !== 'DONE' && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center">
                          <span className="w-2 h-6 bg-slate-500 rounded-full mr-3"></span>
                          Hành động
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          <Button
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                            onClick={handleCompleteTask}
                          >
                            <CheckCircle2 className="w-5 h-5 mr-2" /> Hoàn thành công việc
                          </Button>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 bg-white"
                              onClick={handleRequestCoordination}
                            >
                              <Split className="w-4 h-4 mr-2" /> Xin phối hợp
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 bg-white"
                              onClick={() => setIsRejectOpen(true)}
                            >
                              <Reply className="w-4 h-4 mr-2" /> Trả lại
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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
    </div>
  );
};
