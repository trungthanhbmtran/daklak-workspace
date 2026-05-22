"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hrmPlansApi } from "@/features/hrm/api";
import { ArrowLeft, Save, UploadCloud, FileSpreadsheet, Sparkles, X, LayoutList, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export const PlanFormClient = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importedTasks, setImportedTasks] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE"
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Vui lòng tải lên tệp Excel (.xlsx, .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        setFileName(file.name);
        setImportedTasks(data);
        
        // Tự động điền tiêu đề từ tên file nếu chưa có
        if (!formData.title) {
          const planName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setFormData(prev => ({ ...prev, title: planName.toUpperCase() }));
        }
        
        toast.success(`Đã đọc thành công ${data.length} công việc từ tệp Excel!`);
      } catch (error) {
        console.error(error);
        toast.error("Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFileName("");
    setImportedTasks([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Vui lòng nhập Tiêu đề kế hoạch");
      return;
    }
    setSubmitting(true);
    
    try {
      // Trong thực tế, bạn sẽ gửi `importedTasks` lên server để bulk create tasks
      // const payload = { ...formData, tasks: importedTasks };
      await hrmPlansApi.create(formData);
      
      toast.success(importedTasks.length > 0 
        ? `Đã khởi tạo Kế hoạch và tự động gán ${importedTasks.length} công việc!` 
        : "Đã tạo Kế hoạch thành công!");
        
      router.push("/services/hrm/plans");
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi tạo kế hoạch");
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "Tên công việc": "Khảo sát hiện trạng hệ thống",
        "Mô tả": "Lập danh sách các máy chủ và phần mềm hiện tại",
        "Người thực hiện": "Nguyễn Văn A",
        "Thời hạn": "2026-10-15",
        "Ưu tiên": "Cao",
        "KPI": "Bản báo cáo hoàn chỉnh"
      },
      {
        "Tên công việc": "Cài đặt phần mềm mới",
        "Mô tả": "Cài đặt bộ phần mềm văn phòng số trên toàn bộ máy chủ",
        "Người thực hiện": "Trần Thị B",
        "Thời hạn": "2026-10-20",
        "Ưu tiên": "Trung bình",
        "KPI": "Hoàn thành 100% server"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachCongViec");
    XLSX.writeFile(wb, "Mau_Ke_Hoach_Cong_Viec.xlsx");
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Khởi tạo Kế hoạch tổng
            </h1>
            <p className="text-slate-500 font-medium mt-1">Thiết lập mục tiêu và phân rã công việc từ tệp Excel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cột trái: Form nhập liệu */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 overflow-hidden relative">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 absolute top-0 left-0"></div>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <LayoutList className="text-indigo-500 w-6 h-6" /> Thông tin cơ sở
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Tiêu đề kế hoạch <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="VD: Chuyển đổi số nội bộ 2026"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="h-12 text-lg font-semibold bg-slate-50/50 focus:bg-white rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Mô tả chi tiết</Label>
                      <textarea
                        className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y text-sm leading-relaxed"
                        placeholder="Mô tả mục tiêu, yêu cầu, bối cảnh thực hiện..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Ngày bắt đầu</Label>
                        <Input type="date" className="h-12 rounded-xl border-slate-200" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Ngày kết thúc (Dự kiến)</Label>
                        <Input type="date" className="h-12 rounded-xl border-slate-200" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Trạng thái ban hành</Label>
                      <select
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="DRAFT">Lưu Nháp (Chưa triển khai)</option>
                        <option value="ACTIVE">Kích hoạt (Cho phép giao việc ngay)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Khu vực hiển thị bảng Excel đã Import */}
              {importedTasks.length > 0 && (
                <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 border-t-4 border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="text-emerald-500 w-5 h-5" /> Danh sách công việc trích xuất ({importedTasks.length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto max-h-80 rounded-xl border border-slate-100">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0 uppercase font-bold">
                          <tr>
                            {Object.keys(importedTasks[0] || {}).map((key) => (
                              <th key={key} className="px-4 py-3">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importedTasks.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              {Object.values(row).map((val: any, vIdx) => (
                                <td key={vIdx} className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={val}>{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-emerald-600 mt-4 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Hệ thống sẽ tự động tạo hàng loạt công việc này ngay sau khi bạn Lưu Kế hoạch.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cột phải: Vùng Import Excel & Hành động */}
            <div className="space-y-6">
              <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 overflow-hidden">
                <CardContent className="p-6 bg-indigo-50/50">
                  <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <UploadCloud className="text-indigo-600 w-5 h-5" /> Nhập liệu nhanh
                  </h3>
                  
                  {!fileName ? (
                    <div 
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-white",
                        dragActive ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]" : "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FileSpreadsheet className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">Kéo thả tệp Excel vào đây</p>
                      <p className="text-xs text-slate-500">hoặc click để chọn tệp (.xlsx, .xls)</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-800 truncate">{fileName}</p>
                          <p className="text-xs text-emerald-600 font-medium mt-0.5">{importedTasks.length} công việc</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={removeFile} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-indigo-100 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <strong>Lưu ý:</strong> Tệp Excel nên có dòng đầu tiên là tiêu đề cột (Ví dụ: Tên công việc, Người phụ trách, Hạn chót...). Hệ thống sẽ tự động đối chiếu các trường thông tin.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={downloadTemplate}
                      className="w-full text-indigo-600 border-indigo-200 bg-white hover:bg-indigo-50 font-bold rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" /> Tải file mẫu (Template)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <Button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold text-base shadow-lg shadow-slate-900/20">
                      <Save className="mr-2 h-5 w-5" /> Ban hành Kế hoạch
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()} className="w-full rounded-xl h-12 font-bold text-slate-600 border-slate-200">
                      Hủy bỏ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
