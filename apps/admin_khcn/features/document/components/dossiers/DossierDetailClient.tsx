"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Upload, Download, Trash2, Link as LinkIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useDossierComponents, useCabinetFiles, useDossierComponentMutations } from "../../hooks/useDocumentFormData";
import { DossierStatusBadge, DossierComponentStatusBadge, DossierComponentStatusIcon } from "@/components/shared/badges/DocumentBadges";

export function DossierDetailClient({ dossierId }: { dossierId: string }) {
  const dossier = {
    id: dossierId,
    procedureName: "Đăng ký đề tài Khoa học công nghệ cấp Tỉnh",
    applicant: "Nguyễn Văn A",
    status: "PROCESSING",
    submitDate: "2023-10-15",
  };

  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState(false);
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  const { uploadFile, isUploading } = useFileUpload();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // React Query hooks thay thế useEffect + apiClient trực tiếp
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { data: components = [], isLoading: loading } = useDossierComponents(dossierId);
  const { data: cabinetFiles = [] } = useCabinetFiles(isCabinetModalOpen || isAddComponentModalOpen);
  const { updateComponent, addComponent } = useDossierComponentMutations(dossierId);

  const handleUploadClick = (compId: string) => {
    setSelectedCompId(compId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedCompId) return;
    try {
      toast.info("Đang xử lý tải lên...");
      const mediaInfo = await uploadFile(selectedFile);
      if (!mediaInfo) throw new Error("Upload thất bại");
      const fileUrl = mediaInfo.downloadUrl || mediaInfo.fileUrl || `/admin/media/download/${mediaInfo.id}`;
      await updateComponent.mutateAsync({ id: selectedCompId, status: 'VALID', fileUrl, source: 'UPLOAD' });
      toast.success("Tải tài liệu thành công!");
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error("Tải tài liệu thất bại!");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedCompId(null);
    }
  };

  const handleCabinetClick = (compId: string) => {
    setSelectedCompId(compId);
    setIsCabinetModalOpen(true);
  };

  const handleSelectFromCabinet = async (fileUrl: string) => {
    if (!selectedCompId) return;
    try {
      await updateComponent.mutateAsync({ id: selectedCompId, status: 'VALID', fileUrl, source: 'CABINET' });
      toast.success("Đã đính kèm tài liệu từ Tủ văn bản!");
      setIsCabinetModalOpen(false);
    } catch {
      toast.error("Lỗi khi đính kèm tài liệu");
    }
  };

  const handleSelectComponentFromCabinet = async (fileUrl: string, fileName: string) => {
    try {
      await addComponent.mutateAsync({ name: fileName, fileUrl });
      toast.success("Đã thêm thành phần hồ sơ mới!");
      setIsAddComponentModalOpen(false);
    } catch {
      toast.error("Lỗi khi thêm thành phần hồ sơ");
    }
  };

  const handleAddFromCabinetClick = () => {
    setIsAddComponentModalOpen(true);
  };



  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/services/documents/dossiers">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
              </Button>
            </Link>
            <Badge variant="outline" className="font-mono text-indigo-700 bg-indigo-50 border-indigo-200">{dossier.id}</Badge>
            <DossierStatusBadge code={dossier.status} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{dossier.procedureName}</h2>
          <p className="text-slate-500 mt-1">Người nộp: <span className="font-medium text-slate-700">{dossier.applicant}</span> • Nộp ngày: {dossier.submitDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">Yêu cầu bổ sung</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-2 h-4 w-4"/> Duyệt hồ sơ</Button>
        </div>
      </div>

      {/* Components List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-slate-800">Thành phần hồ sơ</CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">Tiến độ: {components.filter(c => c.status === 'VALID').length}/{components.length} tài liệu</span>
              <Button onClick={handleAddFromCabinetClick} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Thêm yêu cầu từ Tủ VB
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {components.map((comp) => (
              <div key={comp.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-slate-50/50 transition-colors">
                
                <div className="flex gap-4 items-start flex-1">
                  <div className="mt-1">
                    <DossierComponentStatusIcon code={comp.status} />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <DossierComponentStatusBadge code={comp.status} />
                      <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        {comp.name}
                        {comp.isRequired && <span className="text-rose-500 text-sm">*</span>}
                      </h4>
                    </div>
                    {comp.fileUrl ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-white border border-slate-200 text-indigo-700 hover:bg-slate-100 cursor-pointer">
                          <FileText className="mr-1 h-3 w-3" /> {comp.fileUrl.split('/').pop()}
                        </Badge>
                        {comp.source === 'CABINET' && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <LinkIcon className="h-3 w-3"/> Lấy từ Tủ văn bản
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-slate-400 italic">Chưa có tài liệu đính kèm.</p>
                        {comp.sampleFileUrl && (
                          <a href={comp.sampleFileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 w-fit">
                            <Download className="h-3 w-3" /> Tải xuống biểu mẫu mẫu
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {!comp.fileUrl ? (
                    <>
                      <Button onClick={() => handleUploadClick(comp.id)} disabled={isUploading && selectedCompId === comp.id} variant="outline" size="sm" className="flex-1 md:flex-none border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Upload className="mr-2 h-3 w-3" /> {isUploading && selectedCompId === comp.id ? "Đang tải..." : "Tải lên"}
                      </Button>
                      <Button onClick={() => handleCabinetClick(comp.id)} disabled={isUploading && selectedCompId === comp.id} variant="secondary" size="sm" className="flex-1 md:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                        <LinkIcon className="mr-2 h-3 w-3" /> Từ Tủ VB
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input for direct upload */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* Modal Chọn từ Tủ văn bản để ĐÍNH KÈM cho Component có sẵn */}
      <Dialog open={isCabinetModalOpen} onOpenChange={setIsCabinetModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Chọn tài liệu từ Tủ văn bản để đính kèm</DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {cabinetFiles.length === 0 ? (
              <p className="text-center text-slate-500 col-span-2 py-8">Tủ văn bản hiện đang trống.</p>
            ) : (
              cabinetFiles.map((f) => (
                <Card key={f.id} className="cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all border-slate-200" onClick={() => handleSelectFromCabinet(f.fileUrl)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <FileText className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm line-clamp-1" title={f.fileName || f.name}>{f.fileName || f.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(f.createdAt || f.date).toLocaleDateString('vi-VN')} • {Math.round((f.fileSize || f.size || 0) / 1024 / 1024 * 10) / 10} MB</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCabinetModalOpen(false)}>Hủy bỏ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chọn từ Tủ văn bản để THÊM MỚI Thành phần hồ sơ */}
      <Dialog open={isAddComponentModalOpen} onOpenChange={setIsAddComponentModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Thêm thành phần yêu cầu từ Tủ văn bản</DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {cabinetFiles.length === 0 ? (
              <p className="text-center text-slate-500 col-span-2 py-8">Tủ văn bản hiện đang trống.</p>
            ) : (
              cabinetFiles.map((f) => (
                <Card key={`add-${f.id}`} className="cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all border-slate-200" onClick={() => handleSelectComponentFromCabinet(f.fileUrl, f.fileName || f.name)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <FileText className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm line-clamp-1" title={f.fileName || f.name}>{f.fileName || f.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(f.createdAt || f.date).toLocaleDateString('vi-VN')} • {Math.round((f.fileSize || f.size || 0) / 1024 / 1024 * 10) / 10} MB</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddComponentModalOpen(false)}>Hủy bỏ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
