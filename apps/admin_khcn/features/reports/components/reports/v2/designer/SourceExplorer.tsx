"use client";
import React, { useState } from 'react';
import { ReportSourceDef } from '../../../../types/v2';
import { Button } from '../../../../../../components/ui/button';
import { useGetReportCatalog } from '../../../../api/v2';

interface SourceExplorerProps {
  onAddSource: (source: ReportSourceDef) => void;
}

export const SourceExplorer: React.FC<SourceExplorerProps> = ({ onAddSource }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: catalog = [], isLoading } = useGetReportCatalog();

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="font-semibold mb-4 text-lg text-slate-800">Nguồn Dữ Liệu</h3>
      <input
        type="text"
        placeholder="Tìm kiếm API nguồn..."
        className="border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-2 mb-4 w-full text-sm outline-none transition-all shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="text-center text-sm text-slate-500 py-4">Đang tải danh mục...</div>
        ) : catalog.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item: any) => (
          <div key={item.endpoint} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-200 transition-colors group">
            <h4 className="font-medium text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
            <p className="text-xs text-slate-400 mb-3 font-mono bg-slate-50 p-1 rounded mt-1">{item.endpoint}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
              onClick={() =>
                onAddSource({
                  id: item.endpoint,
                  endpoint: item.endpoint,
                  fields: item.fields,
                })
              }
            >
              Thêm vào không gian
            </Button>
          </div>
        ))}
        {!isLoading && catalog.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-4">Không tìm thấy nguồn dữ liệu</div>
        )}
      </div>
    </div>
  );
};
