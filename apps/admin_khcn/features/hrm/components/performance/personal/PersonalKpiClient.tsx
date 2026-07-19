/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Award, CheckCircle2, Send } from "lucide-react";
import { hrmKpiEvaluationsApi, hrmKpiPeriodsApi } from "@/features/hrm/api/kpis.api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function PersonalKpiClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [staffingSlotId, setStaffingSlotId] = useState<string>("");
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  const [evalDetail, setEvalDetail] = useState<any>(null);
  const [formDetails, setFormDetails] = useState<any[]>([]);

  // Fetch periods
  const { data: periodsData } = useQuery({
    queryKey: ["hrm-kpi-periods"],
    queryFn: () => hrmKpiPeriodsApi.getPeriods().then((res: any) => res.data || []),
  });

  // Fetch evaluation details when evaluationId changes
  // eslint-disable-next-line unused-imports/no-unused-vars
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
    mutationFn: (payload: { periodId: number, staffingSlotId?: number }) => hrmKpiEvaluationsApi.calculatePersonal(payload),
    onSuccess: (res: any) => {
      const evalId = res?.evaluationId || res?.data?.evaluationId;
      if (res?.success && evalId) {
        setEvaluationId(evalId);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể kết nối đến máy chủ";
      toast.error(message);
    },
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
    calculateMutation.mutate({ 
      periodId: parseInt(selectedPeriod),
      staffingSlotId: staffingSlotId ? parseInt(staffingSlotId) : undefined
    });
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
            
            <div className="space-y-2 flex-1 max-w-[200px]">
              <label className="text-sm font-medium">Vị trí (Slot ID)</label>
              <Input 
                type="number" 
                placeholder="Để trống = Mặc định" 
                value={staffingSlotId}
                onChange={(e) => setStaffingSlotId(e.target.value)}
              />
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
              <ResponsiveTable
                data={formDetails}
                keyExtractor={(detail) => String(detail.criteriaId)}
                columns={[
                  {
                    header: "Tiêu chí",
                    className: "w-[30%]",
                    cell: (detail: any) => (
                      <div>
                        <div className="font-semibold">{detail.criteriaName}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{detail.description}</div>
                      </div>
                    )
                  },
                  {
                    header: "Loại",
                    cell: (detail: any) => {
                      const isAuto = detail.scoringMethod === 'AUTOMATIC';
                      const isIntegration = detail.scoringMethod === 'INTEGRATION_API';
                      return (
                        <Badge variant={isAuto ? "default" : isIntegration ? "destructive" : "secondary"}>
                          {isAuto ? "Tự động" : isIntegration ? "Liên thông" : "Thủ công"}
                        </Badge>
                      );
                    }
                  },
                  {
                    header: "Hệ số",
                    className: "text-center",
                    cell: (detail: any) => <div className="text-center font-medium text-muted-foreground">{detail.weight}x</div>
                  },
                  {
                    header: "Điểm tối đa",
                    className: "text-center w-[120px]",
                    cell: (detail: any) => <div className="text-center font-bold">{detail.baseScore}</div>
                  },
                  {
                    header: "Tự đánh giá",
                    className: "text-center w-[150px]",
                    cell: (detail: any) => {
                      const isAuto = detail.scoringMethod === 'AUTOMATIC';
                      const isIntegration = detail.scoringMethod === 'INTEGRATION_API';
                      const isReadonlyItem = isAuto || isIntegration;
                      return (
                        <div className="flex justify-center">
                          {isReadonlyItem ? (
                            <span className={`font-bold px-3 py-1 rounded-md border ${isIntegration ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-primary bg-primary/10 border-primary/20'}`}>{detail.selfScore ?? 0}</span>
                          ) : (
                            <Input 
                              type="number" 
                              className="text-center font-bold max-w-[100px]"
                              value={detail.selfScore ?? ''} 
                              onChange={(e) => handleUpdateDetail(detail.criteriaId, 'selfScore', parseFloat(e.target.value))}
                              disabled={isReadonly}
                              placeholder="Nhập..."
                              max={detail.baseScore}
                              min={0}
                            />
                          )}
                        </div>
                      );
                    }
                  },
                  {
                    header: "Lãnh đạo chấm",
                    className: "text-center w-[150px]",
                    cell: (detail: any) => (
                      <div className="text-center">
                        {detail.reviewerScore !== null ? (
                          <span className="font-black text-primary text-lg">{detail.reviewerScore}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">Chưa duyệt</span>
                        )}
                      </div>
                    )
                  },
                  {
                    header: "Giải trình / Ghi chú",
                    className: "w-[25%]",
                    cell: (detail: any) => {
                      const isAuto = detail.scoringMethod === 'AUTOMATIC';
                      const isIntegration = detail.scoringMethod === 'INTEGRATION_API';
                      const isReadonlyItem = isAuto || isIntegration;
                      return isReadonlyItem ? (
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
                      );
                    }
                  }
                ]}
              />
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
                <ResponsiveTable
                  data={evalDetail.tasks}
                  keyExtractor={(task) => String(task.taskId)}
                  columns={[
                    {
                      header: "Tên công việc",
                      cell: (task: any) => <div className="text-xs">{task.title}</div>
                    },
                    {
                      header: "Trạng thái",
                      cell: (task: any) => <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                    },
                    {
                      header: "Điểm chuẩn",
                      cell: (task: any) => <div className="text-xs">{task.baseScore}</div>
                    },
                    {
                      header: "Điểm chốt",
                      cell: (task: any) => <div className="text-xs font-bold text-primary">{task.finalScore}</div>
                    }
                  ]}
                />
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
