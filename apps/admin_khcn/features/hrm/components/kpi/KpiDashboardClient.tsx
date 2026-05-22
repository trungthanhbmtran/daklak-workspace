'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';

export const KpiDashboardClient = () => {
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    // Fetch KPI evaluations placeholder
    fetch('/api/admin/hrm/kpis/evaluations')
      .then(res => res.json())
      .then(data => {
        if (data.evaluations) {
          setEvaluations(data.evaluations);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đánh giá KPI</h1>
          <p className="text-muted-foreground">Quản lý và đánh giá hiệu suất nhân viên</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tạo kỳ đánh giá
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kỳ đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Điểm số</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Chưa có phiếu đánh giá nào</TableCell>
                </TableRow>
              ) : (
                evaluations.map((ev: any) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">{ev.period?.name}</TableCell>
                    <TableCell>{ev.status}</TableCell>
                    <TableCell>{ev.totalScore || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Chi tiết</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
