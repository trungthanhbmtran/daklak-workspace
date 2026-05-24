import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, FolderPlus } from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateDossierModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loadingProcs, setLoadingProcs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedProc, setSelectedProc] = useState("");
  const [senderName, setSenderName] = useState("");

  useEffect(() => {
    if (open) {
      fetchProcedures();
      setSelectedProc("");
      setSenderName("");
    }
  }, [open]);

  const fetchProcedures = async () => {
    try {
      setLoadingProcs(true);
      const res: any = await apiClient.get('/documents/procedures/list');
      if (res?.data) {
        setProcedures(res.data);
      }
    } catch (e) {
      toast.error("Lỗi khi tải danh sách Thủ tục");
    } finally {
      setLoadingProcs(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProc) {
      toast.error("Vui lòng chọn Mẫu hồ sơ/Thủ tục");
      return;
    }
    if (!senderName) {
      toast.error("Vui lòng nhập tên người nộp");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/documents/dossiers/from-template', {
        procedureId: selectedProc,
        senderName: senderName
      });
      toast.success("Đã tạo bộ hồ sơ mới thành công!");
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Tạo bộ hồ sơ thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderPlus className="mr-2 h-5 w-5 text-indigo-600" />
            Tiếp nhận Hồ sơ mới từ Mẫu
          </DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động sinh danh sách các thành phần hồ sơ yêu cầu dựa trên Mẫu hồ sơ bạn chọn.
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
            <label className="text-sm font-medium text-slate-700">Mẫu hồ sơ (TTHC) *</label>
            <Select value={selectedProc} onValueChange={setSelectedProc}>
              <SelectTrigger>
                <SelectValue placeholder={loadingProcs ? "Đang tải..." : "Chọn thủ tục hành chính..."} />
              </SelectTrigger>
              <SelectContent>
                {procedures.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">Danh sách này được cấu hình trong chức năng Quản lý Mẫu hồ sơ.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} Tiếp nhận Hồ sơ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
