import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { useCreateDossier } from "../../hooks/useDocumentFormData";

export function CreateDossierModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [procedureName, setProcedureName] = useState("");
  const [senderName, setSenderName] = useState("");

  // Mutation hook — tự invalidate cache dossiers-list, không cần apiClient trực tiếp
  const createDossier = useCreateDossier(() => {
    onSuccess();
    onOpenChange(false);
  });

  useEffect(() => {
    if (open) {
      setProcedureName("");
      setSenderName("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!procedureName) {
      toast.error("Vui lòng nhập Tên hồ sơ/thủ tục");
      return;
    }
    if (!senderName) {
      toast.error("Vui lòng nhập tên người nộp");
      return;
    }
    try {
      await createDossier.mutateAsync({ procedureName, senderName });
      toast.success("Đã tạo bộ hồ sơ mới thành công!");
    } catch {
      toast.error("Tạo bộ hồ sơ thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderPlus className="mr-2 h-5 w-5 text-indigo-600" />
            Tiếp nhận Hồ sơ mới
          </DialogTitle>
          <DialogDescription>
            Tạo một bộ hồ sơ trống. Bạn có thể thêm các thành phần yêu cầu từ Tủ văn bản sau khi tạo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Người nộp / Tổ chức *</label>
            <Input
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="Nhập tên người nộp hồ sơ..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên loại hồ sơ / Thủ tục *</label>
            <Input
              value={procedureName}
              onChange={e => setProcedureName(e.target.value)}
              placeholder="VD: Hồ sơ xin cấp phép kinh doanh..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            disabled={createDossier.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {createDossier.isPending
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Save className="h-4 w-4 mr-2" />
            }
            Tiếp nhận Hồ sơ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
