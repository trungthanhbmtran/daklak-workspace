"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Save, User, Calculator, Plus, Trash2, Banknote, ShieldAlert, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { hrmApi } from "@/features/hrm/api";
import type { HrmEmployee } from "@/features/hrm/types";

export default function CreatePayrollPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // States
  const [employees, setEmployees] = useState<HrmEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  const [info, setInfo] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    standardDays: 22,
    actualDays: 22,
    basicSalary: 15000000,
  });

  const [allowances, setAllowances] = useState([
    { id: 1, name: "Phụ cấp trách nhiệm", amount: 2000000 },
    { id: 2, name: "Phụ cấp ăn trưa", amount: 700000 },
  ]);

  const [deductions, setDeductions] = useState([
    { id: 1, name: "Bảo hiểm Xã hội (8%)", amount: 0, isAuto: true, rate: 0.08 },
    { id: 2, name: "Bảo hiểm Y tế (1.5%)", amount: 0, isAuto: true, rate: 0.015 },
    { id: 3, name: "Bảo hiểm Thất nghiệp (1%)", amount: 0, isAuto: true, rate: 0.01 },
  ]);

  useEffect(() => {
    hrmApi.list({ pageSize: 100 }).then(res => {
      setEmployees(res.data);
      setLoadingEmployees(false);
    }).catch(err => {
      console.error(err);
      toast.error("Lỗi tải danh sách nhân viên");
      setLoadingEmployees(false);
    });
  }, []);

  // Format currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính toán
  const workingSalary = useMemo(() => {
    if (info.standardDays <= 0) return 0;
    return Math.round((info.basicSalary / info.standardDays) * info.actualDays);
  }, [info.basicSalary, info.standardDays, info.actualDays]);

  const totalAllowances = useMemo(() => {
    return allowances.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [allowances]);

  // Update auto deductions when basic salary changes
  useEffect(() => {
    setDeductions(prev => prev.map(d => {
      if (d.isAuto && d.rate) {
        return { ...d, amount: Math.round(info.basicSalary * d.rate) };
      }
      return d;
    }));
  }, [info.basicSalary]);

  const totalDeductions = useMemo(() => {
    return deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [deductions]);

  const netSalary = workingSalary + totalAllowances - totalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.employeeId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Đã khởi tạo bảng lương thành công!");
      router.push("/services/hrm/payroll");
    }, 1200);
  };

  const handleAddAllowance = () => {
    setAllowances([...allowances, { id: Date.now(), name: "Phụ cấp khác", amount: 0 }]);
  };

  const handleRemoveAllowance = (id: number) => {
    setAllowances(allowances.filter(a => a.id !== id));
  };

  const handleAddDeduction = () => {
    setDeductions([...deductions, { id: Date.now(), name: "Khấu trừ khác", amount: 0, isAuto: false, rate: 0 }]);
  };

  const handleRemoveDeduction = (id: number) => {
    setDeductions(deductions.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Tạo mới Bảng Lương</h2>
              <p className="text-sm text-slate-500 font-medium italic mt-1">Lập phiếu lương định kỳ cho nhân viên</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 h-11 font-bold shadow-lg shadow-emerald-200 text-white">
              <Save className="mr-2 h-4 w-4" /> CHỐT BẢNG LƯƠNG
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Cột trái: Nhập liệu */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Box 1: Thông tin cơ bản */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" /> Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-slate-700">Chọn Nhân viên <span className="text-red-500">*</span></Label>
                  <select
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 focus:ring-2 focus:ring-blue-600 outline-none"
                    value={info.employeeId}
                    onChange={e => setInfo({ ...info, employeeId: e.target.value })}
                    required
                    disabled={loadingEmployees}
                  >
                    <option value="">{loadingEmployees ? "Đang tải danh sách..." : "Chọn nhân viên..."}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id.toString()}>
                        {emp.employeeCode} - {emp.firstname} {emp.lastname} {emp.department ? `(${emp.department.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Tháng / Năm</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" min="1" max="12" 
                      value={info.month} 
                      onChange={e => setInfo({...info, month: Number(e.target.value)})}
                      className="text-center"
                    />
                    <span className="text-slate-400 self-center">/</span>
                    <Input 
                      type="number" min="2020" max="2100" 
                      value={info.year} 
                      onChange={e => setInfo({...info, year: Number(e.target.value)})}
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Mức lương cơ bản (Hợp đồng)</Label>
                  <Input 
                    type="number" min="0" step="100000"
                    value={info.basicSalary || ''} 
                    onChange={e => setInfo({...info, basicSalary: Number(e.target.value)})}
                    className="font-bold text-blue-700 bg-blue-50/50"
                  />
                  <p className="text-xs text-slate-500 font-medium">Sẽ dùng làm căn cứ tính Bảo hiểm mặc định (10.5%).</p>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Số ngày công chuẩn (Tháng)</Label>
                  <Input 
                    type="number" min="1" max="31" step="0.5"
                    value={info.standardDays || ''} 
                    onChange={e => setInfo({...info, standardDays: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Số ngày đi làm thực tế</Label>
                  <Input 
                    type="number" min="0" max="31" step="0.5"
                    value={info.actualDays || ''} 
                    onChange={e => setInfo({...info, actualDays: Number(e.target.value)})}
                    className="border-emerald-300 focus:border-emerald-500 bg-emerald-50/30"
                  />
                </div>

              </CardContent>
            </Card>

            {/* Box 2: Phụ cấp */}
            <Card className="rounded-2xl border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-emerald-600" /> Các khoản thu nhập / Phụ cấp
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddAllowance} className="h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  <Plus className="h-4 w-4 mr-1" /> Thêm khoản
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {allowances.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">Chưa có khoản phụ cấp nào</p>
                ) : (
                  allowances.map((al, index) => (
                    <div key={al.id} className="flex flex-col sm:flex-row gap-3 items-center">
                      <Input 
                        placeholder="Tên phụ cấp..." 
                        value={al.name}
                        onChange={e => {
                          const newAl = [...allowances];
                          newAl[index].name = e.target.value;
                          setAllowances(newAl);
                        }}
                        className="flex-1"
                      />
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Input 
                          type="number" min="0" step="1000"
                          value={al.amount || ''}
                          onChange={e => {
                            const newAl = [...allowances];
                            newAl[index].amount = Number(e.target.value);
                            setAllowances(newAl);
                          }}
                          className="w-full sm:w-40 text-right font-semibold text-emerald-700"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAllowance(al.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Box 3: Khấu trừ */}
            <Card className="rounded-2xl border-slate-200 shadow-sm border-t-4 border-t-red-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" /> Các khoản Khấu trừ / Phạt
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDeduction} className="h-8 text-red-700 border-red-200 hover:bg-red-50">
                  <Plus className="h-4 w-4 mr-1" /> Thêm khoản
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {deductions.map((ded, index) => (
                  <div key={ded.id} className="flex flex-col sm:flex-row gap-3 items-center">
                    <Input 
                      placeholder="Tên khoản khấu trừ..." 
                      value={ded.name}
                      onChange={e => {
                        const newDed = [...deductions];
                        newDed[index].name = e.target.value;
                        setDeductions(newDed);
                      }}
                      disabled={ded.isAuto}
                      className={cn("flex-1", ded.isAuto && "bg-slate-100 text-slate-500 font-medium")}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Input 
                        type="number" min="0" step="1000"
                        value={ded.amount || ''}
                        onChange={e => {
                          const newDed = [...deductions];
                          newDed[index].amount = Number(e.target.value);
                          setDeductions(newDed);
                        }}
                        disabled={ded.isAuto}
                        className={cn("w-full sm:w-40 text-right font-semibold text-red-700", ded.isAuto && "bg-slate-100")}
                      />
                      <Button 
                        type="button" variant="ghost" size="icon" 
                        onClick={() => handleRemoveDeduction(ded.id)} 
                        disabled={ded.isAuto}
                        className={cn("text-red-500 hover:text-red-700 hover:bg-red-50", ded.isAuto && "opacity-30 cursor-not-allowed")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-500 font-medium mt-2 italic">* Các khoản Bảo hiểm tự động được trích lập dựa trên Lương cơ bản ở phần Thông tin cơ bản.</p>
              </CardContent>
            </Card>

          </div>

          {/* Cột phải: Hóa đơn Pay Slip */}
          <div className="xl:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-200 shadow-xl shadow-slate-200/50 sticky top-32 overflow-hidden">
              <CardHeader className="bg-slate-900 text-white pb-6 pt-8 text-center relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"></div>
                <Receipt className="h-10 w-10 mx-auto mb-3 opacity-80" />
                <CardTitle className="font-black text-2xl uppercase tracking-wider">Phiếu Lương</CardTitle>
                <p className="text-slate-400 font-medium mt-1">Kỳ tháng {info.month}/{info.year}</p>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Lương công làm việc */}
                <div className="p-6 bg-slate-50/50 space-y-3 border-b border-slate-100 border-dashed">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Lương cơ bản hợp đồng</span>
                    <span className="text-slate-800 font-semibold">{formatVND(info.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Số ngày tính công</span>
                    <span className="text-slate-800 font-semibold">{info.actualDays} / {info.standardDays} ngày</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-700 font-bold">Lương làm việc thực tế</span>
                    <span className="text-blue-700 font-bold text-lg">{formatVND(workingSalary)}</span>
                  </div>
                </div>

                {/* Phụ cấp & Khấu trừ Tổng hợp */}
                <div className="p-6 space-y-4 border-b border-slate-200 border-dashed">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Plus className="w-3 h-3 text-emerald-500" /> Tổng phụ cấp</span>
                    <span className="text-emerald-600 font-bold">{formatVND(totalAllowances)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Trash2 className="w-3 h-3 text-red-500" /> Tổng khấu trừ</span>
                    <span className="text-red-600 font-bold">-{formatVND(totalDeductions)}</span>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="p-6 bg-emerald-50/30">
                  <div className="text-center space-y-1 mb-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">TỔNG THỰC LĨNH</p>
                    <div className={cn("text-4xl md:text-5xl font-black tracking-tighter", netSalary < 0 ? "text-red-600" : "text-emerald-600")}>
                      {formatVND(netSalary)}
                    </div>
                    <p className="text-slate-400 text-xs font-medium italic">(Net Salary)</p>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full h-12 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                    XÁC NHẬN BẢNG LƯƠNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
