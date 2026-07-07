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
import { Plus, Edit, Trash2, Library, ChevronLeft, ChevronRight } from "lucide-react";
import { useKpiCriteriaListPaginated, useCreateKpiCriterion, useUpdateKpiCriterion, useDeleteKpiCriterion } from "@/features/hrm/hooks/useKpis";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";

export function KpiCriteriaClient() {
  const [page, setPage] = useState(1);
  const limit = 3;

  const { data: response, isLoading } = useKpiCriteriaListPaginated({ page, limit });
  const criteriaList = response?.data || [];
  const meta: any = response?.meta?.pagination;

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

  const handleNextPage = () => {
    if (meta?.hasNext) setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (meta?.hasPrev) setPage(p => p - 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Library className="w-6 h-6 text-slate-600" />
            Khung Tiêu chí & KPI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tập trung các bộ tiêu chí đánh giá KPI để áp dụng thống nhất cho toàn bộ hệ thống.
          </p>
        </div>
        <Button onClick={() => openModal()} className="h-10 px-4">
          <Plus className="w-4 h-4 mr-2" /> Tạo Tiêu chí
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criteriaList.map((item: any) => (
              <Card key={item.id} className="shadow-none border border-slate-200 hover:border-slate-300 transition-colors">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 leading-snug flex-1 mr-3">
                      {item.name}
                    </h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => openModal(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                    {item.description || "Chưa có mô tả."}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Điểm chuẩn:</span>
                      <span className="font-medium text-slate-900">{item.baseScore}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Độ khó:</span>
                      <span className="font-medium text-slate-900">
                        {item.difficulty} (x{item.difficultyMultiplier})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Phương pháp:</span>
                      <span className="font-medium text-slate-900 text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">
                        {item.scoringMethod}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {criteriaList.length === 0 && (
            <div className="text-center py-16 border rounded-lg bg-slate-50/50">
              <p className="text-slate-500">Chưa có tiêu chí nào.</p>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-slate-500">
              Tổng số bản ghi: <span className="font-medium text-slate-900">{meta?.total || 0}</span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={handlePrevPage}
                disabled={!meta?.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 font-medium text-slate-700">
                Trang {meta?.page || 1} / {meta?.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={handleNextPage}
                disabled={!meta?.hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO / SỬA TIÊU CHÍ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              {editingId ? "Cập nhật Tiêu chí" : "Tạo Tiêu chí mới"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Tên tiêu chí <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trọng số (%)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label>Điểm chuẩn (Base)</Label>
                <Input
                  type="number"
                  value={formData.baseScore}
                  onChange={(e) => setFormData({ ...formData, baseScore: Number(e.target.value) })}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select value={formData.difficulty} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
                  <SelectTrigger className="rounded-md">
                    <SelectValue />
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
                <Label>Hệ số độ khó</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.difficultyMultiplier}
                  onChange={(e) => setFormData({ ...formData, difficultyMultiplier: Number(e.target.value) })}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô hình tính điểm</Label>
              <Select value={formData.scoringMethod} onValueChange={(val) => setFormData({ ...formData, scoringMethod: val })}>
                <SelectTrigger className="rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Đánh giá thủ công</SelectItem>
                  <SelectItem value="AUTOMATIC">Tính tự động</SelectItem>
                  <SelectItem value="INTEGRATION_API">Kết nối API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Số ngày sớm</Label>
                <Input type="number" value={formData.bonusThresholdDays} onChange={(e) => setFormData({ ...formData, bonusThresholdDays: Number(e.target.value) })} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Thưởng/ngày</Label>
                <Input type="number" value={formData.bonusPerDay} onChange={(e) => setFormData({ ...formData, bonusPerDay: Number(e.target.value) })} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Phạt/ngày trễ</Label>
                <Input type="number" value={formData.penaltyPerDay} onChange={(e) => setFormData({ ...formData, penaltyPerDay: Number(e.target.value) })} className="h-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả chi tiết</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="resize-none h-24 rounded-md"
              />
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-slate-50">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
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
        description="Bạn có chắc chắn muốn xóa tiêu chí đánh giá này? Dữ liệu đã xóa không thể khôi phục."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
