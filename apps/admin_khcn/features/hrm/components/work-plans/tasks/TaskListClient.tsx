'use client';

import { useState, useEffect } from 'react';
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
import { useUser } from '@/hooks/useUser';

export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // New features state
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_TASKS' | 'DEPT_TASKS'>('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const { user } = useUser();
  const currentUser = {
    code: user?.employeeCode || '',
    departmentId: user?.departmentId || 0,
    isManager: user?.jobTitle?.code === 'GIAM_DOC' || user?.jobTitle?.code === 'PHO_GIAM_DOC' || user?.jobTitle?.code === 'TRUONG_PHONG'
  };
  // Smart Assign states
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [assignStrategy, setAssignStrategy] = useState<string>('UNDER_QUOTA');
  const [topEmployees, setTopEmployees] = useState<any[]>([]);
  const [topDepartments, setTopDepartments] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const fetchRecommendations = async (strategy: string) => {
    if (!taskToAssign) return;
    setIsLoadingRecs(true);
    try {
      const res = await hrmTasksApi.recommendAssignees({ rankCode: 'ALL', strategy });
      if (res.success) {
        if (Array.isArray(res.data)) {
          setTopEmployees(res.data);
          setTopDepartments([]);
        } else {
          setTopEmployees(res.data?.topEmployees || []);
          setTopDepartments(res.data?.topDepartments || []);
        }
      }
    } catch (e: any) {
      toast.error('Lỗi khi lấy danh sách gợi ý');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Fetch recommendations automatically when task is selected
  useEffect(() => {
    if (taskToAssign) {
      fetchRecommendations(assignStrategy);
    }
  }, [taskToAssign?.id, assignStrategy]);

  // Server side filtering
  const { data, isLoading, refetch } = useTasksList({
    filter: activeFilter,
    search: searchQuery,
    ...(activeTab === 'MY_TASKS' ? { assigneeCode: currentUser.code } : {}),
    ...(activeTab === 'DEPT_TASKS' ? { departmentId: currentUser.departmentId } : {}),
  });
  const tasks = data?.data || [];
  const statsData = data?.stats || { overdueCount: 0, dueIn3DaysCount: 0, dueIn7DaysCount: 0, dueOver7DaysCount: 0 };

  const stats = [
    { id: 'overdue', label: 'Quá hạn xử lý', value: statsData.overdueCount, icon: <AlertCircle className="h-5 w-5" />, color: 'from-red-600 to-red-400 text-white' },
    { id: 'dueIn3Days', label: 'Còn ≤ 3 ngày', value: statsData.dueIn3DaysCount, icon: <Clock className="h-5 w-5" />, color: 'from-orange-500 to-orange-400 text-white' },
    { id: 'dueIn7Days', label: 'Còn 4-7 ngày', value: statsData.dueIn7DaysCount, icon: <Calendar className="h-5 w-5" />, color: 'from-yellow-500 to-yellow-400 text-white' },
    { id: 'dueOver7Days', label: 'Còn > 7 ngày', value: statsData.dueOver7DaysCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'from-green-500 to-emerald-400 text-white' },
  ];

  const displayedTasks = tasks;

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
    }
  }, [selectedTask?.id]);

  const handleSendMessage = async () => {
    const trimmedMessage = chatMessage.trim();
    if (!trimmedMessage || !selectedTask || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      await hrmTasksApi.addComment(selectedTask.id.toString(), {
        authorCode: currentUser.code,
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
        authorCode: currentUser.code,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            HRM WORKSPACE
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white">
            Trung tâm Giao việc
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Điều phối, theo dõi và quản lý tiến độ công việc toàn diện
          </p>
        </div>
        <Link href="/services/hrm/work-plans/tasks/create">
          <Button className="rounded-full h-12 px-8 text-base shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none group">
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> Giao việc mới
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`relative border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden group cursor-pointer rounded-3xl bg-gradient-to-br ${stat.color} ${activeFilter === stat.id ? 'ring-4 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950 ring-indigo-500 scale-105' : 'hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] hover:brightness-110'}`}
            onClick={() => setActiveFilter(activeFilter === stat.id ? null : stat.id)}
          >
            <CardContent className="p-6 relative text-white">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-bl-full group-hover:scale-125 transition-transform duration-700" />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-wider text-white/90 drop-shadow-sm">{stat.label}</p>
                  <p className="text-5xl font-black text-white tracking-tighter drop-shadow-md">{stat.value}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-xl group-hover:-rotate-12 transition-transform duration-500 text-white">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="flex-1 flex gap-4 items-center w-full">
          <Search placeholder="Tìm kiếm công việc..." className="w-full sm:max-w-[300px] rounded-2xl" />
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 rounded-full bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="ALL" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Tất cả</TabsTrigger>
              <TabsTrigger value="MY_TASKS" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Việc của tôi</TabsTrigger>
              <TabsTrigger value="DEPT_TASKS" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Việc của phòng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Button variant="outline" className="rounded-full border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800">
            <Filter className="mr-2 h-4 w-4 text-slate-500" /> Bộ lọc
          </Button>
          <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md text-white' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md text-white' : 'text-slate-500 hover:text-slate-800'}`}
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
            {activeFilter ? "Không có công việc nào phù hợp với bộ lọc" : "Hoan hô! Không có công việc nào"}
          </h3>
          <p className="text-slate-500 mt-2">
            {activeFilter ? "Thử chọn một bộ lọc khác hoặc bỏ chọn." : "Bạn đã hoàn thành tất cả hoặc chưa có công việc được giao."}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {displayedTasks.map((task: any) => (
            <Card key={task.id} className="group relative hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-0 relative z-10 flex flex-col h-full">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(task.status || 'TODO')}
                    <div className="flex gap-2">
                      {!task.assigneeCode && (
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
                  <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 min-h-[40px]">
                    {task.description || 'Chưa có mô tả chi tiết cho công việc này.'}
                  </p>

                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3 text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm">
                        {(task.assigneeName || task.assigneeCode)?.charAt(0) || '?'}
                      </div>
                      <span className="truncate flex-1 font-medium text-slate-800 dark:text-slate-200">
                        {task.assigneeName || task.assigneeCode || 'Chưa phân công'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mr-3 text-rose-600 dark:text-rose-400 shadow-sm">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-rose-600 dark:text-rose-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors duration-500">
                  <span className={`text-xs font-black uppercase tracking-widest flex items-center ${getPriorityColor(task.priority)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 bg-current animate-pulse shadow-sm shadow-current`} />
                    {task.priority || 'MEDIUM'} PRIORITY
                  </span>
                  <Button variant="link" onClick={() => setSelectedTask(task)} className="px-0 text-indigo-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                    Chi tiết &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none rounded-3xl overflow-hidden relative z-10">
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
                    <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white max-w-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {task.title}
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
                          {(task.assigneeName || task.assigneeCode)?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium">{task.assigneeName || task.assigneeCode || 'Chưa phân công'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {!task.assigneeCode && (
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
                              <div key={idx} className={`flex gap-3 ${msg.authorCode === currentUser.code ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                                  {msg.authorName?.charAt(0) || msg.authorCode?.charAt(0) || '?'}
                                </div>
                                <div className={`max-w-[75%] rounded-2xl p-3 ${msg.isSystemMessage ? 'bg-rose-50 text-rose-600 border border-rose-100' : msg.authorCode === currentUser.code ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-tl-none'}`}>
                                  {!msg.isSystemMessage && msg.authorCode !== currentUser.code && (
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
                            placeholder={selectedTask.status === 'DONE' ? "Công việc đã hoàn thành, không thể chat" : "Nhập tin nhắn trao đổi..."}
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
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center">
                        <span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span>
                        Người tiếp nhận
                      </h4>
                      <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800/50 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex justify-center items-center font-black text-3xl mb-4 shadow-xl shadow-indigo-200/50 border-4 border-indigo-50 dark:border-indigo-900/50">
                          {(selectedTask.assigneeName || selectedTask.assigneeCode)?.charAt(0) || '?'}
                        </div>
                        <p className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                          {selectedTask.assigneeName || selectedTask.assigneeCode || 'Chưa phân công'}
                        </p>
                        {selectedTask.assigneeCode && (
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/50 px-3 py-1 rounded-full uppercase tracking-wider">
                            ID: {selectedTask.assigneeCode}
                          </p>
                        )}
                        {!selectedTask.assigneeCode && (
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

      {/* Smart Assign Dialog */}
      <Dialog
        open={!!taskToAssign}
        onOpenChange={(open) => {
          if (!open) {
            setTaskToAssign(null);
            setTopEmployees([]);
            setTopDepartments([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <PlayCircle className="w-5 h-5 mr-2 text-indigo-600" /> Phân công thông minh
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-1">{taskToAssign?.title}</h4>
              <p className="text-sm text-slate-500">
                Hệ thống tự động tính toán dựa trên khối lượng công việc hiện tại và hiệu suất của Phòng ban / Nhân viên.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="font-bold text-slate-700 mb-2">Chiến lược phân công ưu tiên</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setAssignStrategy('HIGH_PERFORMANCE');
                    fetchRecommendations('HIGH_PERFORMANCE');
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${assignStrategy === 'HIGH_PERFORMANCE' ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105 z-10' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                >
                  <p className={`font-bold text-sm ${assignStrategy === 'HIGH_PERFORMANCE' ? 'text-indigo-700' : 'text-slate-700'}`}>🏆 Giỏi nhất</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Đảm bảo chất lượng công việc cao nhất</p>
                </div>
                <div
                  onClick={() => {
                    setAssignStrategy('UNDER_QUOTA');
                    fetchRecommendations('UNDER_QUOTA');
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${assignStrategy === 'UNDER_QUOTA' ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105 z-10' : 'border-slate-100 hover:border-emerald-200 bg-white'}`}
                >
                  <p className={`font-bold text-sm ${assignStrategy === 'UNDER_QUOTA' ? 'text-emerald-700' : 'text-slate-700'}`}>⚖️ Chưa đủ mức</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Ưu tiên người/phòng đang rảnh rỗi</p>
                </div>
                <div
                  onClick={() => {
                    setAssignStrategy('LOW_PERFORMANCE');
                    fetchRecommendations('LOW_PERFORMANCE');
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${assignStrategy === 'LOW_PERFORMANCE' ? 'border-amber-500 bg-amber-50 shadow-md scale-105 z-10' : 'border-slate-100 hover:border-amber-200 bg-white'}`}
                >
                  <p className={`font-bold text-sm ${assignStrategy === 'LOW_PERFORMANCE' ? 'text-amber-700' : 'text-slate-700'}`}>📈 Cần cải thiện</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Tạo cơ hội nâng cao hiệu suất</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột Đề xuất Phòng ban */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full mr-2"></span> Top Đề xuất Phòng ban
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
                          {idx === 0 && <Badge className="bg-emerald-500">Phù hợp nhất</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
                          <div>Tải TB: <b className="text-slate-700">{Math.round(rec.currentLoad)}</b></div>
                          <div>Hiệu suất TB: <b className="text-slate-700">{Math.round(rec.performanceScore)}</b></div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          onClick={async () => {
                            try {
                              await hrmTasksApi.assignTask(taskToAssign.id.toString(), { assigneeCode: '', departmentId: rec.departmentId });
                              toast.success('Đã giao việc cho Phòng ban!');
                              setTaskToAssign(null);
                              refetch();
                            } catch (e: any) {
                              toast.error('Giao việc thất bại');
                            }
                          }}
                        >
                          Giao cho Phòng này
                        </Button>
                      </div>
                    ))}
                    {topDepartments.length === 0 && !isLoadingRecs && (
                      <p className="text-xs text-slate-400 text-center py-4">Không có gợi ý phòng ban</p>
                    )}
                  </div>
                )}
              </div>

              {/* Cột Đề xuất Cá nhân */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full mr-2"></span> Top Đề xuất Cá nhân
                </h4>
                {isLoadingRecs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topEmployees.map((rec: any, idx: number) => (
                      <div key={rec.employeeCode} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex justify-center items-center font-bold">
                              {rec.employeeName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800">{rec.employeeName}</p>
                              <p className="text-xs text-slate-500">Phòng {rec.departmentId || '?'}</p>
                            </div>
                          </div>
                          {idx === 0 && <Badge className="bg-indigo-500">Phù hợp nhất</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
                          <div>Tải việc: <b className="text-slate-700">{Math.round(rec.currentLoad)}</b></div>
                          <div>Hiệu suất: <b className="text-slate-700">{Math.round(rec.performanceScore)}</b></div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                          onClick={async () => {
                            try {
                              await hrmTasksApi.assignTask(taskToAssign.id.toString(), { assigneeCode: rec.employeeCode });
                              toast.success('Đã giao việc cho cá nhân!');
                              setTaskToAssign(null);
                              refetch();
                            } catch (e: any) {
                              toast.error('Giao việc thất bại');
                            }
                          }}
                        >
                          Giao trực tiếp
                        </Button>
                      </div>
                    ))}
                    {topEmployees.length === 0 && !isLoadingRecs && (
                      <p className="text-xs text-slate-400 text-center py-4">Không có gợi ý cá nhân</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
