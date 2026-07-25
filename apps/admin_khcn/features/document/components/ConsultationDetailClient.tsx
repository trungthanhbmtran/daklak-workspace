/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Info, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import { PublicCommentModeration } from "@/features/document/components/PublicCommentModeration";

import { ConsultationHeader } from "./consultation-detail/ConsultationHeader";
import { InternalResponsesTab } from "./consultation-detail/InternalResponsesTab";
import { ConsultationSidebar } from "./consultation-detail/ConsultationSidebar";

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
        <Button variant="outline" iconStart={<ChevronLeft className="h-4 w-4" />}>Quay lại danh sách</Button>
      </Link>
    </div>
  );

  const progress = consultation.totalUnits > 0 ? Math.round((consultation.totalResponses / consultation.totalUnits) * 100) : 0;

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <ConsultationHeader consultationId={consultationId} consultation={consultation} />

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
              <InternalResponsesTab responses={responses} isLoadingResponses={isLoadingResponses} />
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

        <ConsultationSidebar consultation={consultation} progress={progress} />
      </div>
    </div>
  );
}
