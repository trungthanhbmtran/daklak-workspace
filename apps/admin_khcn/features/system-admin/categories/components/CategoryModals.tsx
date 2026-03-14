import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CategoryItem } from "../types";
import { GROUP_LABELS } from "../constants";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategoryApi";

// --- MODAL THÊM MỚI ---
export function CreateCategoryModal({ isOpen, onClose, activeGroup, defaultSort }: { isOpen: boolean; onClose: () => void; activeGroup: string; defaultSort: number; }) {
  const [form, setForm] = useState({ code: "", name: "", sort: 0 });
  const createMutation = useCreateCategory();

  useEffect(() => {
    if (isOpen) setForm({ code: "", name: "", sort: defaultSort });
  }, [isOpen, defaultSort]);

  const handleSubmit = () => {
    if (!form.code.trim() || !form.name.trim()) return toast.error("Vui lòng nhập mã và tên.");
    createMutation.mutate(
      { group: activeGroup, code: form.code.trim().toUpperCase(), name: form.name.trim(), order: form.sort || 0 },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm giá trị: {GROUP_LABELS[activeGroup] || activeGroup}</DialogTitle>
          <DialogDescription>Dữ liệu sẽ được lưu vào nhóm <b>{activeGroup}</b>.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã giá trị (Code) <span className="text-destructive">*</span></label>
            <Input placeholder="Mã viết hoa..." value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên hiển thị <span className="text-destructive">*</span></label>
            <Input placeholder="Tên hiển thị..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Thứ tự sắp xếp</label>
            <Input type="number" value={form.sort || ""} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Lưu giá trị
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- MODAL CHỈNH SỬA ---
export function EditCategoryModal({ editingItem, onClose }: { editingItem: CategoryItem | null; onClose: () => void; }) {
  const [form, setForm] = useState({ code: "", name: "", sort: 0, active: 1 });
  const updateMutation = useUpdateCategory();

  useEffect(() => {
    if (editingItem) {
      setForm({ code: editingItem.code, name: editingItem.name, sort: editingItem.sort, active: editingItem.active });
    }
  }, [editingItem]);

  const handleSubmit = () => {
    if (!editingItem) return;
    if (!form.code.trim() || !form.name.trim()) return toast.error("Vui lòng nhập mã và tên.");
    updateMutation.mutate(
      { id: editingItem.id, payload: { code: form.code.trim().toUpperCase(), name: form.name.trim(), order: form.sort ?? 0, active: form.active } },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={!!editingItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa: {editingItem?.name}</DialogTitle>
          <DialogDescription>Nhóm <b>{editingItem?.group}</b></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã (Code) <span className="text-destructive">*</span></label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên hiển thị <span className="text-destructive">*</span></label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Thứ tự</label>
            <Input type="number" value={form.sort ?? ""} onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <Select value={String(form.active)} onValueChange={(v) => setForm({ ...form, active: parseInt(v, 10) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sử dụng</SelectItem>
                <SelectItem value="0">Tạm ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
