/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef } from "react";
import {
  Folder, File, Upload, Search, Filter, MoreVertical,
  FileText, Image as ImageIcon, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useState } from "react";
import {
  useCabinetFiles,
  useCabinetMutations,
  useDossierList,
} from "../../hooks/useDocumentFormData";

export function DocumentCabinetClient() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

  // React Query hooks — loại bỏ useEffect + apiClient trực tiếp
  const { data: files = [], isLoading } = useCabinetFiles();
  const { data: dossiers = [] } = useDossierList();
  const { addFile } = useCabinetMutations();

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      toast.info("Đang xử lý tải lên...");

      // 1. Upload file qua shared hook
      const mediaInfo = await uploadFile(selectedFile);
      if (!mediaInfo) throw new Error("Upload thất bại từ hook");

      // 2. Lưu vào Cabinet qua mutation — tự invalidate cache
      await addFile.mutateAsync({
        fileName: selectedFile.name,
        fileUrl: mediaInfo.downloadUrl || mediaInfo.fileUrl || `/admin/media/download/${mediaInfo.id}`,
        fileType: selectedFile.name.split(".").pop()?.toLowerCase() || "unknown",
        fileSize: selectedFile.size,
      });

      toast.success("Đã thêm vào tủ văn bản thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Thêm vào tủ văn bản thất bại!");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":   return <FileText className="h-8 w-8 text-rose-500" />;
      case "excel": return <File className="h-8 w-8 text-emerald-500" />;
      case "image": return <ImageIcon className="h-8 w-8 text-blue-500" />;
      default:      return <File className="h-8 w-8 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Tủ văn bản số</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Kho lưu trữ tài liệu dùng chung, tái sử dụng cho các thủ tục hành chính.</p>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <Button
          onClick={handleUpload}
          disabled={isUploading || addFile.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]"
        >
          {(isUploading || addFile.isPending)
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <Upload className="mr-2 h-4 w-4" />}
          {(isUploading || addFile.isPending) ? "Đang tải..." : "Tải tài liệu lên"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm tài liệu trong tủ..." className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="h-4 w-4 mr-2" /> Lọc theo nhãn
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-muted text-foreground hover:bg-muted/80">Cá nhân</Button>
          <Button variant="ghost" size="sm" className="rounded-full">Cơ quan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Folders (Dossiers) */}
        <div className="col-span-1 md:col-span-4 flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          <Card
            onClick={() => setActiveFolder(null)}
            className={`min-w-[200px] shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer border ${activeFolder === null ? "bg-primary/5 border-primary/50" : "bg-card border-border"}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <Folder className={`h-8 w-8 ${activeFolder === null ? "text-primary fill-primary/20" : "text-amber-500 fill-amber-500/20"}`} />
              <span className={`font-semibold ${activeFolder === null ? "text-primary" : "text-foreground"}`}>Tất cả tài liệu</span>
            </CardContent>
          </Card>
          {dossiers.map((dossier: any, idx: number) => (
            <Card
              key={idx}
              onClick={() => setActiveFolder(dossier.id)}
              className={`min-w-[250px] shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer border ${activeFolder === dossier.id ? "bg-primary/5 border-primary/50" : "bg-card border-border"}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Folder className={`h-8 w-8 ${activeFolder === dossier.id ? "text-primary fill-primary/20" : "text-amber-500 fill-amber-500/20"}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold text-sm line-clamp-1 ${activeFolder === dossier.id ? "text-primary" : "text-foreground"}`}>
                    {dossier.procedureName}
                  </span>
                  <span className="text-xs text-muted-foreground">{dossier.id}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Files */}
        {isLoading ? (
          <div className="col-span-4 flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          files
            .filter((f: any) => (activeFolder ? f.tags?.includes(activeFolder) : true))
            .map((file: any) => (
              <Card key={file.id} className="group border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-4 mt-2 p-4 bg-muted/30 rounded-full group-hover:scale-110 transition-transform">
                    {getFileIcon(file.fileType || file.type || "pdf")}
                  </div>
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1 w-full truncate" title={file.fileName || file.name}>
                    {file.fileName || file.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((file.fileSize || file.size || 0) / 1024 / 1024 * 10) / 10} MB •{" "}
                    {new Date(file.createdAt || file.date).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="flex gap-1 mt-4 justify-center flex-wrap">
                    {(() => {
                      try {
                        const parsedTags = typeof file.tags === "string" ? JSON.parse(file.tags) : file.tags;
                        return parsedTags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-muted text-muted-foreground">{tag}</Badge>
                        ));
                      // eslint-disable-next-line unused-imports/no-unused-vars
                      } catch (e) { return null; }
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
