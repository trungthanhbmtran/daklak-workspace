/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Plus, FileText, Trash2, Edit, Save, Loader2, Upload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcedureList, useProcedureMutations } from "../../hooks/useDocumentFormData";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";

export function ProcedureConfigClient() {
  // React Query hooks — loại bỏ useEffect + apiClient trực tiếp
  const { data: procedures = [], isLoading: loading } = useProcedureList();
  const { createProcedure, deleteProcedure } = useProcedureMutations();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProcName, setNewProcName] = useState("");
  const [newProcCode, setNewProcCode] = useState("");
  const [newProcCategory, setNewProcCategory] = useState("Khoa học công nghệ");
  const [components, setComponents] = useState<{ id: string, name: string, isRequired: boolean, sampleFileUrl?: string }[]>([
    { id: "1", name: "Đơn đăng ký", isRequired: true }
  ]);

  const { uploadFile, isUploading } = useFileUpload();
  const [uploadingCompId, setUploadingCompId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddComponent = () => {
    setComponents([...components, { id: Date.now().toString(), name: "", isRequired: true }]);
  };

  const handleUpdateComponent = (id: string, name: string) => {
    setComponents(components.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleToggleRequired = (id: string) => {
    setComponents(components.map(c => c.id === id ? { ...c, isRequired: !c.isRequired } : c));
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleUploadSampleClick = (id: string) => {
    setUploadingCompId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !uploadingCompId) return;

    try {
      toast.info("Đang tải file mẫu lên...");
      const mediaInfo = await uploadFile(selectedFile);
      if (!mediaInfo) throw new Error("Upload thất bại");

      const fileUrl = mediaInfo.downloadUrl || mediaInfo.fileUrl || `/admin/media/download/${mediaInfo.id}`;

      setComponents(components.map(c => c.id === uploadingCompId ? { ...c, sampleFileUrl: fileUrl } : c));
      toast.success("Đã tải biểu mẫu lên!");
    } catch (error) {
      console.error(error);
      toast.error((error as any)?.response?.data?.message || "Tải biểu mẫu thất bại!");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadingCompId(null);
    }
  };

  const handleSubmit = async () => {
    if (!newProcName || !newProcCode) {
      toast.error("Vui lòng điền đủ Tên và Mã thủ tục");
      return;
    }
    const validComponents = components.filter(c => c.name.trim() !== "");
    if (validComponents.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 thành phần hồ sơ");
      return;
    }

    try {
      await createProcedure.mutateAsync({
        name: newProcName,
        code: newProcCode,
        category: newProcCategory,
        requiredDocs: validComponents,
      });
      toast.success("Đã lưu Mẫu hồ sơ thành công!");
      setIsModalOpen(false);
    } catch {
      toast.error("Lỗi khi lưu Mẫu hồ sơ");
    }
  };

  const openCreateModal = () => {
    setNewProcName("");
    setNewProcCode(`TTHC-${Date.now().toString().slice(-4)}`);
    setComponents([{ id: "1", name: "Đơn đăng ký", isRequired: true }]);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteProcedure.mutateAsync(itemToDelete);
      toast.success("Xóa thành công");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Cấu hình Mẫu hồ sơ (TTHC)</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Định nghĩa danh sách các thủ tục và biểu mẫu, thành phần file yêu cầu.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Thêm Mẫu mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-6">
          {procedures.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 bg-muted/30 rounded-xl border border-dashed border-border">Chưa có Mẫu hồ sơ nào được định nghĩa.</p>
          ) : procedures.map((proc) => (
            <Card key={proc.id} className="border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-muted-foreground bg-background border-border">{proc.code}</Badge>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
                      {proc.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{proc.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(proc.id)} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-foreground flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      Thành phần hồ sơ yêu cầu ({proc.requiredDocs?.length || 0})
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {proc.requiredDocs?.map((comp: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-foreground">{comp.name}</span>
                          {comp.sampleFileUrl && (
                            <span className="text-xs text-primary flex items-center gap-1">
                              <Paperclip className="h-3 w-3" /> Đã đính kèm file mẫu
                            </span>
                          )}
                        </div>
                        {comp.isRequired ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Bắt buộc</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Tùy chọn</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Thêm Mẫu hồ sơ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Mẫu hồ sơ (Thủ tục) mới</DialogTitle>
            <DialogDescription>Định nghĩa tên thủ tục và danh sách các file yêu cầu người nộp phải chuẩn bị.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mã TTHC *</label>
                <Input value={newProcCode} onChange={e => setNewProcCode(e.target.value)} placeholder="VD: TTHC-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Lĩnh vực</label>
                <Input value={newProcCategory} onChange={e => setNewProcCategory(e.target.value)} placeholder="Khoa học công nghệ" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tên Mẫu hồ sơ / Thủ tục *</label>
              <Input value={newProcName} onChange={e => setNewProcName(e.target.value)} placeholder="VD: Đăng ký đề tài KHCN" />
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground">Các thành phần hồ sơ yêu cầu</label>
                <Button onClick={handleAddComponent} variant="outline" size="sm" className="h-8 text-xs">
                  <Plus className="mr-1 h-3 w-3" /> Thêm tệp
                </Button>
              </div>
              <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border">
                {components.map((c, index) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-4">{index + 1}.</span>
                    <div className="flex-1 flex flex-col gap-2">
                      <Input
                        value={c.name}
                        onChange={e => handleUpdateComponent(c.id, e.target.value)}
                        placeholder="Tên tài liệu (VD: Đơn đăng ký)"
                        className="bg-background"
                      />
                      {c.sampleFileUrl && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                          <Paperclip className="h-3 w-3" /> Mẫu: {c.sampleFileUrl.split('/').pop()}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleUploadSampleClick(c.id)}
                      disabled={isUploading && uploadingCompId === c.id}
                      variant="outline"
                      size="sm"
                      title="Upload biểu mẫu"
                      className="text-muted-foreground shrink-0"
                    >
                      {isUploading && uploadingCompId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => handleToggleRequired(c.id)}
                      variant={c.isRequired ? "outline" : "outline"}
                      size="sm"
                      className={`shrink-0 ${c.isRequired ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20" : "text-muted-foreground"}`}
                    >
                      {c.isRequired ? "Bắt buộc" : "Tùy chọn"}
                    </Button>
                    <Button onClick={() => handleRemoveComponent(c.id)} variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={createProcedure.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {createProcedure.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Lưu Mẫu hồ sơ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa mẫu hồ sơ"
        description="Bạn có chắc chắn muốn xóa mẫu hồ sơ này? Tất cả các thành phần bên trong cũng sẽ bị xóa. Hành động này không thể hoàn tác."
        isDeleting={deleteProcedure.isPending}
      />

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
}
