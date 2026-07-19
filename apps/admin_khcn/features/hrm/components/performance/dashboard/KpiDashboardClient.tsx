"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { BarChart2, Target } from "lucide-react";
import { PeriodSelector } from "./PeriodSelector";
import { DashboardStatsCards } from "./DashboardStatsCards";
import { DashboardCharts } from "./DashboardCharts";

export function KpiDashboardClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Heading level="h1" className="flex items-center gap-2 font-black">
            <BarChart2 className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            Dashboard KPI Tổng Hợp
          </Heading>
          <Text variant="muted" className="font-medium mt-2">
            Báo cáo kết quả thực hiện, điểm KPI trung bình theo từng Phòng/Ban/Đơn vị
          </Text>
        </div>

        <div className="w-full md:w-[300px]">
          <PeriodSelector selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />
        </div>
      </div>

      {!selectedPeriod ? (
        <Card className="shadow-sm bg-card border-dashed border-2 border-border mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <Target className="h-14 w-14 md:h-16 md:w-16 text-muted-foreground/50 mb-4" />
            <Heading level="h4">Vui lòng chọn Kỳ đánh giá</Heading>
            <Text variant="muted" className="mt-2 max-w-sm mx-auto font-normal">
              Dữ liệu thống kê KPI sẽ được tính toán và hiển thị tự động dựa trên kỳ đánh giá bạn chọn.
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 mt-6">
          <DashboardStatsCards selectedPeriod={selectedPeriod} />
          <DashboardCharts selectedPeriod={selectedPeriod} />
        </div>
      )}
    </div>
  );
}
