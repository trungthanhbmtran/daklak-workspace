/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";

interface ImportApiDialogProps {
  onSuccess?: (data: any) => void;
}

export function ImportApiDialog({ onSuccess }: ImportApiDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Step 1 states
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetState();
    setOpen(isOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file vượt quá giới hạn 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handlePreview = async () => {
    if (inputType === "file" && !file) {
      toast.error("Vui lòng chọn file");
      return;
    }
    if (inputType === "text" && !text.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (inputType === "file" && file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }

      const response = await apiClient.post("/integration-upstreams/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }) as any;

      if (response.data?.success || response.success) {
        const resData = response.data?.success ? response.data.data : response.data;
        if (onSuccess) {
          onSuccess({
            systemName: resData.systemName,
            baseUrl: resData.baseUrl,
            metadata: { _parsedEndpoints: resData.endpoints }
          });
          toast.success("Đã phân tích dữ liệu, hệ thống tự động điền vào form tạo mới!");
        }
        handleOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Lỗi khi phân tích dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 px-6 h-10"
        iconStart={<Upload className="w-4 h-4" />}
      >
        Import API
      </Button>

      <ResponsiveModal
        open={open}
        onOpenChange={handleOpenChange}
        title="Import API Đầu Vào"
        description="Hỗ trợ định dạng OpenAPI 3, Swagger 2, Postman Collection, hoặc cURL."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-xl w-full sm:w-auto">Hủy</Button>
            <Button 
              onClick={handlePreview} 
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 border-0 w-full sm:w-auto"
              iconStart={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              Phân tích và Tự động điền
            </Button>
          </div>
        }
      >
        <div className="pt-4 space-y-4">
          <Tabs value={inputType} onValueChange={(v) => setInputType(v as "file" | "text")}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="file" className="rounded-lg">Upload File</TabsTrigger>
              <TabsTrigger value="text" className="rounded-lg">Dán Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="mt-4">
              <div 
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {file ? file.name : "Nhấn để chọn file JSON/YAML"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Tối đa 10MB</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  accept=".json,.yaml,.yml"
                  onChange={handleFileChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <Textarea 
                placeholder="Dán nội dung OpenAPI/Swagger, Postman Collection, hoặc cURL vào đây..."
                className="min-h-[200px] font-mono text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl p-4"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveModal>
    </>
  );
}
