"use client";
import React, { useState, useEffect } from 'react';
import { ReportConfigAST } from '../../../types';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { SourceExplorer } from './SourceExplorer';
import { Canvas } from './Canvas';
import { ChartBuilder } from './ChartBuilder';
import { BarChart3, Database, Save, X } from 'lucide-react';

interface ReportDesignerProps {
  reportId?: number;
  reportName?: string;
  reportDescription?: string;
  initialConfig?: ReportConfigAST;
  onSave: (config: ReportConfigAST, customName?: string) => void;
  onCancel: () => void;
}

export const ReportDesigner: React.FC<ReportDesignerProps> = ({
  reportId,
  reportName,
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<ReportConfigAST>(() => {
    return (
      initialConfig || {
        version: 1,
        sources: [],
        joins: [],
        filters: [],
        columns: [],
        groupBy: [],
        charts: [],
      }
    );
  });

  const [reportTitle, setReportTitle] = useState(
    reportName || (reportId ? `Báo cáo #${reportId}` : 'Báo cáo mới'),
  );

  // Đồng bộ cấu hình khi initialConfig được nạp từ API
  useEffect(() => {
    if (initialConfig) {
      setConfig({
        version: initialConfig.version || 1,
        sources: initialConfig.sources || [],
        joins: initialConfig.joins || [],
        filters: initialConfig.filters || [],
        columns: initialConfig.columns || [],
        groupBy: initialConfig.groupBy || [],
        charts: initialConfig.charts || [],
      });
    }
  }, [initialConfig]);

  useEffect(() => {
    if (reportName) {
      setReportTitle(reportName);
    }
  }, [reportName]);

  // Nếu báo cáo đã có biểu đồ được cấu hình từ trước, mặc định mở tab 'chart'
  const [activeTab, setActiveTab] = useState<'model' | 'chart'>(() => {
    if (initialConfig?.charts && initialConfig.charts.length > 0) {
      return 'chart';
    }
    return 'model';
  });

  const chartCount = config.charts?.length || 0;
  const sourceCount = config.sources?.length || 0;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden min-w-0">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3 sm:gap-4 shadow-sm z-10 shrink-0 w-full min-w-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-wrap">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Trình Thiết Kế Báo Cáo
              </h2>
              {reportId ? (
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold shrink-0"
                >
                  ID #{reportId}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold shrink-0"
                >
                  Tạo mới
                </Badge>
              )}
            </div>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Nhập tên tiêu đề báo cáo..."
              className="text-xs text-slate-600 font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-0.5 mt-0.5 min-w-[200px] sm:min-w-[260px] transition-colors"
            />
          </div>

          <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shadow-inner shrink-0">
            <button
              onClick={() => setActiveTab('model')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'model'
                  ? 'bg-white shadow-sm text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Mô hình Dữ liệu
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-bold">
                {sourceCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'chart'
                  ? 'bg-white shadow-sm text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Thiết kế Biểu đồ
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  chartCount > 0
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {chartCount}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-slate-600 border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 text-xs"
          >
            <X className="w-3.5 h-3.5" />
            Đóng
          </Button>
          <Button
            size="sm"
            onClick={() => onSave(config, reportTitle)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 text-xs font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu & Xem Trước
          </Button>
        </div>
      </div>

      {/* Main Designer Area */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden w-full">
        {/* Left Panel: Source Explorer (Only show in Model tab) */}
        {activeTab === 'model' && (
          <div className="w-1/4 min-w-[260px] max-w-[340px] border-r border-slate-200/80 bg-white overflow-y-auto shadow-sm z-0 shrink-0">
            <SourceExplorer
              onAddSource={(source) =>
                setConfig({ ...config, sources: [...config.sources, source] })
              }
            />
          </div>
        )}

        {/* Middle Panel */}
        <div
          className={`flex-1 min-h-0 min-w-0 bg-slate-50 overflow-auto relative p-4 sm:p-6 ${
            activeTab === 'chart' ? 'w-full' : ''
          }`}
        >
          {activeTab === 'model' ? (
            <Canvas config={config} setConfig={setConfig} />
          ) : (
            <ChartBuilder config={config} setConfig={setConfig} />
          )}
        </div>
      </div>
    </div>
  );
};
