"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Target, Users, Scale, FileSignature, Save, X } from "lucide-react";
import { hrmApi, hrmObjectivesApi } from "@/features/hrm/api";
import type { BscPerspective, HrmEmployee } from "@/features/hrm/types";

interface PlanTaskAssignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  perspective: BscPerspective;
  onSuccess: () => void;
}

const PERSPECTIVE_LABELS: Record<BscPerspective, string> = {
  FINANCIAL: "Tài chính",
  CUSTOMER: "Khách hàng",
  INTERNAL_PROCESS: "Quy trình nội bộ",
  LEARNING_GROWTH: "Học hỏi & Phát triển",
};

export const PlanTaskAssignDrawer = ({ isOpen, onClose, planId, perspective, onSuccess }: PlanTaskAssignDrawerProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<HrmEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    metric: "",
    target: "",
    weight: 10,
    assigneeId: "",
    startDate: "",
    dueDate: "",
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingEmployees(true);
      hrmApi.list({ pageSize: 100 }).then(res => {
        setEmployees(res.data);
        setLoadingEmployees(false);
      }).catch(err => {
        console.error(err);
        setLoadingEmployees(false);
      });
    } else {
      // Reset form
      setFormData({
        title: "", description: "", metric: "", target: "", weight: 10, assigneeId: "", startDate: "", dueDate: ""
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assigneeId || !formData.metric || !formData.target) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setSubmitting(true);
    try {
      await hrmObjectivesApi.create({
        planId,
        perspective,
        ...formData,
        assigneeId: Number(formData.assigneeId),
      });
      toast.success("Đã giao việc & thiết lập mục tiêu thành công!");
      onSuccess();
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo mục tiêu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto bg-slate-50 border-l-0 p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase">
                  {PERSPECTIVE_LABELS[perspective]}
                </span>
              </div>
              <SheetTitle className="text-xl font-black text-slate-800">Giao việc & Thiết lập KPI</SheetTitle>
              <SheetDescription className="text-slate-500 mt-1">
                Chi tiết mục tiêu, chỉ số đo lường và người thực hiện.
              </SheetDescription>
            </div>
            {/* Close button provided by SheetContent internally, but we can rely on onOpenChange */}
          </div>

          <div className="p-6 space-y-6 flex-1">
            {/* Basic Info */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                <FileSignature className="w-4 h-4 text-blue-500" /> Thông tin cơ sở
              </h3>
              
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Tên Mục tiêu / Công việc <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="VD: Tối ưu chi phí vận hành..." 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="h-11 bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Mô tả chi tiết</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Diễn giải thêm..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* KPI Settings */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                <Target className="w-4 h-4 text-emerald-500" /> Thiết lập KPI+
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Chỉ số đo lường (Metric) <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="VD: Tỷ lệ % / Doanh thu..." 
                    value={formData.metric} 
                    onChange={e => setFormData({ ...formData, metric: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Chỉ tiêu (Target) <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="VD: > 15%" 
                    value={formData.target} 
                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                    className="h-11 border-emerald-300 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-400" /> Trọng số (Weight %)
                </Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" max="100" 
                    value={formData.weight} 
                    onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="flex-1 accent-indigo-600"
                  />
                  <div className="w-16 h-10 flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100">
                    {formData.weight}%
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                <Users className="w-4 h-4 text-amber-500" /> Phân công & Tiến độ
              </h3>
              
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Người thực hiện chính <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.assigneeId}
                  onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                  disabled={loadingEmployees}
                >
                  <option value="">{loadingEmployees ? "Đang tải..." : "Chọn nhân sự..."}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id.toString()}>{emp.firstname} {emp.lastname} - {emp.department?.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Ngày bắt đầu</Label>
                  <Input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-11 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Deadline</Label>
                  <Input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-11 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold h-11 px-6">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl font-bold h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
              <Save className="w-4 h-4 mr-2" /> GIAO VIỆC
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
