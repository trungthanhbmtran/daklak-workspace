/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Search, FileText, UserCheck, Award } from "lucide-react";
import { hrmKpiEvaluationsApi } from "@/features/hrm/api/kpis.api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/components/ui/typography";

export function ReviewKpiClient() {
  const [selectedEvalId, setSelectedEvalId] = useState<number | null>(null);
  const [formDetails, setFormDetails] = useState<any[]>([]);

  // Lấy danh sách phiếu chờ duyệt
  const { data: evalsData, refetch: refetchEvals, isLoading } = useQuery({
    queryKey: ["hrm-kpi-evaluations"],
    queryFn: async () => {
      const res = await hrmKpiEvaluationsApi.list();
      return res?.data?.filter((e: any) => e.status === 'SUBMITTED') || [];
    },
  });

  // Lấy chi tiết phiếu
  const { data: evalDetail, isFetching: isLoadingDetail } = useQuery({
    queryKey: ["hrm-kpi-eval-detail-review", selectedEvalId],
    queryFn: async () => {
      if (!selectedEvalId) return null;
      const res = await hrmKpiEvaluationsApi.getDetail(selectedEvalId);
      if (res.success) {
        const parsedData = JSON.parse(res.data);
        
        // Khởi tạo reviewerScore mặc định bằng selfScore nếu chưa có
        const mappedDetails = (parsedData.details || []).map((d: any) => ({
          ...d,
          reviewerScore: d.reviewerScore !== null ? d.reviewerScore : (d.selfScore || 0)
        }));
        
        setFormDetails(mappedDetails);
        return parsedData;
      }
      return null;
    },
    enabled: !!selectedEvalId,
  });

  const approveMutation = useMutation({
    mutationFn: (payload: any) => hrmKpiEvaluationsApi.approveReviewerScore(selectedEvalId!, payload),
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success("Đã duyệt phiếu đánh giá thành công!");
        setSelectedEvalId(null);
        refetchEvals();
      } else {
        toast.error(res.message);
      }
    },
  });

  const handleUpdateDetail = (criteriaId: number, value: any) => {
    setFormDetails((prev) =>
      prev.map((d) => (d.criteriaId === criteriaId ? { ...d, reviewerScore: value } : d))
    );
  };

  const handleApprove = () => {
    if (formDetails.some(d => d.reviewerScore === null || isNaN(d.reviewerScore))) {
      toast.error("Vui lòng nhập điểm hợp lệ cho tất cả các tiêu chí");
      return;
    }
    approveMutation.mutate({ details: formDetails });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">
            Duyệt Đánh Giá KPI
          </Heading>
          <Text variant="muted" className="mt-2">
            Danh sách phiếu đánh giá đang chờ phê duyệt.
          </Text>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Danh sách chờ duyệt
          </CardTitle>
          <CardDescription>
            Bấm vào từng nhân sự để xem chi tiết bản giải trình và chốt điểm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            loading={isLoading}
            data={evalsData || []}
            keyExtractor={(ev) => String(ev.id)}
            emptyMessage="Không có phiếu KPI nào đang chờ duyệt."
            columns={[
              {
                header: "Mã phiếu",
                cell: (ev: any) => <div className="font-medium text-muted-foreground">#{ev.id}</div>
              },
              {
                header: "Nhân viên",
                cell: (ev: any) => <div className="font-bold">{ev.employeeName || ev.employeeCode}</div>
              },
              {
                header: "Trạng thái",
                cell: () => <Badge variant="secondary">Chờ duyệt</Badge>
              },
              {
                header: "Thao tác",
                cell: (ev: any) => (
                  <Button size="sm" onClick={() => setSelectedEvalId(ev.id)}>
                    <UserCheck className="w-4 h-4 mr-2" /> Duyệt phiếu
                  </Button>
                )
              }
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvalId} onOpenChange={(open) => !open && setSelectedEvalId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Award className="w-6 h-6 text-primary" />
              <CardDescription className="text-sm">
                Chấm điểm chính thức: <Text as="span" className="text-primary">{evalDetail?.employee?.fullName || evalDetail?.employeeCode}</Text>
              </CardDescription>
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 flex justify-center"><Search className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : evalDetail && (
            <div className="space-y-6 mt-4">
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <ResponsiveTable
                  data={formDetails}
                  keyExtractor={(detail) => String(detail.criteriaId)}
                  columns={[
                    {
                      header: "Tiêu chí",
                      className: "w-[25%]",
                      cell: (detail: any) => (
                        <div>
                          <div className="font-semibold">{detail.criteriaName}</div>
                          <Text variant="small" className="text-[11px] text-muted-foreground mt-1 line-clamp-2 font-normal">{detail.description}</Text>
                          {detail.scoringMethod === 'AUTOMATIC' && <Badge variant="secondary" className="mt-2">Tự động (Máy tính)</Badge>}
                          {detail.scoringMethod === 'INTEGRATION_API' && <Badge variant="destructive" className="mt-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Liên thông (LGSP)</Badge>}
                        </div>
                      )
                    },
                    {
                      header: "Điểm chuẩn",
                      className: "w-[10%] text-center",
                      cell: (detail: any) => <div className="text-center font-bold text-muted-foreground">{detail.baseScore}</div>
                    },
                    {
                      header: "Giải trình / Ghi chú của NV",
                      className: "w-[30%]",
                      cell: (detail: any) => (
                        <Text variant="small" className="bg-background p-3 rounded-md border min-h-[60px] whitespace-pre-wrap leading-relaxed shadow-sm font-normal block">
                          {detail.notes || <Text as="span" variant="small" className="text-muted-foreground italic font-normal">Không có giải trình</Text>}
                        </Text>
                      )
                    },
                    {
                      header: "Tự chấm",
                      className: "w-[15%] text-center",
                      cell: (detail: any) => (
                        <div className="text-center">
                          <Text as="span" weight="bold" className="px-3 py-1 rounded-md text-primary bg-primary/10">
                            {detail.selfScore || 0}
                          </Text>
                        </div>
                      )
                    },
                    {
                      header: "Lãnh đạo chấm",
                      className: "w-[20%] text-center bg-muted border-l",
                      cell: (detail: any) => (
                        <div className="flex justify-center p-2">
                          <Input 
                            type="number" 
                            className="text-center font-black text-lg h-12 w-full max-w-[120px]"
                            value={detail.reviewerScore ?? ''} 
                            onChange={(e) => handleUpdateDetail(detail.criteriaId, parseFloat(e.target.value))}
                            placeholder="Nhập điểm..."
                            max={detail.baseScore * 2}
                            min={0}
                          />
                        </div>
                      )
                    }
                  ]}
                />
              </div>

              {/* Chi tiết Task */}
              {evalDetail.tasks && evalDetail.tasks.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <Text variant="small" weight="bold" className="bg-muted/50 p-3 border-b flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Bảng đối chiếu Công việc (Dùng cho Tiêu chí Tự động)
                  </Text>
                  <ResponsiveTable
                    data={evalDetail.tasks}
                    keyExtractor={(t) => String(t.taskId)}
                    columns={[
                      {
                        header: "Tên công việc",
                        cell: (t: any) => <div className="text-xs font-medium">{t.title}</div>
                      },
                      {
                        header: "Điểm chuẩn",
                        cell: (t: any) => <div className="text-xs">{t.baseScore}</div>
                      },
                      {
                        header: "Điểm hệ thống tự tính (Thưởng/Phạt)",
                        cell: (t: any) => <div className="text-xs font-bold text-primary">{t.finalScore}</div>
                      }
                    ]}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedEvalId(null)}>Hủy bỏ</Button>
                <Button className="h-10 px-8" onClick={handleApprove} disabled={approveMutation.isPending}>
                  {approveMutation.isPending ? "Đang xử lý..." : <><CheckCircle2 className="w-4 h-4 mr-2"/> Chốt điểm (Approve)</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
