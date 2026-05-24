"use client";

import React, { useState, useEffect, useRef } from "react";
import { Folder, File, Upload, Search, Filter, MoreVertical, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";

export function DocumentCabinetClient() {
  const [files, setFiles] = useState<any[]>([]);
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useFileUpload();

  useEffect(() => {
    fetchCabinet();
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const res: any = await apiClient.get('/documents/dossiers/list');
      if (res?.data && res.data.length > 0) {
        setDossiers(res.data);
      } else {
        setDossiers([
          { id: "HS-2023-001", procedureName: "Đăng ký KHCN cấp Tỉnh" },
          { id: "HS-2023-002", procedureName: "Cấp phép hoạt động đo lường" }
        ]);
      }
    } catch (e) {
      console.log(e);
      setDossiers([
        { id: "HS-2023-001", procedureName: "Đăng ký KHCN cấp Tỉnh" },
        { id: "HS-2023-002", procedureName: "Cấp phép hoạt động đo lường" }
      ]);
    }
  };

  const fetchCabinet = async () => {
    try {
      setLoading(true);
      // Gọi API lấy tủ văn bản (giả sử userId test = '1')
      const res: any = await apiClient.get('/documents/cabinet?userId=1');
      if (res?.data && res.data.length > 0) {
        setFiles(res.data);
      } else {
        // Fallback mock data nếu DB rỗng để demo UI
        setFiles([
          { id: "f1", name: "CCCD_NguyenVanA.pdf", type: "pdf", size: 2400000, createdAt: "2023-10-12", tags: '["Cá nhân", "Định danh"]' },
          { id: "f2", name: "GiayPhepKinhDoanh_CtyX.pdf", type: "pdf", size: 1100000, createdAt: "2023-10-10", tags: '["Doanh nghiệp"]' },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải tủ văn bản");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      toast.info("Đang xử lý tải lên...");

      // 1. Dùng chung hook uploadFile đã có
      const mediaInfo = await uploadFile(selectedFile);
      if (!mediaInfo) throw new Error("Upload thất bại từ hook");

      // 2. Lưu vào cơ sở dữ liệu Cabinet (Document Service)
      await apiClient.post('/documents/cabinet', {
        userId: '1', // Test user id
        fileName: selectedFile.name,
        fileUrl: mediaInfo.downloadUrl || mediaInfo.fileUrl || `/admin/media/download/${mediaInfo.id}`,
        fileType: selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown',
        fileSize: selectedFile.size
      });

      toast.success("Đã thêm vào tủ văn bản thành công!");
      fetchCabinet(); // Cập nhật lại danh sách tủ
    } catch (error) {
      console.error(error);
      toast.error("Thêm vào tủ văn bản thất bại!");
    } finally {
      // Xoá trắng giá trị input để có thể chọn lại file cũ nếu muốn
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-rose-500" />;
      case 'excel': return <File className="h-8 w-8 text-emerald-500" />;
      case 'image': return <ImageIcon className="h-8 w-8 text-blue-500" />;
      default: return <File className="h-8 w-8 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tủ văn bản số</h2>
          <p className="text-slate-500 mt-2">Kho lưu trữ tài liệu dùng chung, tái sử dụng cho các thủ tục hành chính.</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={handleUpload} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]">
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploading ? "Đang tải..." : "Tải tài liệu lên"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm kiếm tài liệu trong tủ..." className="pl-10 bg-slate-50 border-none" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full"><Filter className="h-4 w-4 mr-2" /> Lọc theo nhãn</Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-slate-100">Cá nhân</Button>
          <Button variant="ghost" size="sm" className="rounded-full">Cơ quan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Folders (Dossiers) */}
        <div className="col-span-1 md:col-span-4 flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          <Card
            onClick={() => setActiveFolder(null)}
            className={`min-w-[200px] border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer ${activeFolder === null ? 'bg-indigo-50 border-indigo-300' : ''}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <Folder className={`h-8 w-8 ${activeFolder === null ? 'text-indigo-600 fill-indigo-200' : 'text-amber-400 fill-amber-100'}`} />
              <span className={`font-semibold ${activeFolder === null ? 'text-indigo-900' : 'text-slate-700'}`}>Tất cả tài liệu</span>
            </CardContent>
          </Card>
          {dossiers.map((dossier, idx) => (
            <Card
              key={idx}
              onClick={() => setActiveFolder(dossier.id)}
              className={`min-w-[250px] border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer ${activeFolder === dossier.id ? 'bg-indigo-50 border-indigo-300' : ''}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Folder className={`h-8 w-8 ${activeFolder === dossier.id ? 'text-indigo-600 fill-indigo-200' : 'text-amber-400 fill-amber-100'}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold text-sm line-clamp-1 ${activeFolder === dossier.id ? 'text-indigo-900' : 'text-slate-700'}`}>{dossier.procedureName}</span>
                  <span className="text-xs text-slate-500">{dossier.id}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Files */}
        {files.filter(f => activeFolder ? f.tags?.includes(activeFolder) : true).map((file) => (
          <Card key={file.id} className="group border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5 flex flex-col items-center text-center">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4 mt-2 p-4 bg-slate-50 rounded-full group-hover:scale-110 transition-transform">
                {getFileIcon(file.fileType || file.type || 'pdf')}
              </div>
              <h4 className="font-semibold text-slate-800 text-sm line-clamp-1 w-full truncate" title={file.fileName || file.name}>{file.fileName || file.name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {Math.round((file.fileSize || file.size || 0) / 1024 / 1024 * 10) / 10} MB • {new Date(file.createdAt || file.date).toLocaleDateString('vi-VN')}
              </p>
              <div className="flex gap-1 mt-4 justify-center flex-wrap">
                {(() => {
                  try {
                    const parsedTags = typeof file.tags === 'string' ? JSON.parse(file.tags) : file.tags;
                    return parsedTags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">{tag}</Badge>
                    ));
                  } catch (e) { return null; }
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
