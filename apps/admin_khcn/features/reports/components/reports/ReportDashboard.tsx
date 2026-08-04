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

import { useWidgets, useDeleteTemplate, usePreviewReport } from "../../api";
import { useIntegrationList } from "@/features/integration/api";
import { Skeleton } from "@/components/ui/skeleton";

import { MOCK_DATA } from "./mockData";

function ReportWidget({ widget, integrations }: { widget: any; integrations: any[] }) {
  const systemSources = React.useMemo(() => {
    const apiSources = (integrations || []).map((int: any) => ({
      id: `api-${int.id}`,
      name: `API: ${int.name}`,
      type: 'api',
      baseUrl: int.baseUrl,
      headers: int.headers,
      authConfig: int.authConfig,
      endpoints: int.metadata?._parsedEndpoints || int.endpoints || []
    }));
    return apiSources;
  }, [integrations]);

  const sourceId = widget.dataSourceCode || widget.sourceId;
  const endpointPath = widget.endpoint;
  const selectedSource = systemSources.find(s => s.id === sourceId);
  const epInfo = selectedSource?.endpoints?.find((e: any) => e.path === endpointPath);

  const previewPayload = React.useMemo(() => ({
    baseUrl: selectedSource?.baseUrl,
    endpointPath: endpointPath,
    method: epInfo?.method || 'GET',
    headers: selectedSource?.headers,
    authConfig: selectedSource?.authConfig,
    params: {},
    sourceId
  }), [selectedSource, endpointPath, epInfo, sourceId]);

  const isApiSourceReady = Boolean(selectedSource?.type === 'api' && endpointPath);
  const { data: queryData, isFetching } = usePreviewReport(previewPayload, isApiSourceReady);

  const data = React.useMemo(() => {
    if (isApiSourceReady) {
      if (!queryData) return [];
      const dataAny = queryData as any;
      if (dataAny?.success && Array.isArray(dataAny.data)) {
        return dataAny.data;
      }
      return [];
    }
    return (MOCK_DATA as any)[sourceId] || [];
  }, [isApiSourceReady, queryData, sourceId]);

  return (
    <div className="w-full relative">
       {isFetching && (
         <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 rounded-xl">
           <span className="text-sm text-violet-600 animate-pulse font-medium">Đang tải dữ liệu...</span>
         </div>
       )}
       <ChartRenderer
         type={widget.chartType?.toLowerCase() || 'bar'}
         data={data}
         xAxisKey={widget.xAxisKey}
         yAxisKey={widget.yAxisKey}
         xAxisLabel={widget.xAxisLabel}
         yAxisLabel={widget.yAxisLabel}
         height={280}
       />
    </div>
  );
}

export function ReportDashboard() {
  const [isBuilding, setIsBuilding] = useState(false);

  const { data: widgets = [], isLoading } = useWidgets();
  const { data: integrations = [] } = useIntegrationList("");
  const { mutateAsync: deleteTemplate } = useDeleteTemplate();

  const handleDelete = async (widgetId: string, templateId?: string) => {
    if (!templateId) {
      toast.error("Không tìm thấy ID mẫu báo cáo!");
      return;
    }
    try {
      await deleteTemplate(templateId);
      toast.success("Đã xoá báo cáo!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Không thể xoá báo cáo");
    }
  };

  if (isBuilding) {
    return (
      <ReportBuilder
        onBack={() => setIsBuilding(false)}
        onSave={(config) => {
          setIsBuilding(false);
        }}
      />
    );
  }

  const handleDeleteWidget = (id: string, templateId?: string) => {
    if (confirm("Xóa biểu đồ này khỏi Dashboard?")) {
      handleDelete(id, templateId);
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

      {isLoading ? (
        <div className="flex items-center justify-center col-span-2 h-32">
          <span className="text-slate-500">Đang tải báo cáo...</span>
        </div>
      ) : widgets.length === 0 ? (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <LayoutTemplate className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Chưa có báo cáo nào</h3>
          <p className="text-slate-500 max-w-sm mb-6">Tạo biểu đồ báo cáo tuỳ chỉnh đầu tiên của bạn để theo dõi các chỉ số quan trọng.</p>
          <Button onClick={() => setIsBuilding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Báo Cáo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {widgets.map((widget: any) => {
            return (
              <div key={widget.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-shadow group relative">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{widget.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" iconStart={<MoreVertical className="w-4 h-4" />}></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDeleteWidget(widget.id, widget.templateId)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Xóa biểu đồ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="w-full">
                  <ReportWidget widget={widget} integrations={integrations} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
