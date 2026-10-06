"use client";
import React from 'react';
import { ReportConfigAST, JoinDef, ReportSourceDef } from '../../../../types/v2';
import { Button } from '../../../../../../components/ui/button';

interface CanvasProps {
  config: ReportConfigAST;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfigAST>>;
}

export const Canvas: React.FC<CanvasProps> = ({ config, setConfig }) => {
  const handleRemoveSource = (id: string) => {
    setConfig({
      ...config,
      sources: config.sources.filter((s: any) => s.id !== id),
      joins: config.joins.filter((j: any) => j.leftSource !== id && j.rightSource !== id
      ),
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-white p-4 rounded shadow-sm border">
        <h3 className="font-semibold text-lg mb-2">Sơ đồ Kết nối (Join)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Các nguồn dữ liệu đã chọn sẽ hiển thị tại đây. (Giao diện kéo thả React Flow sẽ được tích hợp trong phase sau)
        </p>

        {config.sources.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded text-gray-400">
            Kéo thả nguồn dữ liệu từ cột trái vào đây
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {config.sources.map((src: any) => (
              <div key={src.id} className="border rounded-md p-3 min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <strong className="text-sm">{src.id}</strong>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => handleRemoveSource(src.id)}
                  >
                    ✕
                  </Button>
                </div>
                <ul className="text-xs text-gray-600 space-y-1 bg-slate-50 p-2 rounded">
                  {src.fields.map((field: any) => (
                    <li key={field}>• {field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {config.sources.length >= 2 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Cấu hình JOIN nhanh</h4>
            <div className="flex items-center gap-2">
              <select className="border text-sm p-1 rounded">
                {config.sources.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.id}
                  </option>
                ))}
              </select>
              <span>kết nối với</span>
              <select className="border text-sm p-1 rounded">
                {config.sources.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.id}
                  </option>
                ))}
              </select>
              <Button size="sm">Thêm phép nối</Button>
            </div>
            {/* Hiển thị join */}
            <div className="mt-2 text-sm">
              {config.joins.map((j: any, idx: number) => (
                <div key={idx} className="bg-blue-50 text-blue-800 p-1 rounded inline-block mr-2">
                  {j.leftSource} {j.type} JOIN {j.rightSource}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow-sm border flex-1">
        <h3 className="font-semibold text-lg mb-2">Biến đổi & Cột kết quả</h3>
        <p className="text-sm text-gray-500 mb-4">
          Cấu hình Filter, Group By, Aggregate và Sort.
        </p>
        <div className="text-center text-gray-400 mt-10">
          Chưa cấu hình trường dữ liệu đầu ra.
        </div>
      </div>
    </div>
  );
};

