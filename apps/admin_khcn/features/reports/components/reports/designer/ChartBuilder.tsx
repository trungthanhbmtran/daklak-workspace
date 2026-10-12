"use client";
import React, { useMemo } from 'react';
import { ReportConfigAST, ChartConfig } from '../../../types';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Plus,
  Trash2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface ChartBuilderProps {
  config: ReportConfigAST;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfigAST>>;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({
  config,
  setConfig,
}) => {
  // Trích xuất toàn diện các cột có sẵn từ các nguồn và cột cấu hình
  const availableFields = useMemo(() => {
    const fieldsSet = new Set<string>();

    // 1. Từ config.sources
    config.sources?.forEach((s: any) => {
      if (Array.isArray(s.fields)) {
        s.fields.forEach((f: any) => {
          if (typeof f === 'string' && f.trim()) {
            fieldsSet.add(f.trim());
          } else if (f && typeof f === 'object') {
            const fieldName = f.name || f.key || f.path || f.field;
            if (fieldName && typeof fieldName === 'string') {
              fieldsSet.add(fieldName.trim());
            }
          }
        });
      }
    });

    // 2. Từ config.columns
    config.columns?.forEach((c: any) => {
      if (c.field && typeof c.field === 'string') fieldsSet.add(c.field.trim());
      if (c.key && typeof c.key === 'string') fieldsSet.add(c.key.trim());
    });

    // 3. Đảm bảo các trường đã lưu trong charts không bị mất khỏi danh sách chọn
    config.charts?.forEach((ch: any) => {
      if (ch.xAxis && typeof ch.xAxis === 'string') fieldsSet.add(ch.xAxis.trim());
      if (ch.yAxis && typeof ch.yAxis === 'string') fieldsSet.add(ch.yAxis.trim());
    });

    return Array.from(fieldsSet);
  }, [config]);

  const handleAddChart = () => {
    const defaultX = availableFields[0] || 'status';
    const defaultY =
      availableFields[1] || availableFields[0] || 'progress';
    const newChart: ChartConfig = {
      type: 'bar',
      xAxis: defaultX,
      yAxis: defaultY,
      title: `Biểu đồ ${(config.charts?.length || 0) + 1}`,
    };
    setConfig({
      ...config,
      charts: [...(config.charts || []), newChart],
    });
  };

  const handleUpdateChart = (
    index: number,
    updates: Partial<ChartConfig>,
  ) => {
    const newCharts = [...(config.charts || [])];
    newCharts[index] = { ...newCharts[index], ...updates };
    setConfig({ ...config, charts: newCharts });
  };

  const handleRemoveChart = (index: number) => {
    const newCharts = [...(config.charts || [])];
    newCharts.splice(index, 1);
    setConfig({ ...config, charts: newCharts });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-800">
              Quản lý Cấu hình Biểu đồ
            </h3>
            <Badge
              variant="secondary"
              className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold"
            >
              {config.charts?.length || 0} biểu đồ
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cấu hình các loại biểu đồ (Cột, Đường cong, Tròn) tương tác trực tiếp
            với các trường dữ liệu. Toàn bộ cấu hình và dữ liệu cũ của biểu đồ
            được lưu trữ và hiển thị trực quan dưới đây.
          </p>
        </div>
        <Button
          onClick={handleAddChart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 shadow-sm transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Biểu đồ mới
        </Button>
      </div>

      {/* Main Charts Area */}
      {!config.charts || config.charts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 p-8 text-center shadow-xs">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            Chưa có biểu đồ nào trong báo cáo này
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Nhấn vào nút &quot;Thêm Biểu đồ mới&quot; ở góc trên để cấu hình các biểu đồ
            phân tích số liệu cho báo cáo.
          </p>
          <Button
            onClick={handleAddChart}
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo Biểu đồ đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
          {config.charts.map((chart: any, idx: number) => {
            const hasX = !!chart.xAxis;
            const hasY = !!chart.yAxis;

            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
              >
                {/* Header card */}
                <div className="bg-slate-50/80 border-b border-slate-200/70 px-5 py-3.5 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={chart.title || ''}
                      onChange={(e) =>
                        handleUpdateChart(idx, { title: e.target.value })
                      }
                      className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-full transition-colors truncate"
                      placeholder="Nhập tiêu đề biểu đồ..."
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-wider bg-white text-slate-600"
                    >
                      {chart.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChart(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                      title="Xóa biểu đồ này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-5 flex flex-col md:flex-row gap-6 flex-1">
                  {/* Cột trái: Trực quan hóa xem trước giả lập với dữ liệu mẫu theo trục */}
                  <div className="w-full md:w-1/2 bg-slate-50/90 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between min-h-[220px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                        {chart.type === 'bar' ? (
                          <>
                            <BarChart3 className="w-3 h-3" /> Cột (Bar)
                          </>
                        ) : chart.type === 'line' ? (
                          <>
                            <TrendingUp className="w-3 h-3" /> Đường (Line)
                          </>
                        ) : (
                          <>
                            <PieChart className="w-3 h-3" /> Tròn (Pie)
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Xem trước
                      </span>
                    </div>

                    {/* Chart Graphic Preview */}
                    <div className="flex-1 flex items-center justify-center my-2">
                      {chart.type === 'bar' ? (
                        <div className="w-full h-32 flex items-end justify-around gap-2 px-2 py-1.5 bg-white rounded-xl border border-slate-100 shadow-inner">
                          {[
                            { label: 'Mục 1', h: 65, val: 54 },
                            { label: 'Mục 2', h: 90, val: 88 },
                            { label: 'Mục 3', h: 45, val: 32 },
                            { label: 'Mục 4', h: 80, val: 76 },
                          ].map((b, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex-1 flex flex-col items-center justify-end h-full"
                            >
                              <span className="text-[9px] font-bold text-slate-500 mb-0.5">
                                {b.val}
                              </span>
                              <div
                                className="w-full rounded-t-md transition-all duration-300 bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-xs"
                                style={{ height: `${b.h}%` }}
                              />
                              <span className="text-[9px] text-slate-400 mt-1 truncate max-w-full font-medium">
                                {hasX ? `${chart.xAxis.slice(0, 4)}_${bIdx + 1}` : b.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : chart.type === 'line' ? (
                        <div className="w-full h-32 flex items-center justify-center p-2 bg-white rounded-xl border border-slate-100 shadow-inner relative overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 200 80">
                            <defs>
                              <linearGradient
                                id={`grad-${idx}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#4f46e5"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#4f46e5"
                                  stopOpacity="0.0"
                                />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 10 65 Q 50 15, 90 40 T 170 20 L 190 35 L 190 75 L 10 75 Z"
                              fill={`url(#grad-${idx})`}
                            />
                            <path
                              d="M 10 65 Q 50 15, 90 40 T 170 20 L 190 35"
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <circle cx="10" cy="65" r="3.5" fill="#4f46e5" />
                            <circle cx="90" cy="40" r="3.5" fill="#4f46e5" />
                            <circle cx="170" cy="20" r="3.5" fill="#4f46e5" />
                            <circle cx="190" cy="35" r="3.5" fill="#4f46e5" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center gap-3 p-2 bg-white rounded-xl border border-slate-100 shadow-inner">
                          <svg className="w-20 h-20" viewBox="0 0 42 42">
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke="#e2e8f0"
                              strokeWidth="6"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke="#4f46e5"
                              strokeWidth="6"
                              strokeDasharray="45 55"
                              strokeDashoffset="25"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke="#06b6d4"
                              strokeWidth="6"
                              strokeDasharray="30 70"
                              strokeDashoffset="80"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke="#10b981"
                              strokeWidth="6"
                              strokeDasharray="25 75"
                              strokeDashoffset="50"
                            />
                          </svg>
                          <div className="flex flex-col gap-1 text-[9px] text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>{' '}
                              Nhóm A (45%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0"></span>{' '}
                              Nhóm B (30%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>{' '}
                              Nhóm C (25%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate pr-1">
                        <strong>X:</strong>{' '}
                        <span className="text-indigo-600 font-mono">
                          {chart.xAxis || '(chưa chọn)'}
                        </span>
                      </span>
                      <span className="truncate pl-1">
                        <strong>Y:</strong>{' '}
                        <span className="text-indigo-600 font-mono">
                          {chart.yAxis || '(chưa chọn)'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Cột phải: Form cấu hình thông số biểu đồ */}
                  <div className="w-full md:w-1/2 space-y-3.5 flex flex-col justify-center">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Loại Biểu đồ
                      </label>
                      <select
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                        value={chart.type}
                        onChange={(e) =>
                          handleUpdateChart(idx, {
                            type: e.target.value as any,
                          })
                        }
                      >
                        <option value="bar">Biểu đồ Cột (Bar Chart)</option>
                        <option value="line">Biểu đồ Đường (Line Chart)</option>
                        <option value="pie">Biểu đồ Tròn (Pie Chart)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Trục X (Nhãn / Danh mục)
                        {chart.xAxis && (
                          <span className="ml-1 text-[11px] font-normal text-indigo-600">
                            • Hiện tại: <strong>{chart.xAxis}</strong>
                          </span>
                        )}
                      </label>
                      <select
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                        value={chart.xAxis || ''}
                        onChange={(e) =>
                          handleUpdateChart(idx, { xAxis: e.target.value })
                        }
                      >
                        <option value="">-- Chọn trường trục X --</option>
                        {/* Đảm bảo giá trị đã lưu luôn hiển thị trên đầu nếu không nằm trong danh sách */}
                        {chart.xAxis &&
                          !availableFields.includes(chart.xAxis) && (
                            <option value={chart.xAxis}>
                              {chart.xAxis} (Đã lưu)
                            </option>
                          )}
                        {availableFields.map((f: string) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Trục Y (Giá trị đo lường)
                        {chart.yAxis && (
                          <span className="ml-1 text-[11px] font-normal text-indigo-600">
                            • Hiện tại: <strong>{chart.yAxis}</strong>
                          </span>
                        )}
                      </label>
                      <select
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                        value={chart.yAxis || ''}
                        onChange={(e) =>
                          handleUpdateChart(idx, { yAxis: e.target.value })
                        }
                      >
                        <option value="">-- Chọn trường trục Y --</option>
                        {/* Đảm bảo giá trị đã lưu luôn hiển thị trên đầu nếu không nằm trong danh sách */}
                        {chart.yAxis &&
                          !availableFields.includes(chart.yAxis) && (
                            <option value={chart.yAxis}>
                              {chart.yAxis} (Đã lưu)
                            </option>
                          )}
                        {availableFields.map((f: string) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
