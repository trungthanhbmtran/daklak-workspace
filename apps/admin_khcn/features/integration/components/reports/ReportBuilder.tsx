"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, Save, Play, Settings, Database, Server, BarChart2, PieChart, LineChart as LineChartIcon, Table2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartRenderer } from "./ChartRenderer";
import { toast } from "sonner";
import { useIntegrationList } from "../../api";

interface ReportBuilderProps {
  onBack: () => void;
  onSave: (config: any) => void;
}

// Generic mock data generator for when an API is selected, so we can preview the chart
// In a real scenario, this would be a fetch to an analytics endpoint or the API itself.
const generateMockDataForSource = (sourceName: string) => {
  return [
    { label: "Jan", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
    { label: "Feb", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
    { label: "Mar", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
    { label: "Apr", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
  ];
};

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

export function ReportBuilder({ onBack, onSave }: ReportBuilderProps) {
  const { data: integrations } = useIntegrationList("");
  
  const systemSources = useMemo(() => {
    const apiSources = (integrations || []).map(int => ({
      id: `api-${int.id}`,
      name: `API: ${int.systemName}`,
      type: 'api',
      icon: Server
    }));
    
    // Default DB sources for testing
    const dbSources = [
      { id: "db-users", name: "CSDL: Người dùng", type: "db", icon: Database },
      { id: "db-workflows", name: "CSDL: Quy trình", type: "db", icon: Database }
    ];

    return [...apiSources, ...dbSources];
  }, [integrations]);

  const [title, setTitle] = useState("Báo cáo mới");
  const [sourceId, setSourceId] = useState<string>("");
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'table'>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>("");
  const [yAxisKey, setYAxisKey] = useState<string>("");

  const availableFields = useMemo(() => {
    if (!sourceId) return [];
    const data = (MOCK_DATA as any)[sourceId];
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [sourceId]);

  const previewData = useMemo(() => {
    if (!sourceId) return [];
    
    // If it's from the old static mock data, use it (for ReportDashboard rendering)
    if ((MOCK_DATA as any)[sourceId]) {
      return (MOCK_DATA as any)[sourceId];
    }

    // Generate dynamic mock data for new system sources
    const selectedSource = systemSources.find(s => s.id === sourceId);
    return generateMockDataForSource(selectedSource?.name || "System");
  }, [sourceId, systemSources]);

  const handleSave = () => {
    if (!title || !sourceId || !xAxisKey || !yAxisKey) {
      toast.error("Vui lòng điền đầy đủ cấu hình trước khi lưu!");
      return;
    }
    onSave({
      id: Date.now().toString(),
      title,
      sourceId,
      chartType,
      xAxisKey,
      yAxisKey,
    });
    toast.success("Đã lưu báo cáo thành công!");
  };

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[600px] w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Sidebar Configuration */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 -ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Trở lại
          </Button>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm">
            <Settings className="w-4 h-4" /> Cấu hình
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="space-y-2">
            <Label>Tên Báo Cáo</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nhập tên báo cáo..."
              className="bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label>Nguồn Dữ Liệu</Label>
            <Select value={sourceId} onValueChange={(val) => {
              setSourceId(val);
              setXAxisKey("");
              setYAxisKey("");
            }}>
              <SelectTrigger className="bg-white dark:bg-slate-900">
                <SelectValue placeholder="Chọn API hoặc CSDL..." />
              </SelectTrigger>
              <SelectContent>
                {systemSources.map((src) => (
                  <SelectItem key={src.id} value={src.id}>
                    <div className="flex items-center gap-2">
                      <src.icon className="w-4 h-4 text-slate-400" />
                      {src.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Loại Biểu Đồ</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={chartType === 'bar' ? 'default' : 'outline'} 
                className={`w-full justify-start ${chartType === 'bar' ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`}
                onClick={() => setChartType('bar')}
              >
                <BarChart2 className="w-4 h-4 mr-2" /> Cột
              </Button>
              <Button 
                variant={chartType === 'line' ? 'default' : 'outline'} 
                className={`w-full justify-start ${chartType === 'line' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="w-4 h-4 mr-2" /> Đường
              </Button>
              <Button 
                variant={chartType === 'pie' ? 'default' : 'outline'} 
                className={`w-full justify-start ${chartType === 'pie' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                onClick={() => setChartType('pie')}
              >
                <PieChart className="w-4 h-4 mr-2" /> Tròn
              </Button>
              <Button 
                variant={chartType === 'table' ? 'default' : 'outline'} 
                className={`w-full justify-start ${chartType === 'table' ? 'bg-slate-800 hover:bg-slate-900 text-white' : ''}`}
                onClick={() => setChartType('table')}
              >
                <Table2 className="w-4 h-4 mr-2" /> Bảng
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mapping Dữ Liệu</h4>
            
            <div className="space-y-2">
              <Label>{chartType === 'pie' ? 'Trường Danh Mục (Name)' : chartType === 'table' ? 'Trường Chính' : 'Trục Hoành (X-Axis)'}</Label>
              <Select value={xAxisKey} onValueChange={setXAxisKey} disabled={!sourceId}>
                <SelectTrigger className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Chọn trường dữ liệu..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{chartType === 'pie' ? 'Trường Giá Trị (Value)' : chartType === 'table' ? 'Trường Phụ' : 'Trục Tung (Y-Axis)'}</Label>
              <Select value={yAxisKey} onValueChange={setYAxisKey} disabled={!sourceId}>
                <SelectTrigger className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Chọn trường giá trị (số)..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button onClick={handleSave} className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20">
            <Save className="w-4 h-4 mr-2" /> Lưu Báo Cáo
          </Button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/30">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-violet-500" />
            Xem trước (Preview)
          </h3>
          <Button variant="outline" size="sm" className="text-violet-600 border-violet-200 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-900/30">
            <Play className="w-4 h-4 mr-2" /> Làm mới dữ liệu
          </Button>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center">
          {!sourceId || !xAxisKey || !yAxisKey ? (
            <div className="text-center p-12 bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl max-w-md w-full shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Chưa hoàn tất cấu hình</h4>
              <p className="text-slate-500 text-sm">Vui lòng chọn Nguồn dữ liệu và map các trường Trục X, Trục Y ở menu bên trái để hiển thị biểu đồ.</p>
            </div>
          ) : (
            <div className="w-full h-full max-h-[500px] bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <h4 className="text-center font-bold text-xl text-slate-800 dark:text-slate-100 mb-6">{title}</h4>
              <ChartRenderer 
                type={chartType} 
                data={previewData} 
                xAxisKey={xAxisKey} 
                yAxisKey={yAxisKey} 
                height={400} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
