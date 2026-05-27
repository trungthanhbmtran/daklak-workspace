// src/app/executive-kpi/_components/OverviewTab.tsx
"use client";
import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const COLORS = ['#a855f7', '#22c55e', '#eab308', '#ef4444'];

interface OverviewTabProps {
    kpiDetails: any[];
    deptData: any[];
    trendData: any[];
}

export default function OverviewTab({ kpiDetails, deptData, trendData }: OverviewTabProps) {
    const statusDistribution = useMemo(() => {
        const dist: Record<string, number> = { 'Xuất sắc': 0, 'Tốt': 0, 'Khá': 0, 'Cần cố gắng': 0 };
        kpiDetails.forEach((k: { status?: string }) => {
            if (k.status && Object.hasOwn(dist, k.status)) dist[k.status]++;
        });
        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    }, [kpiDetails]);

    return (
        <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-500">Điểm hiệu suất trung bình</p>
                                <p className="text-3xl font-bold text-slate-900">0%</p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-400 font-medium">
                            <span>--</span> <span className="text-slate-400 ml-2 font-normal">so với quý trước</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-500">Tổng Mục tiêu (KPIs)</p>
                                <p className="text-3xl font-bold text-slate-900">0</p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Target className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-500">
                            <span>-- Đã hoàn thành / -- Đang xử lý</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-500">Đơn vị Xuất sắc</p>
                                <p className="text-3xl font-bold text-slate-700">--</p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-400 font-medium">
                            <span>--</span> <span className="text-slate-400 ml-2 font-normal">tỷ lệ hoàn thành</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 bg-slate-50/30">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-500">Chỉ số rủi ro cao</p>
                                <p className="text-3xl font-bold text-slate-700">0</p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-slate-500">
                            <span>Đang cập nhật</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Biểu đồ xu hướng hiệu suất (2026)</CardTitle>
                        <CardDescription>Theo dõi biến động điểm KPI trung bình toàn cơ quan.</CardDescription>
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

                <div className="lg:col-span-3 space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Phân bổ chất lượng Mục tiêu</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center gap-4">
                            <div className="h-[180px] w-1/2">
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
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                            {stat.name}
                                        </span>
                                        <span className="font-medium text-slate-900">{stat.value}</span>
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
                            {deptData.map((dept: any) => (
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
        </div>
    );
}