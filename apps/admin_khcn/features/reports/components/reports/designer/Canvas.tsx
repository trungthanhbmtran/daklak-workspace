"use client";
import React from 'react';
import { ReportConfigAST } from '../../../types';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Database, Table, Layers, Trash2 } from 'lucide-react';

interface CanvasProps {
  config: ReportConfigAST;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfigAST>>;
}

export const Canvas: React.FC<CanvasProps> = ({ config, setConfig }) => {
  const handleRemoveSource = (id: string) => {
    setConfig({
      ...config,
      sources: (config.sources || []).filter((s: any) => s.id !== id),
      joins: (config.joins || []).filter(
        (j: any) => j.leftSource !== id && j.rightSource !== id,
      ),
    });
  };

  const sources = config.sources || [];
  const columns = config.columns || [];

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Nguồn dữ liệu & Sơ đồ nối */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">
              Nguồn Dữ Liệu Đã Chọn
            </h3>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 font-medium">
            {sources.length} nguồn
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Các nguồn dữ liệu API / bảng đang liên kết trong báo cáo. Chọn thêm nguồn từ danh mục bên trái.
        </p>

        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 p-4">
            <Database className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">Chưa có nguồn dữ liệu nào được gán</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Chọn nguồn dữ liệu từ bảng bên trái để thêm vào mô hình</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {sources.map((src: any) => (
              <div
                key={src.id}
                className="border border-slate-200 rounded-xl p-3.5 min-w-[220px] max-w-xs bg-white shadow-xs hover:border-indigo-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                  <div className="min-w-0 pr-2">
                    <strong className="text-xs font-bold text-slate-800 block truncate">
                      {src.name || src.id}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {src.endpoint || src.id}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                    onClick={() => handleRemoveSource(src.id)}
                    title="Xóa nguồn này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                  {Array.isArray(src.fields) && src.fields.length > 0 ? (
                    src.fields.map((field: any, fIdx: number) => {
                      const fieldLabel =
                        typeof field === 'string'
                          ? field
                          : field?.label || field?.name || field?.key || String(fIdx);
                      return (
                        <div
                          key={fIdx}
                          className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate font-mono"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                          <span className="truncate">{fieldLabel}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      Không có danh sách trường cụ thể
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {sources.length >= 2 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="font-semibold text-xs text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Cấu hình JOIN nhanh giữa các nguồn
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <select className="border border-slate-200 text-xs p-1.5 rounded-lg bg-white shadow-xs font-medium">
                {sources.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.id}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 font-medium">kết nối với</span>
              <select className="border border-slate-200 text-xs p-1.5 rounded-lg bg-white shadow-xs font-medium">
                {sources.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.id}
                  </option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="text-xs h-8">
                Thêm phép nối
              </Button>
            </div>
            {/* Hiển thị join hiện có */}
            {config.joins && config.joins.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {config.joins.map((j: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md border border-indigo-100 font-medium"
                  >
                    {j.leftSource} {j.type || 'INNER'} JOIN {j.rightSource}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cột dữ liệu đầu ra */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">
              Cột Kết Quả & Biến Đổi Dữ Liệu
            </h3>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 font-medium">
            {columns.length} cột
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Cấu hình trường dữ liệu hiển thị, nhãn tiếng Việt và định dạng tính toán trong báo cáo.
        </p>

        {columns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columns.map((col: any, cIdx: number) => (
              <div
                key={cIdx}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {col.label || col.field || col.key}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                    Trường: {col.field || col.key}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-mono">
                    {col.type || 'string'}
                  </Badge>
                  {col.aggregate && col.aggregate !== 'none' && (
                    <span className="text-indigo-600 font-semibold uppercase text-[9px]">
                      {col.aggregate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 p-4">
            <p className="text-xs font-medium">Chưa cấu hình trường dữ liệu đầu ra riêng biệt</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Báo cáo sẽ sử dụng toàn bộ trường mặc định từ nguồn dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};
