/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Plus, LayoutTemplate, MoreVertical, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportBuilder } from "./ReportBuilder";
import dynamic from "next/dynamic";

const ChartRenderer = dynamic(() => import("./ChartRenderer").then(m => m.ChartRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[300px] bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
      <span className="text-slate-400 text-sm">Đang tải biểu đồ...</span>
    </div>
  ),
});
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// For demo purposes, we define the mock data structure here to render the saved charts
const MOCK_DATA = {
  "api-1": [
    { date: "Thứ 2", requests: 120, success_rate: 98 },
    { date: "Thứ 3", requests: 250, success_rate: 95 },
    { date: "Thứ 4", requests: 180, success_rate: 99 },
    { date: "Thứ 5", requests: 300, success_rate: 92 },
    { date: "Thứ 6", requests: 280, success_rate: 97 },
    { date: "Thứ 7", requests: 400, success_rate: 88 },
    { date: "CN", requests: 150, success_rate: 99 },
  ],
  "api-2": [
    { month: "Jan", records_synced: 1500, errors: 12 },
    { month: "Feb", records_synced: 2300, errors: 5 },
    { month: "Mar", records_synced: 1800, errors: 8 },
    { month: "Apr", records_synced: 3200, errors: 2 },
  ],
  "db-1": [
    { department: "Kế toán", user_count: 15, active: 12 },
    { department: "Kỹ thuật", user_count: 45, active: 40 },
    { department: "Nhân sự", user_count: 8, active: 8 },
    { department: "Kinh doanh", user_count: 60, active: 55 },
  ],
  "db-2": [
    { type: "Chuyển tiền", amount: 1500000, count: 120 },
    { type: "Thanh toán", amount: 850000, count: 350 },
    { type: "Rút tiền", amount: 400000, count: 45 },
  ]
};

export function ReportDashboard() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [widgets, setWidgets] = useState<any[]>([
    {
      id: "w-1",
      title: "Lưu lượng Request (7 ngày)",
      sourceId: "api-1",
      chartType: "bar",
      xAxisKey: "date",
      yAxisKey: "requests"
    },
    {
      id: "w-2",
      title: "Tỷ lệ Thành công (%)",
      sourceId: "api-1",
      chartType: "line",
      xAxisKey: "date",
      yAxisKey: "success_rate"
    },
    {
      id: "w-3",
      title: "Nhân sự theo Phòng ban",
      sourceId: "db-1",
      chartType: "pie",
      xAxisKey: "department",
      yAxisKey: "user_count"
    }
  ]);

  if (isBuilding) {
    return (
      <ReportBuilder 
        onBack={() => setIsBuilding(false)} 
        onSave={(config) => {
          setWidgets([...widgets, config]);
          setIsBuilding(false);
        }} 
      />
    );
  }

  const handleDeleteWidget = (id: string) => {
    if (confirm("Xóa biểu đồ này khỏi Dashboard?")) {
      setWidgets(widgets.filter(w => w.id !== id));
      toast.success("Đã xóa biểu đồ");
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            Nhóm Bảng Báo Cáo
          </h2>
          <p className="text-slate-500 text-sm mt-1">Tổng hợp các biểu đồ phân tích và thống kê hệ thống</p>
        </div>
        <Button onClick={() => setIsBuilding(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 px-6 shadow-md shadow-violet-500/20">
          <Plus className="w-4 h-4 mr-2" /> Thêm Báo Cáo Mới
        </Button>
      </div>

      {widgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">Chưa có báo cáo nào</h3>
          // eslint-disable-next-line react/no-unescaped-entities
          <p className="text-slate-500 text-sm mb-6">Nhấn "Thêm Báo Cáo Mới" để bắt đầu thiết kế biểu đồ từ nguồn dữ liệu của bạn.</p>
          <Button onClick={() => setIsBuilding(true)} variant="outline" className="rounded-xl">Thiết kế ngay</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {widgets.map(widget => {
            const data = (MOCK_DATA as any)[widget.sourceId] || [];
            return (
              <div key={widget.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-shadow group relative">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{widget.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDeleteWidget(widget.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Xóa biểu đồ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="w-full">
                  <ChartRenderer 
                    type={widget.chartType} 
                    data={data} 
                    xAxisKey={widget.xAxisKey} 
                    yAxisKey={widget.yAxisKey} 
                    height={280} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
