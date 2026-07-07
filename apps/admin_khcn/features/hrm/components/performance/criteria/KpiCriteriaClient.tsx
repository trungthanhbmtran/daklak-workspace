"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Settings2, Edit, Trash2, Library, Info, Activity, Target, Calculator } from "lucide-react";
import { useKpiCriteriaList, useCreateKpiCriterion, useUpdateKpiCriterion, useDeleteKpiCriterion } from "@/features/hrm/hooks/useKpis";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";

export function KpiCriteriaClient() {
  const { data: criteriaList = [], isLoading } = useKpiCriteriaList();
  const createMutation = useCreateKpiCriterion();
  const updateMutation = useUpdateKpiCriterion();
  const deleteMutation = useDeleteKpiCriterion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: 10,
    baseScore: 100,
    scoringMethod: "MANUAL",
    difficulty: "NORMAL",
    difficultyMultiplier: 1.0,
    bonusThresholdDays: 0,
    bonusPerDay: 0,
    penaltyPerDay: 0,
    integrationCode: "",
    formula: "",
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        description: item.description || "",
        weight: item.weight || 10,
        baseScore: item.baseScore || 100,
        scoringMethod: item.scoringMethod || "MANUAL",
        difficulty: item.difficulty || "NORMAL",
        difficultyMultiplier: item.difficultyMultiplier || 1.0,
        bonusThresholdDays: item.bonusThresholdDays || 0,
        bonusPerDay: item.bonusPerDay || 0,
        penaltyPerDay: item.penaltyPerDay || 0,
        integrationCode: item.integrationCode || "",
        formula: item.formula || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        weight: 10,
        baseScore: 100,
        scoringMethod: "MANUAL",
        difficulty: "NORMAL",
        difficultyMultiplier: 1.0,
        bonusThresholdDays: 0,
        bonusPerDay: 0,
        penaltyPerDay: 0,
        integrationCode: "",
        formula: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên tiêu chí");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: formData });
        toast.success("Cập nhật tiêu chí thành công");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Tạo tiêu chí mới thành công");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi lưu");
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete);
      toast.success("Đã xóa tiêu chí");
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 p-4 md:p-8">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-[2rem] p-8 md:p-14 shadow-2xl text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transition-transform duration-1000 hover:rotate-12 hover:scale-110">
          <Library className="w-64 h-64" />
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-inner">
              <Activity className="w-4 h-4 text-indigo-300" />
              <span className="text-xs font-bold tracking-wider text-indigo-200 uppercase">Khung Đánh Giá</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              Tiêu chí & KPI
            </h1>
            <p className="text-indigo-100/80 font-medium mt-4 max-w-2xl text-lg leading-relaxed">
              Quản lý tập trung các bộ tiêu chí đánh giá KPI để áp dụng thống nhất cho toàn bộ hệ thống, giúp nâng cao hiệu suất và minh bạch.
            </p>
          </div>
          <Button onClick={() => openModal()} className="h-14 bg-white text-indigo-900 hover:bg-indigo-50 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] px-8 font-extrabold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(255,255,255,0.3)] active:scale-95">
            <Plus className="w-6 h-6 mr-2" /> Tạo Tiêu chí mới
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-24">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {criteriaList.map((item: any) => (
            <div key={item.id} className="group bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(79,70,229,0.1)] border border-slate-100 hover:border-indigo-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden flex flex-col">
              {/* Card Header Background Decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-125"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:rotate-3">
                  <Target className="w-7 h-7" />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-sm border border-slate-100">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" onClick={() => openModal(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description || "Chưa có mô tả chi tiết."}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">Phương pháp</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
                    {item.scoringMethod === 'MANUAL' ? 'Thủ công' : item.scoringMethod === 'INTEGRATION_API' ? 'LGSP/API' : 'Tự động'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">Độ khó</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border ${
                    item.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    item.difficulty === 'NORMAL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    item.difficulty === 'HARD' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.difficulty === 'EASY' ? 'Dễ' : item.difficulty === 'NORMAL' ? 'Vừa' : item.difficulty === 'HARD' ? 'Khó' : 'Rất Khó'} <span className="opacity-60 ml-1">(x{item.difficultyMultiplier})</span>
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 flex items-center justify-between border border-slate-100 group-hover:border-indigo-100 transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm chuẩn</p>
                  <p className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.baseScore}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {item.bonusPerDay > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      +{item.bonusPerDay}đ / ngày
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Không thưởng</span>
                  )}
                  {item.penaltyPerDay > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      -{item.penaltyPerDay}đ / ngày
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Không phạt</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {criteriaList.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-6">
                <Library className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Chưa có tiêu chí nào</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Hệ thống chưa có bộ tiêu chí đánh giá nào được thiết lập. Hãy tạo tiêu chí đầu tiên để bắt đầu áp dụng cho nhân sự.</p>
              <Button onClick={() => openModal()} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 px-8 font-bold">
                <Plus className="w-5 h-5 mr-2" /> Tạo Tiêu chí
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODAL TẠO / SỬA TIÊU CHÍ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50/95 backdrop-blur-xl rounded-[2rem] border-slate-200/60 shadow-2xl">
          <DialogHeader className="p-8 bg-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -mr-16 -mt-16"></div>
            <DialogTitle className="text-2xl font-black flex items-center gap-3 text-slate-800 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Settings2 className="w-6 h-6" />
              </div>
              {editingId ? "Cập nhật Khung tiêu chí" : "Thiết lập Tiêu chí mới"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              <Label className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Tên tiêu chí / Khung đánh giá <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="VD: Thái độ làm việc, Chất lượng dịch vụ..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 bg-white rounded-2xl font-semibold text-lg border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Trọng số mặc định (%)
                </Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="h-12 bg-slate-50 rounded-xl font-bold text-lg focus:bg-white"
                />
              </div>
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <Label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Điểm chuẩn (Base)
                </Label>
                <Input
                  type="number"
                  value={formData.baseScore}
                  onChange={(e) => setFormData({ ...formData, baseScore: Number(e.target.value) })}
                  className="h-12 bg-slate-50 rounded-xl font-bold text-lg focus:bg-white text-indigo-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Độ khó (Difficulty)</Label>
                <Select value={formData.difficulty} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
                  <SelectTrigger className="h-12 bg-white rounded-xl font-bold text-slate-700 shadow-sm border-slate-200">
                    <SelectValue placeholder="Mức độ" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="EASY">Cơ bản / Dễ</SelectItem>
                    <SelectItem value="NORMAL">Bình thường</SelectItem>
                    <SelectItem value="HARD">Nâng cao / Khó</SelectItem>
                    <SelectItem value="COMPLEX">Phức tạp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Hệ số độ khó</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.difficultyMultiplier}
                  onChange={(e) => setFormData({ ...formData, difficultyMultiplier: Number(e.target.value) })}
                  className="h-12 bg-white rounded-xl font-bold shadow-sm border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Mô hình tính điểm</Label>
              <Select value={formData.scoringMethod} onValueChange={(val) => setFormData({ ...formData, scoringMethod: val })}>
                <SelectTrigger className="h-14 bg-white rounded-2xl font-bold text-slate-700 shadow-sm border-slate-200">
                  <SelectValue placeholder="Chọn phương pháp" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-medium">
                  <SelectItem value="MANUAL">Đánh giá thủ công (Bởi Giám sát viên)</SelectItem>
                  <SelectItem value="AUTOMATIC">Tính điểm tự động từ tiến độ (Máy tính)</SelectItem>
                  <SelectItem value="INTEGRATION_API">Kết nối dữ liệu liên thông (API, LGSP...)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.scoringMethod === 'INTEGRATION_API' && (
              <div className="grid grid-cols-2 gap-6 p-6 bg-indigo-50/80 rounded-2xl border border-indigo-100 shadow-inner">
                <div className="space-y-2">
                  <Label className="font-extrabold text-indigo-900 text-sm">Mã kết nối (Integration Code)</Label>
                  <Input
                    placeholder="VD: LGSP_HO_SO_01"
                    value={formData.integrationCode}
                    onChange={(e) => setFormData({ ...formData, integrationCode: e.target.value })}
                    className="h-12 bg-white rounded-xl border-indigo-200 focus:border-indigo-500 shadow-sm font-mono text-sm"
                  />
                  <p className="text-[11px] text-indigo-500/80 font-medium">Mã cấu hình Endpoint bên module Integration</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-extrabold text-indigo-900 text-sm">Công thức tính điểm (Formula)</Label>
                  <Input
                    placeholder="(actual / target) * weight"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="h-12 bg-white rounded-xl border-indigo-200 focus:border-indigo-500 shadow-sm font-mono text-sm"
                  />
                  <p className="text-[11px] text-indigo-500/80 font-medium">Biến khả dụng: actual, target, weight, baseScore</p>
                </div>
              </div>
            )}

            <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200/60 shadow-inner">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-500" /> Quy định Thưởng / Phạt tiến độ
              </h4>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hoàn thành sớm</Label>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all shadow-sm">
                    <Input type="number" value={formData.bonusThresholdDays} onChange={(e) => setFormData({ ...formData, bonusThresholdDays: Number(e.target.value) })} className="h-10 border-0 shadow-none focus-visible:ring-0 font-bold px-3" />
                    <span className="text-xs text-slate-400 font-bold pr-3">ngày</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Thưởng/ngày</Label>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 transition-all shadow-sm">
                    <span className="text-emerald-500 font-black pl-3">+</span>
                    <Input type="number" value={formData.bonusPerDay} onChange={(e) => setFormData({ ...formData, bonusPerDay: Number(e.target.value) })} className="h-10 border-0 shadow-none focus-visible:ring-0 text-emerald-700 font-bold px-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Phạt/ngày trễ</Label>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-400 transition-all shadow-sm">
                    <span className="text-rose-500 font-black pl-3">-</span>
                    <Input type="number" value={formData.penaltyPerDay} onChange={(e) => setFormData({ ...formData, penaltyPerDay: Number(e.target.value) })} className="h-10 border-0 shadow-none focus-visible:ring-0 text-rose-700 font-bold px-2" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Hướng dẫn chấm điểm</Label>
              <div className="relative">
                <Textarea
                  placeholder="Nhập hướng dẫn chi tiết cho giám sát viên (VD: 100đ = Hoàn thành xuất sắc, 50đ = Cần cố gắng)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[140px] bg-white rounded-2xl resize-none p-5 pb-10 leading-relaxed border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm text-sm"
                />
                <Info className="absolute bottom-4 right-4 w-5 h-5 text-slate-300" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Gợi ý: Cung cấp barem điểm rõ ràng sẽ giúp việc đánh giá khách quan và minh bạch hơn.
              </p>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-slate-100/50 border-t border-slate-200/60">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 border-slate-300 text-slate-600 font-bold hover:bg-slate-200/50 transition-colors px-6">
              Hủy bỏ
            </Button>
            <Button onClick={handleSave} className="rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 px-10 font-extrabold text-sm transition-all hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:scale-95">
              Lưu Cấu Hình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa tiêu chí KPI"
        description="Bạn có chắc chắn muốn xóa tiêu chí đánh giá này? Dữ liệu đã xóa không thể khôi phục."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
