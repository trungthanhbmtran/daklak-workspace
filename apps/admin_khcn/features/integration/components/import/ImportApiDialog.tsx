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

      <SheetContent side="right" className="w-[85vw] sm:min-w-[85vw] z-[99999] overflow-y-auto p-6 sm:p-8 flex flex-col">
        <SheetHeader className="mb-6 shrink-0">
          <SheetTitle>Tải lên hoặc dán nội dung</SheetTitle>
          <SheetDescription>Hỗ trợ định dạng OpenAPI, Swagger, Postman, cURL để tự động điền form.</SheetDescription>
        </SheetHeader>

        <Tabs value={inputType} onValueChange={(v) => setInputType(v as "file" | "text")} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="text">Dán Text</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-6 flex-1 flex flex-col">
            <div
              className="flex-1 border-2 border-dashed border-muted-foreground/25 rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">
                {file ? file.name : "Nhấn để chọn file JSON/YAML"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Tối đa 10MB</p>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept=".json,.yaml,.yml"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-md text-sm leading-relaxed">
                <strong className="block mb-1">Mẹo nhỏ:</strong>
                Bạn có thể Export bộ sưu tập (Collection) từ Postman dưới dạng JSON v2.1 và tải lên đây. Hệ thống sẽ tự động bóc tách các API, phương thức (GET/POST), URL và headers để điền vào hệ thống.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-6 flex-1 flex flex-col">
            <Textarea
              placeholder="Dán nội dung OpenAPI/Swagger, Postman Collection, hoặc cURL..."
              className="flex-1 min-h-[400px] font-mono text-sm resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-4 border-t shrink-0">
          <Button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Phân tích và Điền
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
