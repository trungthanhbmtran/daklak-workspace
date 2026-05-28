// src/app/executive-kpi/_components/DepartmentsTab.tsx
"use client";
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DepartmentsTabProps {
    kpiDetails: any[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Xuất sắc': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Tốt': return 'bg-green-100 text-green-700 border-green-200';
        case 'Khá': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Cần cố gắng': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function DepartmentsTab({ kpiDetails }: DepartmentsTabProps) {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const filteredKpis = kpiDetails.filter((kpi: any) =>
        kpi.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-xl pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Bảng chi tiết chỉ tiêu theo Đơn vị</CardTitle>
                        <CardDescription>Tìm kiếm, lọc và xuất dữ liệu báo cáo chi tiết từng mục tiêu.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Search placeholder="Tìm tên chỉ số..." className="w-[250px]" />
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
                        {filteredKpis.map((kpi: any) => {
                            const completion = kpi.target ? (kpi.actual / kpi.target) * 100 : 0;
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
    );
}