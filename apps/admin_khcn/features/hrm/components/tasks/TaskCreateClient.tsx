"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, AlertTriangle, Info, PlusCircle, LayoutDashboard, Target } from 'lucide-react';

export function TaskCreateClient() {
  const [assignee, setAssignee] = useState('');
  const [taskWeight, setTaskWeight] = useState(20);
  const [taskName, setTaskName] = useState('');
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Mock nhân sự để minh họa logic Ngạch
  const employees = [
    { code: 'NV01', name: 'Nguyễn Văn A', rank: 'CHUYEN_VIEN_CAO_CAP', rankLimit: 100, currentLoad: 50 },
    { code: 'NV02', name: 'Trần Thị B', rank: 'CHUYEN_VIEN', rankLimit: 60, currentLoad: 55 },
  ];

  const selectedEmp = employees.find(e => e.code === assignee);
  
  React.useEffect(() => {
    if (selectedEmp?.rank) {
      fetch(`/api/admin/hrm/task-templates?rank=${selectedEmp.rank}`)
        .then(res => res.json())
        .then(data => setTemplates(data?.data?.templates || []))
        .catch(console.error);
    } else {
      setTemplates([]);
    }
  }, [selectedEmp]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = templates.find(x => x.id === Number(templateId));
    if (t) setTaskName(t.taskName);
  };

  // Tính load cũ (hiện bỏ logic headcount vì đây là giao việc cụ thể)
  // Nhưng vẫn giữ minh họa Workload = số lượng task đang làm (vd: mockLimit)
  const newLoad = selectedEmp ? selectedEmp.currentLoad + taskWeight : 0;
  const isOverload = selectedEmp ? newLoad > selectedEmp.rankLimit : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverload) {
      toast.error('Cảnh báo: Khối lượng công việc vượt quá định mức ngạch của nhân sự!');
    } else {
      toast.success('Giao việc thành công!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-8 h-8 text-indigo-600" />
          Giao Việc Mới
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Thông tin Công việc</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên công việc</label>
                  <Input 
                    placeholder="Nhập tên công việc hoặc chọn từ định biên bên dưới..." 
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Hạn chót</label>
                    <Input type="date" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mức độ ưu tiên</label>
                    <Select defaultValue="MEDIUM">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">Cao</SelectItem>
                        <SelectItem value="MEDIUM">Trung bình</SelectItem>
                        <SelectItem value="LOW">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black uppercase text-indigo-600 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Cấu hình KPI & Trọng số
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Trọng số KPI (%)</label>
                      <Input type="number" min="1" value={taskWeight} onChange={e => setTaskWeight(Number(e.target.value))} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Điểm cơ bản (Base Score)</label>
                      <Input type="number" defaultValue={10} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Thưởng vượt tiến độ / Ngày</label>
                      <Input type="number" defaultValue={0} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Phạt trễ hạn / Ngày</label>
                      <Input type="number" defaultValue={0} />
                    </div>
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="shadow-sm border-indigo-100">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <CardTitle className="text-sm font-bold text-indigo-900">Phân công theo Ngạch</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Chọn người thực hiện</label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Chọn nhân sự..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.code} value={emp.code}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEmp && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Ngạch hiện tại:</span>
                    <Badge variant="outline" className="font-mono">{selectedEmp.rank}</Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="text-xs font-bold text-indigo-700 flex items-center gap-2">
                      <Target className="w-3 h-3" /> Chọn Công việc Định biên
                    </label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue placeholder="--- Tùy chọn nhập tay ---" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()} className="text-xs">
                            {t.taskName} ({t.defaultUnit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Khối lượng (Workload)</span>
                      <span className={isOverload ? 'text-red-600' : 'text-indigo-600'}>
                        {newLoad} / {selectedEmp.rankLimit}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isOverload ? 'bg-red-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${Math.min((newLoad / selectedEmp.rankLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {isOverload && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-xs mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="font-medium">Nhân sự này đã đạt giới hạn định mức công việc của ngạch. Việc giao thêm có thể gây quá tải.</span>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" form="taskForm" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                <Save className="w-4 h-4 mr-2" />
                Giao việc ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
