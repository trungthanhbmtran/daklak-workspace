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
  Calendar, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTasksList } from '../../hooks';
import { hrmTasksApi } from '../../api';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Search } from '@/components/ui/search';

export const TaskListClient = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Smart Assign states
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [assignStrategy, setAssignStrategy] = useState<'LOW_PERFORMANCE' | 'HIGH_PERFORMANCE'>('LOW_PERFORMANCE');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const fetchRecommendations = async (strategy: string) => {
    if (!taskToAssign) return;
    setIsLoadingRecs(true);
    try {
      const res = await hrmTasksApi.recommendAssignees({ rankCode: 'ALL', strategy });
      if (res.success) {
        setRecommendations(res.data);
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
        <Link href="/services/hrm/tasks/create">
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
            className={`relative border border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 overflow-hidden group cursor-pointer rounded-3xl ${activeFilter === stat.id ? 'ring-2 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950 ring-indigo-500 scale-105' : 'hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]'}`}
            onClick={() => setActiveFilter(activeFilter === stat.id ? null : stat.id)}
          >
            <CardContent className="p-6 relative">
              <div className={`absolute right-0 top-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 dark:opacity-20 rounded-bl-full group-hover:scale-125 transition-transform duration-700`} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-xl shadow-indigo-500/20 group-hover:-rotate-12 transition-transform duration-500`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <Search placeholder="Tìm kiếm công việc..." className="w-full sm:w-96 rounded-2xl" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
        <DialogContent className="max-w-2xl font-sans">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                  {getStatusBadge(selectedTask.status || 'TODO')}
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Ưu tiên</p>
                  <span className={`font-semibold ${getPriorityColor(selectedTask.priority)}`}>{selectedTask.priority || 'MEDIUM'}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Hạn chót</p>
                  <p className="font-semibold text-slate-800">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('vi-VN') : 'Không có'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Người nhận</h4>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex justify-center items-center font-bold mr-3">
                    {(selectedTask.assigneeName || selectedTask.assigneeCode)?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{selectedTask.assigneeName || selectedTask.assigneeCode || 'N/A'}</p>
                    <p className="text-sm text-slate-500">Mã NV: {selectedTask.assigneeCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả công việc</h4>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap min-h-[100px]">
                  {selectedTask.description || 'Chưa có mô tả chi tiết.'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Smart Assign Dialog */}
      <Dialog 
        open={!!taskToAssign} 
        onOpenChange={(open) => {
          if (!open) {
            setTaskToAssign(null);
            setRecommendations([]);
          }
        }}
      >
        <DialogContent className="max-w-xl font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <PlayCircle className="w-5 h-5 mr-2 text-indigo-600" /> Phân công thông minh
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-1">{taskToAssign?.title}</h4>
              <p className="text-sm text-slate-500">
                Hãy chọn người phù hợp nhất để giao việc. Hệ thống tự động tính toán dựa trên khối lượng công việc hiện tại và hiệu suất của nhân viên.
              </p>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <Label className="font-bold text-slate-700">Chiến lược phân công</Label>
                <p className="text-xs text-slate-500">
                  {assignStrategy === 'LOW_PERFORMANCE' 
                    ? 'Ưu tiên người Ít việc & Hiệu suất thấp (cần cải thiện)'
                    : 'Ưu tiên người Ít việc & Giỏi nhất (đảm bảo chất lượng)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Cải thiện</span>
                <Switch 
                  checked={assignStrategy === 'HIGH_PERFORMANCE'}
                  onCheckedChange={(v) => {
                    const newStrategy = v ? 'HIGH_PERFORMANCE' : 'LOW_PERFORMANCE';
                    setAssignStrategy(newStrategy);
                    fetchRecommendations(newStrategy);
                  }}
                />
                <span className="text-xs font-semibold text-indigo-600">Giỏi nhất</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                <span className="w-2 h-6 bg-indigo-500 rounded-full mr-2"></span> Top 5 Đề xuất
              </h4>
              {isLoadingRecs ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec: any, idx: number) => (
                    <div key={rec.employeeCode} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex justify-center items-center font-bold text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                            {rec.employeeName?.charAt(0) || '?'}
                          </div>
                          {idx === 0 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                              #1
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-base text-slate-800">{rec.employeeName}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium">
                            <span title="Số điểm/trọng số công việc đang làm" className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                              Tải việc: <b className="ml-1 text-slate-700">{rec.currentLoad}</b>
                            </span>
                            <span title="Điểm hiệu suất trung bình" className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                              Hiệu suất: <b className="ml-1 text-slate-700">{Math.round(rec.performanceScore)}</b>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Độ phù hợp</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${Math.round(rec.matchScore)}%` }}></div>
                            </div>
                            <p className="font-black text-indigo-600 text-sm">{Math.round(rec.matchScore)}%</p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          className="rounded-full px-6 font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-none hover:shadow-lg transition-all duration-300"
                          onClick={async () => {
                            try {
                              await hrmTasksApi.assignTask(taskToAssign.id, { assigneeCode: rec.employeeCode });
                              toast.success('Giao việc thành công!');
                              setTaskToAssign(null);
                              refetch();
                            } catch (e: any) {
                              toast.error('Giao việc thất bại');
                            }
                          }}
                        >
                          Giao việc
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recommendations.length === 0 && !isLoadingRecs && (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Không tìm thấy nhân sự phù hợp.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
