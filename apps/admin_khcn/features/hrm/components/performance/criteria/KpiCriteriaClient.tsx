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
import { Plus, Settings2, Edit, Trash2, Library, Info, Activity, Calculator } from "lucide-react";
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

  // react-query automatically fetches data on mount

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
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Library className="w-8 h-8 text-indigo-600" />
            Khung Tiêu chí & Công thức tính điểm
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Quản lý tập trung các bộ tiêu chí đánh giá KPI để áp dụng thống nhất cho toàn bộ hệ thống.
          </p>
        </div>
        <Button onClick={() => openModal()} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 px-6">
          <Plus className="w-5 h-5 mr-2" /> Tạo Tiêu chí mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Activity className="animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {criteriaList.map((item: any) => (
            <Card key={item.id} className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2" title={item.name}>{item.name}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 bg-indigo-50/0 hover:bg-indigo-50 rounded-lg" onClick={() => openModal(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 bg-rose-50/0 hover:bg-rose-50 rounded-lg" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Settings2 className="w-4 h-4 text-emerald-500" />
                    <span>Phương pháp: <strong className="text-slate-800">{item.scoringMethod === 'MANUAL' ? 'Đánh giá thủ công' : item.scoringMethod === 'INTEGRATION_API' ? 'Kết nối liên thông (LGSP/API)' : 'Tính điểm tự động (Máy tính)'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    <span>Điểm: <strong className="text-slate-800">{item.baseScore}</strong> | Độ khó: <strong className="text-slate-800">{item.difficulty === 'EASY' ? 'Dễ (x' + item.difficultyMultiplier + ')' : item.difficulty === 'NORMAL' ? 'Bình thường (x' + item.difficultyMultiplier + ')' : item.difficulty === 'HARD' ? 'Khó (x' + item.difficultyMultiplier + ')' : 'Phức tạp (x' + item.difficultyMultiplier + ')'}</strong></span>
                  </div>
                  {(item.bonusPerDay > 0 || item.penaltyPerDay > 0) && (
                    <div className="bg-slate-100 rounded-lg p-2 flex gap-4 text-xs font-medium">
                      {item.bonusPerDay > 0 && <span className="text-emerald-600">Thưởng: +{item.bonusPerDay}đ/ngày (Trước {item.bonusThresholdDays} ngày)</span>}
                      {item.penaltyPerDay > 0 && <span className="text-rose-600">Phạt: -{item.penaltyPerDay}đ/ngày trễ</span>}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    <Info className="w-4 h-4 inline-block mr-1 -mt-0.5 text-indigo-400" />
                    {item.description || "Chưa có mô tả hướng dẫn."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL TẠO / SỬA TIÊU CHÍ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-slate-50 rounded-2xl">
          <DialogHeader className="p-6 bg-white border-b border-slate-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Settings2 className="w-6 h-6 text-indigo-600" />
              {editingId ? "Cập nhật Khung tiêu chí" : "Tạo Khung tiêu chí mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Tên tiêu chí / Khung đánh giá <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="VD: Thái độ làm việc, Chất lượng dịch vụ..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 bg-white rounded-xl font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Trọng số mặc định (%)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="h-12 bg-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Điểm chuẩn (Base Score)</Label>
                <Input
                  type="number"
                  value={formData.baseScore}
                  onChange={(e) => setFormData({ ...formData, baseScore: Number(e.target.value) })}
                  className="h-12 bg-white rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Độ khó (Difficulty)</Label>
                <Select value={formData.difficulty} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
                  <SelectTrigger className="h-12 bg-white rounded-xl font-medium">
                    <SelectValue placeholder="Mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Cơ bản / Dễ</SelectItem>
                    <SelectItem value="NORMAL">Bình thường</SelectItem>
                    <SelectItem value="HARD">Nâng cao / Khó</SelectItem>
                    <SelectItem value="COMPLEX">Phức tạp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Hệ số độ khó</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.difficultyMultiplier}
                  onChange={(e) => setFormData({ ...formData, difficultyMultiplier: Number(e.target.value) })}
                  className="h-12 bg-white rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Mô hình tính điểm</Label>
              <Select value={formData.scoringMethod} onValueChange={(val) => setFormData({ ...formData, scoringMethod: val })}>
                <SelectTrigger className="h-12 bg-white rounded-xl font-medium">
                  <SelectValue placeholder="Chọn phương pháp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Đánh giá thủ công (Bởi Giám sát viên)</SelectItem>
                  <SelectItem value="AUTOMATIC">Tính điểm tự động từ tiến độ (Máy tính)</SelectItem>
                  <SelectItem value="INTEGRATION_API">Kết nối dữ liệu liên thông (API, LGSP...)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.scoringMethod === 'INTEGRATION_API' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="space-y-2">
                  <Label className="font-bold text-indigo-700">Mã kết nối (Integration Code)</Label>
                  <Input
                    placeholder="VD: LGSP_HO_SO_01"
                    value={formData.integrationCode}
                    onChange={(e) => setFormData({ ...formData, integrationCode: e.target.value })}
                    className="h-10 bg-white"
                  />
                  <p className="text-[10px] text-slate-500">Mã cấu hình Endpoint bên module Integration</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-indigo-700">Công thức tính điểm (Formula)</Label>
                  <Input
                    placeholder="(actual / target) * weight"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="h-10 bg-white"
                  />
                  <p className="text-[10px] text-slate-500">Biến khả dụng: actual, target, weight, baseScore</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase">Hoàn thành sớm</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={formData.bonusThresholdDays} onChange={(e) => setFormData({ ...formData, bonusThresholdDays: Number(e.target.value) })} className="h-10 bg-white" />
                  <span className="text-xs text-slate-500 font-medium">ngày</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-emerald-700 uppercase">Điểm thưởng/ngày</Label>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">+</span>
                  <Input type="number" value={formData.bonusPerDay} onChange={(e) => setFormData({ ...formData, bonusPerDay: Number(e.target.value) })} className="h-10 bg-white text-emerald-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-rose-700 uppercase">Điểm phạt/ngày trễ</Label>
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">-</span>
                  <Input type="number" value={formData.penaltyPerDay} onChange={(e) => setFormData({ ...formData, penaltyPerDay: Number(e.target.value) })} className="h-10 bg-white text-rose-700" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Mô tả chi tiết / Hướng dẫn chấm điểm</Label>
              <div className="relative">
                <Textarea
                  placeholder="Nhập hướng dẫn để chuyên viên đánh giá biết cách cho điểm (VD: 100đ = Hoàn thành xuất sắc, 50đ = Cần cố gắng)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] bg-white rounded-xl resize-none p-4 pb-8 leading-relaxed"
                />
                <Info className="absolute bottom-3 right-3 w-4 h-4 text-slate-300" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Gợi ý: Cung cấp barem điểm rõ ràng sẽ giúp việc đánh giá khách quan và minh bạch hơn.
              </p>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-11 border-slate-300 text-slate-600 font-bold">
              Hủy bỏ
            </Button>
            <Button onClick={handleSave} className="rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 px-8 font-bold">
              Lưu cấu hình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa tiêu chí KPI"
        description="Bạn có chắc chắn muốn xóa tiêu chí đánh giá này? Hành động này không thể hoàn tác."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
