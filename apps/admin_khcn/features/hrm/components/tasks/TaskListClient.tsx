'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Plus, Eye, Edit, Trash2,
  CheckCircle2, Clock, PlayCircle,
  AlertCircle, Search, Filter,
  LayoutGrid, List as ListIcon,
  Calendar, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTasksList } from '../../hooks';

export const TaskListClient = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data, isLoading } = useTasksList();
  const tasks = data?.data || [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeTasks = tasks.filter(t => t.status !== 'DONE' && t.status !== 'ARCHIVED');

  const overdueCount = activeTasks.filter(t => {
    if (t.status === 'OVERDUE') return true;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }).length;

  const dueIn3DaysCount = activeTasks.filter(t => {
    if (t.status === 'OVERDUE') return false;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < now) return false;
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  const dueIn7DaysCount = activeTasks.filter(t => {
    if (t.status === 'OVERDUE') return false;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < now) return false;
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 3 && diffDays <= 7;
  }).length;

  const dueOver7DaysCount = activeTasks.filter(t => {
    if (t.status === 'OVERDUE') return false;
    if (!t.dueDate) return true; // Tasks without deadline are technically safe
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < now) return false;
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  }).length;

  const stats = [
    { id: 'overdue', label: 'Quá hạn xử lý', value: overdueCount, icon: <AlertCircle className="h-5 w-5" />, color: 'from-red-600 to-red-400 text-white' },
    { id: 'dueIn3Days', label: 'Còn ≤ 3 ngày', value: dueIn3DaysCount, icon: <Clock className="h-5 w-5" />, color: 'from-orange-500 to-orange-400 text-white' },
    { id: 'dueIn7Days', label: 'Còn 4-7 ngày', value: dueIn7DaysCount, icon: <Calendar className="h-5 w-5" />, color: 'from-yellow-500 to-yellow-400 text-white' },
    { id: 'dueOver7Days', label: 'Còn > 7 ngày', value: dueOver7DaysCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'from-green-500 to-emerald-400 text-white' },
  ];

  const displayedTasks = tasks.filter(t => {
    if (!activeFilter) return true;
    if (t.status === 'DONE' || t.status === 'ARCHIVED') return false;

    if (activeFilter === 'overdue') {
      if (t.status === 'OVERDUE') return true;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < now;
    }

    if (activeFilter === 'dueIn3Days') {
      if (t.status === 'OVERDUE') return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < now) return false;
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    }

    if (activeFilter === 'dueIn7Days') {
      if (t.status === 'OVERDUE') return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < now) return false;
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 3 && diffDays <= 7;
    }

    if (activeFilter === 'dueOver7Days') {
      if (t.status === 'OVERDUE') return false;
      if (!t.dueDate) return true;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < now) return false;
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }

    return true;
  });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Trung tâm Giao việc
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Điều phối, theo dõi và quản lý tiến độ công việc toàn diện
          </p>
        </div>
        <Link href="/services/hrm/tasks/create">
          <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
            <Plus className="mr-2 h-5 w-5" /> Giao việc mới
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`border-none shadow-md transition-all duration-300 overflow-hidden group cursor-pointer ${activeFilter === stat.id ? 'ring-4 ring-offset-2 ring-indigo-500 scale-105' : 'hover:shadow-xl'}`}
            onClick={() => setActiveFilter(activeFilter === stat.id ? null : stat.id)}
          >
            <CardContent className="p-6 relative">
              <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-800 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm công việc..."
            className="pl-10 rounded-full bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-full border-slate-200">
            <Filter className="mr-2 h-4 w-4 text-slate-500" /> Bộ lọc
          </Button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-3 ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-3 ${viewMode === 'list' ? 'shadow-sm' : ''}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTasks.map((task: any) => (
            <Card key={task.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(task.status || 'TODO')}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-4 w-4 text-slate-400 hover:text-indigo-600" />
                    </Button>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 min-h-[40px]">
                    {task.description || 'Chưa có mô tả chi tiết cho công việc này.'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                      <User className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="truncate">Người nhận: <span className="font-medium text-slate-800 dark:text-slate-200">{task.assigneeName || task.assigneeCode || 'Chưa phân công'}</span></span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 mr-2 text-rose-500" />
                      <span>Hạn chót: <span className="font-medium text-slate-800 dark:text-slate-200">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có'}</span></span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center ${getPriorityColor(task.priority)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 bg-current animate-pulse`} />
                    {task.priority || 'MEDIUM'} PRIORITY
                  </span>
                  <Button variant="link" onClick={() => setSelectedTask(task)} className="px-0 text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Xem chi tiết &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tên công việc</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Mức độ ưu tiên</th>
                  <th className="px-6 py-4 font-semibold">Người nhận</th>
                  <th className="px-6 py-4 font-semibold">Hạn chót</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((task: any) => (
                  <tr key={task.id} className="bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task.status || 'TODO')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getPriorityColor(task.priority)}`}>{task.priority || 'MEDIUM'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex justify-center items-center text-xs font-bold mr-2">
                          {(task.assigneeName || task.assigneeCode)?.charAt(0) || '?'}
                        </div>
                        {task.assigneeName || task.assigneeCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTask(task)} className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50">
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
    </div>
  );
};
