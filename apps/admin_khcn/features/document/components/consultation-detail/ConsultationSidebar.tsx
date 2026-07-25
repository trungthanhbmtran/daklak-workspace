import React from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  consultation: any;
  progress: number;
}

export function ConsultationSidebar({ consultation, progress }: Props) {
  return (
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
  );
}
