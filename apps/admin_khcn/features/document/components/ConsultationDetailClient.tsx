"use client";

import React from "react";
import {
  MessageSquareShare, Clock, Calendar, Download,
  Users, CheckCircle2, ChevronLeft, ArrowRight,
  Info, BarChart3, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import { PublicCommentModeration } from "@/features/document/components/PublicCommentModeration";

interface Props {
  consultationId: string;
}

export function ConsultationDetailClient({ consultationId }: Props) {
  const { useGetConsultation, useListResponses } = useDocuments();
  const { data: consultation, isLoading } = useGetConsultation(consultationId);
  const { data: responses, isLoading: isLoadingResponses } = useListResponses(consultationId);

  if (isLoading) return <div className="p-10 text-center text-muted-foreground animate-pulse">Đang tải thông tin chi tiết...</div>;

  if (!consultation) return (
    <div className="p-10 text-center space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
      <h2 className="text-xl font-bold">Không tìm thấy đợt lấy ý kiến</h2>
      <Link href="/services/documents/consultations">
        <Button variant="outline"><ChevronLeft className="h-4 w-4 mr-2" /> Quay lại danh sách</Button>
      </Link>
    </div>
  );

  const progress = consultation.totalUnits > 0 ? Math.round((consultation.totalResponses / consultation.totalUnits) * 100) : 0;

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <Link href="/services/documents/consultations" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mb-2">
            <ChevronLeft className="h-3 w-3" /> DANH SÁCH LẤY Ý KIẾN
          </Link>
          <h2 className="text-2xl font-black text-foreground leading-tight">{consultation.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge variant="outline" className="font-mono text-[10px]">ID: {consultationId.split('-')[0].toUpperCase()}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Bắt đầu: {new Date(consultation.createdAt).toLocaleDateString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Hạn chót: {new Date(consultation.deadline).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="font-bold"><Download className="h-4 w-4 mr-2" /> Tải dự thảo</Button>
          <Button size="sm" className="font-bold bg-primary shadow-lg shadow-primary/20">Tổng hợp báo cáo</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="moderation" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-11 mb-4">
              <TabsTrigger value="moderation" className="rounded-lg font-bold px-6">Kiểm duyệt công chúng</TabsTrigger>
              <TabsTrigger value="internal" className="rounded-lg font-bold px-6">Phản hồi đơn vị ({responses?.length || 0})</TabsTrigger>
              <TabsTrigger value="info" className="rounded-lg font-bold px-6">Thông tin chung</TabsTrigger>
            </TabsList>

            <TabsContent value="moderation" className="mt-0">
              <PublicCommentModeration consultationId={consultationId} />
            </TabsContent>

            <TabsContent value="internal" className="mt-0">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Danh sách phản hồi từ các đơn vị phối hợp
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingResponses ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">Đang tải phản hồi...</div>
                  ) : !responses?.length ? (
                    <div className="p-12 text-center text-muted-foreground italic text-sm">Chưa có đơn vị nào phản hồi.</div>
                  ) : (
                    <div className="divide-y">
                      {responses.map((res: any) => (
                        <div key={res.id} className="p-5 hover:bg-muted/5 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-foreground">{res.unitName || `Đơn vị ID: ${res.unitId}`}</p>
                              {res.respondedAt && <p className="text-[10px] text-muted-foreground">Phản hồi lúc: {new Date(res.respondedAt).toLocaleString('vi-VN')}</p>}
                            </div>
                            <Badge className={res.status === 'RESPONDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {res.status === 'RESPONDED' ? 'Đã phản hồi' : 'Đang chờ'}
                            </Badge>
                          </div>
                          {res.content && <div className="bg-muted/30 p-3 rounded-lg text-sm italic text-muted-foreground border mt-2">&ldquo;{res.content}&rdquo;</div>}
                          {res.fileId && <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-primary font-bold"><Download className="h-3 w-3 mr-1" /> Tải tệp đính kèm</Button>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Info className="h-5 w-5" /></div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Mô tả đợt lấy ý kiến</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{consultation.description || "Không có mô tả chi tiết."}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Cơ quan chủ trì</p>
                      <p className="text-sm font-bold">{consultation.issuerName || "Sở Khoa học và Công nghệ"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Trạng thái hệ thống</p>
                      <Badge className={consultation.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 shadow-none' : 'bg-slate-100 text-slate-700 shadow-none'}>
                        {consultation.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-foreground/5 rounded-3xl overflow-hidden bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Tiến độ tổng thể
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between items-end">
                <h3 className="text-5xl font-black">{progress}%</h3>
                <div className="text-right">
                  <p className="text-xs font-bold opacity-80">Hoàn thành</p>
                  <p className="text-sm font-black">{consultation.totalResponses} / {consultation.totalUnits}</p>
                </div>
              </div>
              <Progress value={progress} className="h-3 bg-white/20 border border-white/10" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black uppercase opacity-60">Đã xong</p>
                  <p className="text-lg font-black">{consultation.totalResponses}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black uppercase opacity-60">Còn lại</p>
                  <p className="text-lg font-black">{consultation.totalUnits - consultation.totalResponses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b bg-muted/10 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tóm tắt nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Thời gian còn lại:</p>
                <p className="text-sm font-black text-rose-600">
                  {Math.max(0, Math.ceil((new Date(consultation.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ngày
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Mức độ ưu tiên:</p>
                <Badge className={consultation.isUrgent ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                  {consultation.isUrgent ? 'HỎA TỐC' : 'BÌNH THƯỜNG'}
                </Badge>
              </div>
              <Button variant="outline" className="w-full border-dashed rounded-xl h-12 text-xs font-bold mt-2">
                Gửi thông báo nhắc nhở
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
