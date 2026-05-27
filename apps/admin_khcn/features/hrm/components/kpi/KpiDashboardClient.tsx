"use client";
import React, { useState, useMemo } from 'react';
import {
  Target, TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, Download, Filter, Search, Building2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- INITIAL MOCK DATA FALLBACK ---
const initialTrendData = [
  { month: 'T1', performance: 85, target: 100 },
  { month: 'T2', performance: 88, target: 100 },
  { month: 'T3', performance: 92, target: 100 },
  { month: 'T4', performance: 87, target: 100 },
  { month: 'T5', performance: 95, target: 100 },
  { month: 'T6', performance: 102, target: 100 },
];

const initialDeptData = [
  { name: 'Trung tâm IOC', score: 105, completed: 24, total: 25 },
  { name: 'Phòng Quản lý CN', score: 92, completed: 15, total: 18 },
  { name: 'Văn phòng Sở', score: 88, completed: 18, total: 22 },
  { name: 'Thanh tra Sở', score: 95, completed: 10, total: 10 },
];

const COLORS = ['#16a34a', '#eab308', '#ef4444', '#8b5cf6'];

const initialKpiDetails = [
  { id: '1', dept: 'Trung tâm IOC', name: 'Tỷ lệ uptime hạ tầng trục liên thông LGSP', weight: 30, target: 99.9, actual: 99.95, unit: '%', status: 'Xuất sắc' },
  { id: '2', dept: 'Văn phòng Sở', name: 'Tỷ lệ xử lý văn bản iDesk đúng hạn', weight: 40, target: 100, actual: 95, unit: '%', status: 'Khá' },
  { id: '3', dept: 'Phòng Quản lý CN', name: 'Số lượng đề tài NCKH được nghiệm thu', weight: 25, target: 5, actual: 3, unit: 'Đề tài', status: 'Cần cố gắng' },
  { id: '4', dept: 'Trung tâm IOC', name: 'Số lượng API Gateway được tích hợp mới', weight: 20, target: 15, actual: 18, unit: 'API', status: 'Xuất sắc' },
];

export default function ExecutiveKPIDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q2-2026');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Data States
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState(initialTrendData);
  const [deptData, setDeptData] = useState(initialDeptData);
  const [kpiDetails, setKpiDetails] = useState(initialKpiDetails);
  
  React.useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/hrm/kpi-evaluations?period=${selectedPeriod}`)
      .then(res => res.json())
      .then(data => {
        if (data?.kpiDetails) setKpiDetails(data.kpiDetails);
        if (data?.deptData) setDeptData(data.deptData);
        if (data?.trendData) setTrendData(data.trendData);
      })
      .catch(err => console.error("Error fetching KPI Data:", err))
      .finally(() => setIsLoading(false));
  }, [selectedPeriod]);

  // Tính toán dữ liệu cho biểu đồ tròn (Phân bổ trạng thái)
  const statusDistribution = useMemo(() => {
    const dist = { 'Xuất sắc': 0, 'Tốt': 0, 'Khá': 0, 'Cần cố gắng': 0 };
    kpiDetails.forEach(k => { if(dist[k.status as keyof typeof dist] !== undefined) dist[k.status as keyof typeof dist]++; });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [kpiDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Xuất sắc': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Tốt': return 'bg-green-100 text-green-700 border-green-200';
      case 'Khá': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Cần cố gắng': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sở Khoa học và Công nghệ tỉnh Đắk Lắk</h1>
            <p className="text-sm text-slate-500">Bảng điều khiển Giám sát Hiệu suất Tổng thể (Executive Dashboard)</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[160px] bg-white">
                <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Chọn kỳ đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1-2026">Quý 1 / 2026</SelectItem>
                <SelectItem value="Q2-2026">Quý 2 / 2026</SelectItem>
                <SelectItem value="2026">Toàn năm 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Báo cáo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tổng quan Cơ quan
            </TabsTrigger>
            <TabsTrigger value="departments" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Chi tiết Đơn vị trực thuộc
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          <TabsContent value="overview" className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Top Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">Điểm hiệu suất trung bình</p>
                      <p className="text-3xl font-bold text-slate-900">96.8%</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                    <span>+2.4%</span>
                    <span className="text-slate-400 ml-2 font-normal">so với quý trước</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">Tổng Mục tiêu (KPIs)</p>
                      <p className="text-3xl font-bold text-slate-900">85</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-slate-500">
                    <span>60 Đã hoàn thành / 25 Đang xử lý</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">Đơn vị Xuất sắc</p>
                      <p className="text-3xl font-bold text-purple-700">Trung tâm IOC</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
                    <span>105%</span>
                    <span className="text-slate-400 ml-2 font-normal">tỷ lệ hoàn thành</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-red-100 bg-red-50/30">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">Chỉ số rủi ro cao</p>
                      <p className="text-3xl font-bold text-red-700">03</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-red-600">
                    <span>Cần ban giám đốc can thiệp</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-7">
              {/* Trend Chart */}
              <Card className="lg:col-span-4 shadow-sm">
                <CardHeader>
                  <CardTitle>Biểu đồ xu hướng hiệu suất (2026)</CardTitle>
                  <CardDescription>Theo dõi biến động điểm KPI trung bình toàn cơ quan qua các tháng.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 120]} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Line type="monotone" name="Hiệu suất thực tế (%)" dataKey="performance" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" name="Mục tiêu chuẩn (100%)" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution & Dept Ranking */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Phân bổ chất lượng Mục tiêu</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-sm w-1/2">
                      {statusDistribution.map((stat, i) => (
                        <div key={stat.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                            {stat.name}
                          </span>
                          <span className="font-medium">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Top Đơn vị Dẫn đầu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deptData.map((dept) => (
                      <div key={dept.name} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{dept.name}</span>
                          <span className="font-bold text-slate-900">{dept.score}%</span>
                        </div>
                        <Progress value={Math.min(dept.score, 100)} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: DETAILED DATA TABLE */}
          <TabsContent value="departments" className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-slate-50/50 rounded-t-xl pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Bảng chi tiết chỉ tiêu theo Đơn vị</CardTitle>
                    <CardDescription>Tìm kiếm, lọc và xuất dữ liệu báo cáo chi tiết từng mục tiêu.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Tìm tên chỉ số..."
                        className="pl-8 w-[250px] bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-900">Đơn vị / Phòng ban</TableHead>
                      <TableHead className="font-semibold text-slate-900 w-[35%]">Tên chỉ số KPI</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Trọng số</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-right">Chỉ tiêu / Thực tế</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Tiến độ</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Xếp loại</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiDetails
                      .filter(kpi => kpi.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((kpi) => {
                        const completion = (kpi.actual / kpi.target) * 100;
                        return (
                          <TableRow key={kpi.id} className="hover:bg-slate-50/80 transition-colors">
                            <TableCell className="font-medium text-slate-600">{kpi.dept}</TableCell>
                            <TableCell className="font-medium text-slate-900">{kpi.name}</TableCell>
                            <TableCell className="text-center font-medium">{kpi.weight}%</TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              <span className="text-slate-500">{kpi.target}</span>
                              <span className="mx-1">/</span>
                              <span className="font-bold text-primary">{kpi.actual}</span>
                              <span className="text-xs text-slate-400 ml-1">{kpi.unit}</span>
                            </TableCell>
                            <TableCell className="text-center font-mono font-medium">
                              {completion.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`${getStatusColor(kpi.status)} font-medium border`}>
                                {kpi.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}