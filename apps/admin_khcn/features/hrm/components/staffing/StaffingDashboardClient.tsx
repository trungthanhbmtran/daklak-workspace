"use client";

import React, { useState } from 'react';
import { Users, Building2, Save, Plus, Target, Settings2, BarChart2, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function StaffingDashboardClient() {
  const [selectedUnit, setSelectedUnit] = useState('dept-1');

  // Dữ liệu mock cấu hình định biên
  const [staffing, setStaffing] = useState([
    { id: 1, unitId: 'dept-1', jobTitle: 'Chuyên viên Cao cấp', rank: 'CHUYEN_VIEN_CAO_CAP', limit: 2, current: 2 },
    { id: 2, unitId: 'dept-1', jobTitle: 'Chuyên viên Chính', rank: 'CHUYEN_VIEN_CHINH', limit: 5, current: 3 },
    { id: 3, unitId: 'dept-1', jobTitle: 'Chuyên viên', rank: 'CHUYEN_VIEN', limit: 10, current: 10 },
    { id: 4, unitId: 'dept-2', jobTitle: 'Cán bộ Kỹ thuật', rank: 'CAN_BO_SU_NGHIEP', limit: 8, current: 5 },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newRank, setNewRank] = useState('CHUYEN_VIEN');
  const [newLimit, setNewLimit] = useState(1);

  const units = [
    { id: 'dept-1', name: 'Văn phòng Sở' },
    { id: 'dept-2', name: 'Trung tâm Giám sát Điều hành (IOC)' },
    { id: 'dept-3', name: 'Thanh tra Sở' }
  ];

  const currentUnitStaffing = staffing.filter(s => s.unitId === selectedUnit);

  const handleAddStaffing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newStaff = {
      id: Date.now(),
      unitId: selectedUnit,
      jobTitle: newTitle,
      rank: newRank,
      limit: Number(newLimit),
      current: 0
    };
    setStaffing([...staffing, newStaff]);
    setNewTitle('');
    toast.success('Đã thêm cấu hình định biên mới');
  };

  const totalLimit = currentUnitStaffing.reduce((sum, s) => sum + s.limit, 0);
  const totalCurrent = currentUnitStaffing.reduce((sum, s) => sum + s.current, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Bảng Điều Khiển Định Biên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý giới hạn nhân sự và cấu trúc ngạch bậc cho từng phòng ban (Staffing Configuration)
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full md:w-[250px] bg-slate-50 font-medium">
              <Building2 className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {units.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Tổng định mức</p>
                <p className="text-3xl font-black text-indigo-700">{totalLimit}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Nhân sự hiện tại</p>
                <p className="text-3xl font-black text-emerald-600">{totalCurrent}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Trạng thái phòng ban</p>
                <Badge variant="outline" className={`mt-1 font-bold ${totalCurrent >= totalLimit ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                  {totalCurrent >= totalLimit ? 'FULL ĐỊNH BIÊN' : 'CÒN CHỈ TIÊU'}
                </Badge>
              </div>
              <div className="bg-slate-100 p-3 rounded-xl">
                <BarChart2 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <Card className="xl:col-span-8 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-700" /> Cấu trúc định biên: {units.find(u => u.id === selectedUnit)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Chức danh / Vị trí</th>
                    <th className="px-6 py-4">Phân hạng Ngạch</th>
                    <th className="px-6 py-4 text-center">Định mức tối đa</th>
                    <th className="px-6 py-4 text-center">Hiện tại</th>
                    <th className="px-6 py-4 text-center">Tình trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentUnitStaffing.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.jobTitle}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono bg-slate-50 text-[10px]">
                          {item.rank}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{item.limit}</td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600">{item.current}</td>
                      <td className="px-6 py-4 text-center">
                        {item.current >= item.limit ? (
                          <span className="text-red-500 font-bold text-xs">Đủ chỉ tiêu</span>
                        ) : (
                          <span className="text-emerald-500 font-bold text-xs">Trống {item.limit - item.current}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {currentUnitStaffing.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-500">Chưa có cấu hình định biên cho đơn vị này</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Bổ sung chỉ tiêu mới
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddStaffing} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Tên vị trí / Chức danh</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="VD: Chuyên viên pháp chế..." className="h-10 border-slate-200 font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Phân loại ngạch</label>
                <Select value={newRank} onValueChange={setNewRank}>
                  <SelectTrigger className="h-10 border-slate-200 bg-white font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHUYEN_VIEN_CAO_CAP">Chuyên viên Cao cấp</SelectItem>
                    <SelectItem value="CHUYEN_VIEN_CHINH">Chuyên viên Chính</SelectItem>
                    <SelectItem value="CHUYEN_VIEN">Chuyên viên</SelectItem>
                    <SelectItem value="CAN_BO_SU_NGHIEP">Cán bộ Kỹ thuật / Sự nghiệp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Số lượng chỉ tiêu tối đa</label>
                <Input type="number" min="1" value={newLimit} onChange={e => setNewLimit(Number(e.target.value))} required className="h-10 border-slate-200 font-bold" />
              </div>
              <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 font-bold text-white shadow-sm mt-2">
                <Save className="w-4 h-4 mr-2" /> Lưu Cấu Hình
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
