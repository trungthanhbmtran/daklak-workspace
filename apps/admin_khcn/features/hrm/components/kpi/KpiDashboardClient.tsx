"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Users, Target, AlertTriangle, TrendingUp, TrendingDown, Clock, Filter, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useKpiDashboard, TimeFilter } from '../../hooks/useKpiDashboard';

export function KpiDashboardClient() {
  const { 
    timeFilter, isLoading, handleFilterChange, 
    topMetrics, performanceTrend, departmentScores, taskDistribution, rankings 
  } = useKpiDashboard();

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Activity className="w-10 h-10 text-indigo-600" />
            Command Center: Giám sát KPI Toàn Cục
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Hệ thống theo dõi hiệu suất, tiến độ và phân bổ nguồn lực cấp Bộ/Ngành.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'YEAR'] as TimeFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                timeFilter === filter 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filter === 'YEAR' ? 'Cả Năm' : `Quý ${filter.replace('Q', '')}`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topMetrics.map((metric, idx) => {
              const isPositive = metric.trend === 'up';
              const isRisk = metric.title.includes('Cảnh báo');
              const goodTrend = isRisk ? !isPositive : isPositive; // For risks, down is good

              return (
                <Card key={idx} className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {idx === 0 && <Target className="w-16 h-16" />}
                    {idx === 1 && <Activity className="w-16 h-16" />}
                    {idx === 2 && <Users className="w-16 h-16" />}
                    {idx === 3 && <AlertTriangle className="w-16 h-16 text-red-500" />}
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{metric.title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-800">{metric.value}</span>
                    </div>
                    <div className={`mt-4 flex items-center text-sm font-bold ${goodTrend ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {Math.abs(metric.change)}% so với kỳ trước
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Trend Chart - Takes up 2 columns */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl lg:col-span-2">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xl font-bold text-slate-800">Xu hướng Hoàn thành Mục tiêu</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMuctieu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorThucte" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="Mục tiêu" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorMuctieu)" />
                      <Area type="monotone" dataKey="Thực tế" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorThucte)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Pie Chart - Takes up 1 column */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xl font-bold text-slate-800">Trạng thái Công việc</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full flex flex-col items-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={taskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="w-full mt-2 grid grid-cols-2 gap-2">
                    {taskDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid: Department Bar Chart & Ranking Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xl font-bold text-slate-800">So sánh Điểm KPI Đơn vị</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentScores} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                      <RechartsTooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="score" name="Điểm KPI" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24}>
                        {departmentScores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#34d399' : entry.score >= 80 ? '#6366f1' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800">Bảng Xếp Hạng Hiệu Suất</CardTitle>
                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">
                  Xem toàn bộ <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Xếp hạng</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Đơn vị / Cơ quan</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Điểm KPI</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((dept, index) => (
                      <tr key={dept.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-amber-100 text-amber-700' :
                            index === 1 ? 'bg-slate-200 text-slate-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            #{index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {dept.name}
                          <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {new Intl.NumberFormat('vi-VN').format(dept.completedTasks)} / {new Intl.NumberFormat('vi-VN').format(dept.totalTasks)} nhiệm vụ
                          </div>
                        </td>
                        <td className="py-4 px-6 font-black text-slate-800 text-right">
                          {dept.score}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {dept.status === 'excellent' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Xuất sắc</span>}
                          {dept.status === 'good' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Khá / Tốt</span>}
                          {dept.status === 'warning' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Cần cố gắng</span>}
                          {dept.status === 'critical' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Báo động</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
