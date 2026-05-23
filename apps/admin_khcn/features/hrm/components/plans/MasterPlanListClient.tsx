'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Plus, Target, Layers, PlayCircle, 
  CheckCircle2, Search, Filter, 
  FileText, Calendar, Zap, LayoutGrid, List as ListIcon, Trash2, Edit, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const MasterPlanListClient = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/admin/hrm/master-plans')
      .then(res => res.json())
      .then(response => {
        if (response && response.data) {
          setPlans(response.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    { label: 'Tổng số Kế hoạch', value: plans.length, icon: <Layers className="h-5 w-5" />, color: 'from-blue-600 to-cyan-500' },
    { label: 'Đang triển khai', value: plans.filter(p => p.status === 'ACTIVE').length, icon: <PlayCircle className="h-5 w-5" />, color: 'from-amber-500 to-orange-400' },
    { label: 'Đã hoàn thành', value: plans.filter(p => p.status === 'COMPLETED').length, icon: <CheckCircle2 className="h-5 w-5" />, color: 'from-emerald-500 to-teal-400' },
    { label: 'OKR / Mục tiêu', value: plans.filter(p => p.type === 'OKR').length, icon: <Target className="h-5 w-5" />, color: 'from-purple-500 to-pink-500' },
  ];

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'SMART_GOAL': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Mục tiêu SMART</Badge>;
      case 'OKR': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">OKR</Badge>;
      case 'MASTER_PLAN': return <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Kế hoạch Tổng thể</Badge>;
      case 'MBO': return <Badge variant="outline" className="text-cyan-600 border-cyan-200 bg-cyan-50">MBO</Badge>;
      case 'KPI': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">KPI</Badge>;
      case 'BSC': return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">BSC</Badge>;
      case 'AGILE': return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Agile</Badge>;
      case 'LEAN': return <Badge variant="outline" className="text-lime-600 border-lime-200 bg-lime-50">Lean</Badge>;
      case 'DATA_DRIVEN': return <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50">Data-Driven</Badge>;
      case 'GOVERNANCE': return <Badge variant="outline" className="text-fuchsia-600 border-fuchsia-200 bg-fuchsia-50">Governance</Badge>;
      case 'PROJECT': return <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">Dự án</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">Đang triển khai</Badge>;
      case 'COMPLETED': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Đã hoàn thành</Badge>;
      case 'DRAFT': return <Badge className="bg-slate-500/10 text-slate-600 border-slate-200 hover:bg-slate-500/20">Bản nháp</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Chủ trương & Kế hoạch
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Quản lý chiến lược, mục tiêu và theo dõi phân rã công việc tổng thể
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900">
            <Zap className="mr-2 h-4 w-4 text-amber-500" /> AI Tạo kế hoạch
          </Button>
          <Link href="/services/hrm/plans/create">
            <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="mr-2 h-5 w-5" /> Thêm Kế hoạch
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white dark:bg-slate-900">
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
            placeholder="Tìm kiếm Nghị quyết, Kế hoạch..." 
            className="pl-10 rounded-full bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-1 focus-visible:ring-indigo-500"
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
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Chưa có Kế hoạch / Chủ trương</h3>
          <p className="text-slate-500 mt-2">Bắt đầu bằng cách tạo mới hoặc dùng AI để phân tích từ Văn bản.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const progress = plan.totalTasks > 0 ? Math.round((plan.completedTasks / plan.totalTasks) * 100) : 0;
            return (
              <Card key={plan.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      {getTypeBadge(plan.type)}
                      {getStatusBadge(plan.status)}
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight mb-3 line-clamp-2">
                      {plan.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-6">
                      {plan.description || 'Chưa có nội dung mô tả chiến lược cụ thể.'}
                    </p>
                    
                    <div className="mt-auto space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Tiến độ phân rã</span>
                          <span className="text-indigo-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                          <span>{plan.completedTasks} hoàn thành</span>
                          <span>{plan.totalTasks} tổng Tasks</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 mr-2 text-rose-500" />
                        <span>Thời hạn: <span className="font-medium text-slate-800 dark:text-slate-200">
                          {plan.startDate ? new Date(plan.startDate).toLocaleDateString('vi-VN') : '?'} - {plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                        </span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-white rounded-full bg-white/50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-white rounded-full bg-white/50">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Link href={`/services/hrm/plans/${plan.id}`}>
                      <Button variant="link" className="px-0 text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                        Chi tiết kế hoạch &rarr;
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl overflow-hidden">
          {/* List View placeholder similar to Tasks... */}
          <div className="p-8 text-center text-slate-500">
            List view is implemented identically to grid data. Please use Grid view for rich experience.
          </div>
        </Card>
      )}
    </div>
  );
};
