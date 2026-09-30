"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, FileCode2, RefreshCw, UploadCloud, Download, AlertCircle } from "lucide-react";
import { hrmKpiPeriodsApi, hrmKpiEvaluationsApi } from "@/features/hrm/api/kpis.api";
import apiClient from "@/lib/axiosInstance";

export function PersonalKpiClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [xmlContent, setXmlContent] = useState<string>("");
  const [fileId, setFileId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Lấy kỳ đánh giá
  const { data: periodsRes, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["kpi-periods"],
    queryFn: () => hrmKpiPeriodsApi.getPeriods()
  });
  const periods = periodsRes?.data || [];

  // Lấy chi tiết đánh giá (nếu đã tạo)
  const { data: evaluationsRes, refetch: refetchEvaluations } = useQuery({
    queryKey: ["personal-evaluations"],
    queryFn: () => hrmKpiEvaluationsApi.list()
  });
  const evaluations = evaluationsRes?.data || [];
  const currentEval = evaluations.find((e: any) => e.periodId === Number(selectedPeriod));

  // Tự động tính điểm và tạo XML
  const calculateKpiMut = useMutation({
    mutationFn: (periodId: number) => hrmKpiEvaluationsApi.calculatePersonal({ periodId }),
    onSuccess: (res: any) => {
      toast.success("Đã đồng bộ số liệu KPI & LGSP thành công!");
      refetchEvaluations();
      
      if (res.data?.xmlContent) {
        setXmlContent(res.data.xmlContent);
      }
    },
    onError: () => toast.error("Có lỗi khi tính toán KPI")
  });

  // Upload file lên media-service
  const uploadXmlFile = async () => {
    if (!xmlContent) return;
    setIsUploading(true);
    try {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const file = new File([blob], `kpi_evaluation_${selectedPeriod}.xml`, { type: 'application/xml' });
      
      const reqRes: any = await apiClient.post("/media/request-upload", {
        filename: file.name,
        contentType: file.type,
        size: file.size,
        bucketType: "documents"
      });
      const uploadInfo = reqRes.data;
      
      const axios = require('axios').default;
      await axios.put(uploadInfo.uploadUrl, file, { headers: { "Content-Type": file.type } });
      await apiClient.post("/media/confirm-upload", { fileId: uploadInfo.fileId });
      
      setFileId(uploadInfo.fileId);
      toast.success("Tải tệp minh chứng XML lên hệ thống thành công!");
    } catch (e) {
      toast.error("Lỗi khi tải tệp minh chứng");
    } finally {
      setIsUploading(false);
    }
  };

  // Nộp KPI
  const submitMut = useMutation({
    mutationFn: () => hrmKpiEvaluationsApi.submitSelfScore(currentEval?.id, { documentFileId: fileId }),
    onSuccess: () => {
      toast.success("Đã nộp phiếu đánh giá KPI thành công!");
      refetchEvaluations();
    },
    onError: () => toast.error("Có lỗi khi nộp phiếu đánh giá")
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-xl shadow-lg text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kê Khai & Tự Đánh Giá KPI</h1>
          <p className="mt-2 text-blue-100 max-w-2xl">
            Tự động lấy số liệu từ hệ thống giao việc và trục liên thông LGSP.
            Hỗ trợ xuất XML làm minh chứng lưu trữ điện tử.
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
          <FileCode2 className="h-10 w-10 text-blue-100" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-indigo-500 shadow-md">
            <CardHeader className="bg-indigo-50/50 border-b">
              <CardTitle className="text-xl text-indigo-900">1. Chọn kỳ đánh giá</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Kỳ đánh giá (Tháng / Quý)</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={isLoadingPeriods}>
                    <SelectTrigger className="h-12 border-gray-300">
                      <SelectValue placeholder="-- Chọn kỳ đánh giá --" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p: any) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} ({new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => selectedPeriod && calculateKpiMut.mutate(Number(selectedPeriod))} 
                  disabled={!selectedPeriod || calculateKpiMut.isPending}
                  className="h-12 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  {calculateKpiMut.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Đồng bộ số liệu (LGSP)
                </Button>
              </div>
            </CardContent>
          </Card>

          {xmlContent && (
            <Card className="border-t-4 border-t-emerald-500 shadow-md">
              <CardHeader className="bg-emerald-50/50 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-emerald-900">2. Kết quả & Minh chứng XML</CardTitle>
                  <CardDescription>Số liệu đã được tính toán tự động và gói gọn vào định dạng chuẩn</CardDescription>
                </div>
                <Badge className="bg-emerald-500">Đã đồng bộ</Badge>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border text-center">
                    <p className="text-sm text-gray-500">Điểm CV Hệ thống</p>
                    <p className="text-2xl font-bold text-gray-800">{currentEval?.taskScoreSelf || 0}</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4 border border-rose-100 text-center">
                    <p className="text-sm text-rose-600">Trừ điểm LGSP</p>
                    <p className="text-2xl font-bold text-rose-700">{currentEval?.generalScoreSelf || 0}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-center shadow-inner">
                    <p className="text-sm text-emerald-700 font-semibold">TỔNG ĐIỂM</p>
                    <p className="text-3xl font-black text-emerald-600">{currentEval?.totalScore || 0}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nội dung XML Minh Chứng</Label>
                  <div className="relative">
                    <textarea 
                      readOnly 
                      value={xmlContent} 
                      className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                    <div className="absolute top-4 right-4 text-gray-500 text-xs flex items-center bg-gray-800 px-2 py-1 rounded">
                      <FileCode2 className="h-3 w-3 mr-1" /> XML FORMAT
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button 
                    onClick={uploadXmlFile} 
                    disabled={isUploading || !!fileId}
                    variant={fileId ? "outline" : "default"}
                    className={!fileId ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                  >
                    {isUploading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : (fileId ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />)}
                    {fileId ? "Đã lưu trữ hệ thống" : "Ký & Lưu trữ File XML (Media Service)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {fileId && (
            <Card className="border border-blue-200 shadow-sm overflow-hidden">
              <div className="bg-blue-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-lg">Hồ sơ đã sẵn sàng</h3>
                    <p className="text-sm text-blue-700">Tệp minh chứng đã được ký và lưu trữ an toàn (ID: {fileId.slice(0,8)}...)</p>
                  </div>
                </div>
                <Button 
                  onClick={() => submitMut.mutate()} 
                  disabled={submitMut.isPending || currentEval?.status === 'SUBMITTED'}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {submitMut.isPending && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                  {currentEval?.status === 'SUBMITTED' ? "Đã nộp chờ duyệt" : "Hoàn thành & Gửi Lãnh đạo"}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-50 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Hướng dẫn thực hiện
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-4">
              <p>
                <strong>Bước 1:</strong> Chọn kỳ đánh giá hiện tại để hệ thống tính toán.
              </p>
              <p>
                <strong>Bước 2:</strong> Hệ thống sẽ <b>tự động</b> liên kết LGSP và Công việc để tổng hợp điểm. File XML chứa chi tiết chấm điểm sẽ được khởi tạo.
              </p>
              <p>
                <strong>Bước 3:</strong> Ký số & Tải file XML lên hệ thống Lưu trữ điện tử (Media Service).
              </p>
              <p>
                <strong>Bước 4:</strong> Nộp hồ sơ để lãnh đạo phê duyệt (Kích hoạt Workflow tự động).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
