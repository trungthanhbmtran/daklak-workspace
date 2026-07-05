"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Award, CheckCircle2, Send } from "lucide-react";
import { hrmKpiEvaluationsApi } from "@/features/hrm/api/kpis.api";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function PersonalKpiClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  const [evalDetail, setEvalDetail] = useState<any>(null);
  const [formDetails, setFormDetails] = useState<any[]>([]);

  // Fetch periods
  const { data: periodsData } = useQuery({
    queryKey: ["hrm-kpi-periods"],
    queryFn: () => apiClient.get("/hrm/kpis/periods").then((res: any) => res.data || []),
  });

  // Fetch evaluation details when evaluationId changes
  const { data: rawDetail, refetch: refetchDetail, isFetching } = useQuery({
    queryKey: ["hrm-kpi-eval-detail", evaluationId],
    queryFn: async () => {
      if (!evaluationId) return null;
      const res = await hrmKpiEvaluationsApi.getDetail(evaluationId);
      if (res.success) {
        const parsedData = JSON.parse(res.data);
        setEvalDetail(parsedData);
        setFormDetails(parsedData.details || []);
        return parsedData;
      }
      return null;
    },
    enabled: !!evaluationId,
  });

  const calculateMutation = useMutation({
    mutationFn: (periodId: number) => hrmKpiEvaluationsApi.calculatePersonal({ periodId }),
    onSuccess: (res: any) => {
      const evalId = res?.evaluationId || res?.data?.evaluationId;
      if (res?.success && evalId) {
        setEvaluationId(evalId);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra");
      }
    },
    onError: () => toast.error("Không thể kết nối đến máy chủ"),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => hrmKpiEvaluationsApi.submitSelfScore(evaluationId!, payload),
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success("Nộp phiếu đánh giá thành công!");
        refetchDetail();
      } else {
        toast.error(res.message);
      }
    },
  });

  const handleCalculate = () => {
    if (!selectedPeriod) {
      toast.error("Vui lòng chọn kỳ đánh giá");
      return;
    }
    setEvaluationId(null);
    setEvalDetail(null);
    calculateMutation.mutate(parseInt(selectedPeriod));
  };

  const handleUpdateDetail = (criteriaId: number, field: string, value: any) => {
    setFormDetails((prev) =>
      prev.map((d) => (d.criteriaId === criteriaId ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = () => {
    if (formDetails.some(d => d.scoringMethod === 'MANUAL' && d.selfScore === null)) {
      toast.error("Vui lòng điền đủ điểm Tự đánh giá cho các tiêu chí thủ công");
      return;
    }
    if (formDetails.some(d => d.scoringMethod === 'MANUAL' && !d.notes?.trim())) {
      toast.error("Vui lòng ghi rõ giải trình/chứng minh cho các tiêu chí thủ công");
      return;
    }

    submitMutation.mutate({ details: formDetails });
  };

  const isReadonly = evalDetail?.status === 'SUBMITTED' || evalDetail?.status === 'APPROVED';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Phiếu KPI Cá nhân
          </h2>
          <p className="text-muted-foreground mt-2">
            Thực hiện tự đánh giá hiệu suất công việc định kỳ
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Chọn kỳ đánh giá</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:max-w-[300px]">
                  <SelectValue placeholder="Chọn kỳ đánh giá..." />
                </SelectTrigger>
                <SelectContent>
                  {periodsData?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {calculateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 animate-spin" /> Đang lấy dữ liệu...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" /> Làm phiếu KPI
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isFetching && (
        <div className="flex justify-center p-12">
          <Calculator className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {evalDetail && !isFetching && (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <Card>
            <CardHeader className="bg-muted/50 border-b flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Chi tiết Phiếu đánh giá
                </CardTitle>
                <CardDescription className="mt-1">
                  Điền các điểm tự đánh giá đối với tiêu chí MANUAL (Thủ công)
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={
                  evalDetail.status === 'APPROVED' ? 'default' : 
                  evalDetail.status === 'SUBMITTED' ? 'secondary' : 
                  'outline'
                }>
                  {evalDetail.status === 'APPROVED' ? 'ĐÃ DUYỆT (CHỐT KẾT QUẢ)' : 
                   evalDetail.status === 'SUBMITTED' ? 'ĐÃ NỘP (CHỜ DUYỆT)' : 
                   'BẢN NHÁP (ĐANG TÍNH)'}
                </Badge>
                {evalDetail.status === 'APPROVED' && (
                  <div className="text-2xl font-black text-primary">
                    Tổng điểm: {evalDetail.totalScore}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[30%]">Tiêu chí</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-center">Hệ số</TableHead>
                    <TableHead className="text-center w-[120px]">Điểm tối đa</TableHead>
                    <TableHead className="text-center w-[150px]">Tự đánh giá</TableHead>
                    <TableHead className="text-center w-[150px]">Lãnh đạo chấm</TableHead>
                    <TableHead className="w-[25%]">Giải trình / Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formDetails.map((detail: any, idx: number) => {
                    const isAuto = detail.scoringMethod === 'AUTOMATIC';
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="font-semibold">{detail.criteriaName}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{detail.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isAuto ? "default" : "secondary"}>
                            {isAuto ? "Tự động" : "Thủ công"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium text-muted-foreground">{detail.weight}x</TableCell>
                        <TableCell className="text-center font-bold">{detail.baseScore}</TableCell>
                        
                        {/* Tự chấm */}
                        <TableCell className="text-center">
                          {isAuto ? (
                            <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">{detail.selfScore ?? 0}</span>
                          ) : (
                            <Input 
                              type="number" 
                              className="text-center font-bold"
                              value={detail.selfScore ?? ''} 
                              onChange={(e) => handleUpdateDetail(detail.criteriaId, 'selfScore', parseFloat(e.target.value))}
                              disabled={isReadonly}
                              placeholder="Nhập..."
                              max={detail.baseScore}
                              min={0}
                            />
                          )}
                        </TableCell>

                        {/* Lãnh đạo chấm */}
                        <TableCell className="text-center">
                          {detail.reviewerScore !== null ? (
                            <span className="font-black text-primary text-lg">{detail.reviewerScore}</span>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">Chưa duyệt</span>
                          )}
                        </TableCell>

                        {/* Giải trình */}
                        <TableCell>
                          {isAuto ? (
                            <div className="text-xs text-muted-foreground italic bg-muted p-2 rounded border">
                              {detail.notes}
                            </div>
                          ) : (
                            <Textarea 
                              className="min-h-[60px] text-xs resize-none"
                              value={detail.notes || ''}
                              onChange={(e) => handleUpdateDetail(detail.criteriaId, 'notes', e.target.value)}
                              disabled={isReadonly}
                              placeholder="Nhập chứng minh..."
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            {!isReadonly && (
              <CardFooter className="bg-muted/50 border-t p-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => refetchDetail()} disabled={submitMutation.isPending}>
                  Khôi phục (Reset)
                </Button>
                <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Đang gửi..." : <><Send className="w-4 h-4 mr-2"/> Gửi Phiếu Đánh Giá</>}
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Hiển thị chi tiết Task nếu có (chỉ để tham khảo) */}
          {evalDetail.tasks && evalDetail.tasks.length > 0 && (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Danh sách công việc đã tính điểm (Hỗ trợ hệ thống tự động)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên công việc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Điểm chuẩn</TableHead>
                      <TableHead>Điểm chốt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evalDetail.tasks.map((task: any) => (
                      <TableRow key={task.taskId}>
                        <TableCell className="text-xs">{task.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{task.baseScore}</TableCell>
                        <TableCell className="text-xs font-bold text-primary">{task.finalScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
