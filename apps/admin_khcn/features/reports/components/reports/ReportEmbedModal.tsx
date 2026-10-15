"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Code2,
  Copy,
  Check,
  LayoutDashboard,
  Eye,
  FileCheck2,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { EmbeddedReportWidget } from "../EmbeddedReportWidget";

interface ReportEmbedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
  reportCode?: string;
  reportName?: string;
  reportDescription?: string;
}

export function ReportEmbedModal({
  open,
  onOpenChange,
  reportId,
  reportCode,
  reportName,
  reportDescription,
}: ReportEmbedModalProps) {
  const [copied, setCopied] = useState(false);
  const [columns, setColumns] = useState<1 | 2>(2);
  const [chartHeight, setChartHeight] = useState<number>(240);
  const [showDetailLink, setShowDetailLink] = useState(true);
  const [allowToggleType, setAllowToggleType] = useState(true);

  const identifier = reportCode || reportId;

  const generatedSnippet = `<EmbeddedReportWidget
  reportIdOrCode="${identifier}"
  columns={${columns}}
  chartHeight={${chartHeight}}
  showDetailLink={${showDetailLink}}
  allowToggleType={${allowToggleType}}
/>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSnippet);
    setCopied(true);
    toast.success("Đã sao chép mã nhúng vào clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border bg-background">
        <DialogHeader className="p-5 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Thụ Hưởng Báo Cáo
            </Badge>
            <DialogTitle className="text-lg font-bold text-foreground">
              Nhúng Báo Cáo Vào Dashboard Dịch Vụ
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Sử dụng component nhúng để hiển thị biểu đồ phân tích thực tế từ báo cáo{" "}
            <strong className="text-foreground">{reportName || `#${reportId}`}</strong> trực tiếp lên các Dashboard chuyên ngành.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Cấu hình nhanh thuộc tính widget */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border">
            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Số cột biểu đồ
              </Label>
              <div className="flex gap-1.5 mt-1.5">
                <Button
                  type="button"
                  variant={columns === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setColumns(1)}
                  className="h-7 text-xs flex-1 rounded-lg"
                >
                  1 Cột
                </Button>
                <Button
                  type="button"
                  variant={columns === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setColumns(2)}
                  className="h-7 text-xs flex-1 rounded-lg"
                >
                  2 Cột
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Độ cao biểu đồ
              </Label>
              <div className="flex gap-1.5 mt-1.5">
                {[200, 240, 300].map((h) => (
                  <Button
                    key={h}
                    type="button"
                    variant={chartHeight === h ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHeight(h)}
                    className="h-7 text-xs flex-1 rounded-lg px-1"
                  >
                    {h}px
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Liên kết chi tiết
              </Label>
              <div className="flex gap-1.5 mt-1.5">
                <Button
                  type="button"
                  variant={showDetailLink ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDetailLink(!showDetailLink)}
                  className="h-7 text-xs w-full rounded-lg"
                >
                  {showDetailLink ? "Đang bật" : "Đang tắt"}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Đổi loại Cột/Đường
              </Label>
              <div className="flex gap-1.5 mt-1.5">
                <Button
                  type="button"
                  variant={allowToggleType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAllowToggleType(!allowToggleType)}
                  className="h-7 text-xs w-full rounded-lg"
                >
                  {allowToggleType ? "Cho phép" : "Khóa"}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs: Xem trước và Lấy mã nguồn */}
          <Tabs defaultValue="preview" className="w-full space-y-3">
            <TabsList className="grid grid-cols-3 h-9 p-1 bg-muted/60 rounded-xl">
              <TabsTrigger value="preview" className="text-xs font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Xem trước (Preview)
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Mã nhúng Component
              </TabsTrigger>
              <TabsTrigger value="destinations" className="text-xs font-semibold flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard khả dụng
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Preview */}
            <TabsContent value="preview" className="mt-0 space-y-2">
              <div className="border rounded-xl p-3 bg-card shadow-2xs">
                <EmbeddedReportWidget
                  reportIdOrCode={identifier}
                  columns={columns}
                  chartHeight={chartHeight}
                  showDetailLink={showDetailLink}
                  allowToggleType={allowToggleType}
                />
              </div>
            </TabsContent>

            {/* Tab 2: Code Snippet */}
            <TabsContent value="code" className="mt-0 space-y-3">
              <div className="relative rounded-xl overflow-hidden border bg-slate-950 text-slate-100 p-4 font-mono text-xs shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3 text-slate-400">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Code2 className="w-4 h-4 text-primary" /> React / Next.js Component
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 px-2.5 text-xs text-slate-200 hover:text-white hover:bg-slate-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Sao chép mã
                      </>
                    )}
                  </Button>
                </div>
                <pre className="text-emerald-400 overflow-x-auto py-1 leading-relaxed">
                  <code>{generatedSnippet}</code>
                </pre>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-primary" /> Cách dùng trong màn hình Dashboard:
                </p>
                <p>1. Import component: <code className="bg-background px-1.5 py-0.5 rounded border font-mono text-[11px]">import &#123; EmbeddedReportWidget &#125; from &apos;@/features/reports&apos;;</code></p>
                <p>2. Đặt component vào vị trí mong muốn trên JSX của Dashboard.</p>
              </div>
            </TabsContent>

            {/* Tab 3: Dashboard Destinations */}
            <TabsContent value="destinations" className="mt-0 space-y-2.5">
              <div className="grid gap-2.5">
                <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Dashboard Quản lý Văn bản</h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Đã nhúng REP_DOC_STATS
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Đường dẫn: /services/documents (Sổ văn bản đến, đi, lưu chuyển)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Dashboard Công việc & Nhiệm vụ / HRM</h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Đã nhúng REP_HRM_TASKS
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Đường dẫn: /services/hrm/work-plans/tasks/dashboard (Tiến độ giao việc, đánh giá)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Dashboard Quản lý Tin bài & Cổng Thông tin</h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Đã nhúng REP_POST_STATS
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Đường dẫn: /services/posts (Xuất bản tin tức, chuyên mục, tương tác công dân)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Cổng Ứng dụng Nội bộ (Hub Tổng quan)</h4>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Đã nhúng REP_BTCTU_SOP_KPI
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Đường dẫn: /hub (Bức tranh tổng quan điều hành toàn cơ quan)</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
