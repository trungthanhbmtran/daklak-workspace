'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export const TaskListClient = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks placeholder
    fetch('/api/admin/hrm/tasks')
      .then(res => res.json())
      .then(data => {
        if (data.tasks) {
          setTasks(data.tasks);
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
          <h1 className="text-3xl font-bold tracking-tight">Giao việc</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi tiến độ công việc</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Giao việc mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hạn chót</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Chưa có công việc nào</TableCell>
                </TableRow>
              ) : (
                tasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full" title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full" title="Chỉnh sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
