/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 w-4 h-4" />
          Import API
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[400px] sm:w-[540px] z-[99999] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Tải lên hoặc dán nội dung</SheetTitle>
          <SheetDescription>Hỗ trợ định dạng OpenAPI, Swagger, Postman, cURL để tự động điền form.</SheetDescription>
        </SheetHeader>

        <Tabs value={inputType} onValueChange={(v) => setInputType(v as "file" | "text")}>
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="file" className="rounded-lg">Upload File</TabsTrigger>
            <TabsTrigger value="text" className="rounded-lg">Dán Text</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <div
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
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
              placeholder="Dán nội dung OpenAPI/Swagger, Postman Collection, hoặc cURL..."
              className="min-h-[250px] font-mono text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl p-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Phân tích và Điền
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
