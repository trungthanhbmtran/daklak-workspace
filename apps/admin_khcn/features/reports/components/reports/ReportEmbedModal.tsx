"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { EmbeddedReportWidget } from "../EmbeddedReportWidget";
import {
  DASHBOARD_TARGETS,
  isReportAssignedToDashboard,
  toggleReportAssignment,
  DashboardTarget,
} from "../../utils/dashboardAssignment";

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
  const [columns, setColumns] = useState<1 | 2>(2);
  const [chartHeight, setChartHeight] = useState<number>(240);
  const [showDetailLink, setShowDetailLink] = useState(true);
  const [allowToggleType, setAllowToggleType] = useState(true);
  const [activeTab, setActiveTab] = useState<"assign" | "preview">("assign");

  // State theo dõi các dashboard đã được gán
  const [assignedStatus, setAssignedStatus] = useState<Record<string, boolean>>({});

  const identifier = reportCode || reportId;

  // Cập nhật trạng thái gán khi mở Sheet hoặc khi có thay đổi
  const refreshAssignmentStatus = () => {
    const statusMap: Record<string, boolean> = {};
    for (const target of DASHBOARD_TARGETS) {
      statusMap[target.key] = isReportAssignedToDashboard(target.key, identifier);
    }
    setAssignedStatus(statusMap);
  };

  useEffect(() => {
    if (open) {
      refreshAssignmentStatus();
    }
  }, [open, identifier]);

  // Xử lý bật/tắt gán báo cáo cho một dashboard dịch vụ
  const handleToggle = (target: DashboardTarget) => {
    const isNowAssigned = toggleReportAssignment(target.key, identifier, {
      columns,
      chartHeight,
      showDetailLink,
      allowToggleType,
    });

    setAssignedStatus((prev) => ({
      ...prev,
      [target.key]: isNowAssigned,
    }));

    if (isNowAssigned) {
      toast.success(`Đã gán báo cáo vào ${target.name}!`, {
        description: "Dashboard của dịch vụ này sẽ hiển thị biểu đồ phân tích trực quan.",
      });
    } else {
      toast.info(`Đã gỡ báo cáo khỏi ${target.name}.`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 flex flex-col h-full bg-background border-l shadow-2xl overflow-hidden min-w-0"
      >
        {/* Header Sheet */}
        <SheetHeader className="p-5 pb-4 border-b bg-muted/20 shrink-0 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap min-w-0">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Thụ Hưởng Báo Cáo
            </Badge>
            <SheetTitle className="text-base sm:text-lg font-bold text-foreground truncate min-w-0">
              Gán Báo Cáo Vào Dashboard Dịch Vụ
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            Chọn các phân hệ dịch vụ bên dưới để gán biểu đồ phân tích từ báo cáo{" "}
            <strong className="text-foreground">{reportName || `#${reportId}`}</strong> trực tiếp lên màn hình Dashboard của dịch vụ đó.
          </SheetDescription>
        </SheetHeader>

        {/* Nội dung Sheet */}
        {open && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-w-0">
            {/* Tùy chỉnh nhanh thuộc tính biểu đồ */}
            <div className="bg-muted/30 p-4 rounded-xl border space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  Cấu hình Hiển thị Khi Gán
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Mã báo cáo: <code className="bg-background px-1.5 py-0.5 rounded border font-mono font-bold text-primary">{identifier}</code>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Số cột hiển thị
                  </Label>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant={columns === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColumns(1)}
                      className="h-7 text-xs flex-1 rounded-lg font-medium"
                    >
                      1 Cột
                    </Button>
                    <Button
                      type="button"
                      variant={columns === 2 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColumns(2)}
                      className="h-7 text-xs flex-1 rounded-lg font-medium"
                    >
                      2 Cột
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Chiều cao biểu đồ
                  </Label>
                  <div className="flex gap-1">
                    {[200, 240, 300].map((h) => (
                      <Button
                        key={h}
                        type="button"
                        variant={chartHeight === h ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartHeight(h)}
                        className="h-7 text-xs flex-1 rounded-lg px-1 font-medium"
                      >
                        {h}px
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Liên kết chi tiết
                  </Label>
                  <Button
                    type="button"
                    variant={showDetailLink ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowDetailLink(!showDetailLink)}
                    className="h-7 text-xs w-full rounded-lg font-medium"
                  >
                    {showDetailLink ? "Đang bật" : "Đang tắt"}
                  </Button>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Đổi Cột / Đường
                  </Label>
                  <Button
                    type="button"
                    variant={allowToggleType ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAllowToggleType(!allowToggleType)}
                    className="h-7 text-xs w-full rounded-lg font-medium"
                  >
                    {allowToggleType ? "Cho phép" : "Khóa"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Thanh chuyển chế độ: Danh sách Gán vs Xem trước */}
            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <div className="inline-flex p-1 bg-muted/70 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("assign")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === "assign"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                  Chọn Dashboard Gán Vào ({Object.values(assignedStatus).filter(Boolean).length}/{DASHBOARD_TARGETS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === "preview"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Xem Trước Biểu Đồ
                </button>
              </div>

              <span className="text-xs text-muted-foreground hidden sm:inline">
                Gạt nút để Bật/Tắt gán biểu đồ vào từng dịch vụ
              </span>
            </div>

            {/* Tab 1: Danh sách các Dashboard để gán */}
            {activeTab === "assign" && (
              <div className="space-y-3 min-w-0">
                <div className="grid gap-3 min-w-0">
                  {DASHBOARD_TARGETS.map((target) => {
                    const isAssigned = !!assignedStatus[target.key];
                    return (
                      <div
                        key={target.key}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 ${
                          isAssigned
                            ? "bg-primary/5 border-primary/30 shadow-2xs"
                            : "bg-card border-border/80 hover:border-border"
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-foreground">
                              {target.name}
                            </h4>
                            {isAssigned ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5">
                                <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Đang hiển thị
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px] font-normal">
                                Chưa gán
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {target.description}
                          </p>
                          <div className="pt-1 flex items-center gap-2">
                            <Link
                              href={target.href}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                            >
                              Truy cập Dashboard <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                        {/* Nút Gạt Switch Gán Trực Tiếp */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                          <span className="text-xs font-semibold text-foreground">
                            {isAssigned ? "Đã gán" : "Chưa gán"}
                          </span>
                          <Switch
                            checked={isAssigned}
                            onCheckedChange={() => handleToggle(target)}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Xem trước trực tiếp biểu đồ */}
            {activeTab === "preview" && (
              <div className="space-y-2 min-w-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Trực quan hóa thực tế sẽ xuất hiện trên Dashboard sau khi gán:</span>
                  <Badge variant="outline" className="text-[10px]">
                    {columns} Cột • {chartHeight}px
                  </Badge>
                </div>
                <div className="border rounded-xl p-2 sm:p-3 bg-card shadow-2xs min-w-0 overflow-hidden">
                  <EmbeddedReportWidget
                    reportIdOrCode={identifier}
                    columns={columns}
                    chartHeight={chartHeight}
                    showDetailLink={showDetailLink}
                    allowToggleType={allowToggleType}
                    collapsible={false}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
