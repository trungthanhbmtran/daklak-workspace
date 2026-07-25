import React from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  consultationId: string;
  consultation: any;
}

export function ConsultationHeader({ consultationId, consultation }: Props) {
  return (
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
        <Button variant="outline" size="sm" className="font-bold" iconStart={<Download className="h-4 w-4" />}>Tải dự thảo</Button>
        <Button size="sm" className="font-bold bg-primary shadow-lg shadow-primary/20">Tổng hợp báo cáo</Button>
      </div>
    </div>
  );
}
