/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { integrationKeys } from "../../api";

interface ParsedEndpoint {
  method: string;
  path: string;
  name: string;
  description: string;
  status: "NEW" | "CONFLICT";
}

interface ParseResult {
  systemName: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
}

export function ImportApiDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 states
  const [inputType, setInputType] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 states
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<number>>(new Set());
  const [conflictStrategy, setConflictStrategy] = useState<"OVERWRITE" | "IGNORE">("IGNORE");
  const queryClient = useQueryClient();

  const resetState = () => {
    setStep(1);
    setFile(null);
    setText("");
    setParseResult(null);
    setSelectedEndpoints(new Set());
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

      // We need to point this to the backend preview endpoint
      const response = await apiClient.post("/integration-upstreams/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }) as any;

      if (response.data?.success || response.success) {
        const resData = response.data?.success ? response.data.data : response.data;
        setParseResult(resData);
        // Select all by default
        const allIndices = resData.endpoints.map((_: any, i: number) => i);
        setSelectedEndpoints(new Set(allIndices));
        setStep(2);
        toast.success("Phân tích thành công");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Lỗi khi phân tích dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!parseResult) return;
    if (selectedEndpoints.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 endpoint để import");
      return;
    }

    const endpointsToCommit = parseResult.endpoints.filter((_, i) => selectedEndpoints.has(i));

    setLoading(true);
    try {
      const payload = {
        systemName: parseResult.systemName,
        baseUrl: parseResult.baseUrl,
        endpoints: endpointsToCommit,
        conflictStrategy
      };

      const response = await apiClient.post("/integration-upstreams/import/commit", payload) as any;

      if (response.success || response.data?.success) {
        toast.success(response.message || response.data?.message || "Import thành công");
        queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
        handleOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi import dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleEndpoint = (index: number) => {
    const newSelected = new Set(selectedEndpoints);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEndpoints(newSelected);
  };

  const toggleAll = () => {
    if (!parseResult) return;
    if (selectedEndpoints.size === parseResult.endpoints.length) {
      setSelectedEndpoints(new Set());
    } else {
      const allIndices = parseResult.endpoints.map((_, i) => i);
      setSelectedEndpoints(new Set(allIndices));
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
        description={step === 1 ? "Hỗ trợ định dạng OpenAPI 3, Swagger 2, Postman Collection, hoặc cURL." : "Xem trước và xác nhận các endpoint sẽ được import."}
      >
        <div className="pt-4">
          {step === 1 && (
            <div className="space-y-4">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-xl">Hủy</Button>
                <Button 
                  onClick={handlePreview} 
                  disabled={loading}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                  iconStart={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                >
                  Phân tích
                </Button>
              </div>
            </div>
          )}

          {step === 2 && parseResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Hệ thống nguồn</label>
                  <Input value={parseResult.systemName} readOnly className="h-9 bg-slate-50 dark:bg-slate-950" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Base URL</label>
                  <Input 
                    value={parseResult.baseUrl} 
                    onChange={(e) => setParseResult({ ...parseResult, baseUrl: e.target.value })}
                    className="h-9" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Xử lý trùng lặp:</span>
                  <Select value={conflictStrategy} onValueChange={(v: any) => setConflictStrategy(v)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IGNORE">Bỏ qua (Giữ cũ)</SelectItem>
                      <SelectItem value="OVERWRITE">Ghi đè (Cập nhật)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-slate-500">
                  Đã chọn {selectedEndpoints.size}/{parseResult.endpoints.length} endpoints
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <Checkbox 
                          checked={selectedEndpoints.size === parseResult.endpoints.length && parseResult.endpoints.length > 0} 
                          onCheckedChange={toggleAll} 
                        />
                      </TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Tên API</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.endpoints.map((ep, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-center">
                          <Checkbox checked={selectedEndpoints.has(i)} onCheckedChange={() => toggleEndpoint(i)} />
                        </TableCell>
                        <TableCell>
                          {ep.status === "NEW" ? (
                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Mới</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Trùng</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{ep.method}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{ep.path}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={ep.name}>{ep.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">Quay lại</Button>
                <Button 
                  onClick={handleCommit} 
                  disabled={loading || selectedEndpoints.size === 0}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                  iconStart={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                >
                  Xác nhận Import
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveModal>
    </>
  );
}
