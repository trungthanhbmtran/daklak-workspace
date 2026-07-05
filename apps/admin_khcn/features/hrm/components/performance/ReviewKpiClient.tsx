"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Search, FileText, UserCheck, Award } from "lucide-react";
import { hrmKpiEvaluationsApi } from "@/features/hrm/api/kpis.api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
          <h2 className="text-3xl font-bold tracking-tight">
            Duyệt KPI Nhân viên
          </h2>
          <p className="text-muted-foreground mt-2">
            Danh sách các phiếu đánh giá KPI đang chờ Lãnh đạo nghiệm thu
          </p>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Đang tải...</TableCell></TableRow>
              ) : evalsData?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có phiếu KPI nào đang chờ duyệt.</TableCell></TableRow>
              ) : (
                evalsData?.map((ev: any) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium text-muted-foreground">#{ev.id}</TableCell>
                    <TableCell className="font-bold">{ev.employeeName || ev.employeeCode}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Chờ duyệt</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setSelectedEvalId(ev.id)}>
                        <UserCheck className="w-4 h-4 mr-2" /> Duyệt phiếu
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvalId} onOpenChange={(open) => !open && setSelectedEvalId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Award className="w-6 h-6 text-primary" />
              Chấm điểm chính thức: <span className="text-primary">{evalDetail?.employee?.fullName || evalDetail?.employeeCode}</span>
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 flex justify-center"><Search className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : evalDetail && (
            <div className="space-y-6 mt-4">
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[25%] font-bold">Tiêu chí</TableHead>
                      <TableHead className="w-[10%] text-center font-bold">Điểm chuẩn</TableHead>
                      <TableHead className="w-[30%] font-bold">Giải trình / Ghi chú của NV</TableHead>
                      <TableHead className="w-[15%] text-center font-bold">Tự chấm</TableHead>
                      <TableHead className="w-[20%] text-center font-bold bg-muted border-l">
                        Lãnh đạo chấm
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formDetails.map((detail: any, idx: number) => {
                      const isAuto = detail.scoringMethod === 'AUTOMATIC';
                      return (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="font-semibold">{detail.criteriaName}</div>
                            <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{detail.description}</div>
                            {isAuto && <Badge variant="secondary" className="mt-2">Tự động (Máy tính)</Badge>}
                            {detail.scoringMethod === 'INTEGRATION_API' && <Badge variant="destructive" className="mt-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Liên thông (LGSP)</Badge>}
                          </TableCell>
                          <TableCell className="text-center font-bold text-muted-foreground">{detail.baseScore}</TableCell>
                          
                          <TableCell>
                            <div className="text-xs bg-background p-3 rounded-md border min-h-[60px] whitespace-pre-wrap leading-relaxed shadow-sm">
                              {detail.notes || <span className="text-muted-foreground italic">Không có giải trình</span>}
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <span className="text-lg font-bold px-3 py-1 rounded-md text-primary bg-primary/10">
                              {detail.selfScore ?? 0}
                            </span>
                          </TableCell>

                          <TableCell className="text-center border-l bg-muted/30">
                            <Input 
                              type="number" 
                              className="text-center font-black text-lg h-12"
                              value={detail.reviewerScore ?? ''} 
                              onChange={(e) => handleUpdateDetail(detail.criteriaId, parseFloat(e.target.value))}
                              placeholder="Nhập điểm..."
                              max={detail.baseScore * 2}
                              min={0}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Chi tiết Task */}
              {evalDetail.tasks && evalDetail.tasks.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 p-3 border-b font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Bảng đối chiếu Công việc (Dùng cho Tiêu chí Tự động)
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên công việc</TableHead>
                        <TableHead>Điểm chuẩn</TableHead>
                        <TableHead>Điểm hệ thống tự tính (Thưởng/Phạt)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evalDetail.tasks.map((t: any) => (
                        <TableRow key={t.taskId}>
                          <TableCell className="text-xs font-medium">{t.title}</TableCell>
                          <TableCell className="text-xs">{t.baseScore}</TableCell>
                          <TableCell className="text-xs font-bold text-primary">{t.finalScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
