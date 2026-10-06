import React from 'react';
import { ReportConfigAST, ChartConfig } from '../../../../types/v2';
import { Button } from '../../../../../../components/ui/button';

interface ChartBuilderProps {
  config: ReportConfigAST;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfigAST>>;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({ config, setConfig }) => {
  // Trích xuất các cột có sẵn từ các nguồn đã chọn
  const availableFields = config.sources.flatMap((s: any) => s.fields);

  const handleAddChart = () => {
    const newChart: ChartConfig = {
      type: 'bar',
      xAxis: availableFields[0] || '',
      yAxis: availableFields[1] || '',
      title: 'Biểu đồ mới',
    };
    setConfig({
      ...config,
      charts: [...(config.charts || []), newChart],
    });
  };

  const handleUpdateChart = (index: number, updates: Partial<ChartConfig>) => {
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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Quản lý Biểu đồ</h3>
          <p className="text-sm text-slate-500">
            Thêm và cấu hình các biểu đồ (Bar, Line, Pie) cho báo cáo. Các biểu đồ này sẽ hiển thị trực quan trong trình xem.
          </p>
        </div>
        <Button onClick={handleAddChart} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 shadow-md transition-all">
          + Thêm Biểu đồ
        </Button>
      </div>

      {!config.charts || config.charts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-400">
          <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p className="text-lg font-medium text-slate-500">Chưa có biểu đồ nào</p>
          <p className="text-sm text-slate-400">Nhấp vào nút Thêm Biểu đồ ở góc trên để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
          {config.charts.map((chart: any, idx: number) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                <input
                  type="text"
                  value={chart.title || ''}
                  onChange={(e) => handleUpdateChart(idx, { title: e.target.value })}
                  className="font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 px-1 py-0.5 w-1/2 transition-colors"
                  placeholder="Nhập tiêu đề biểu đồ..."
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveChart(idx)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  ✕ Xóa
                </Button>
              </div>

              <div className="p-5 flex gap-6">
                {/* Khu vực xem trước giả lập */}
                <div className="w-1/2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center p-4 min-h-[160px]">
                  <div className="text-center">
                    <span className="inline-block p-3 rounded-full bg-indigo-100 text-indigo-600 mb-2">
                      {chart.type === 'bar' && (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      )}
                      {chart.type === 'line' && (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                      )}
                      {chart.type === 'pie' && (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                      )}
                    </span>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{chart.type} Chart</p>
                  </div>
                </div>

                {/* Form cấu hình */}
                <div className="w-1/2 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Loại Biểu đồ</label>
                    <select
                      className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={chart.type}
                      onChange={(e) => handleUpdateChart(idx, { type: e.target.value as any })}
                    >
                      <option value="bar">Biểu đồ Cột (Bar)</option>
                      <option value="line">Biểu đồ Đường (Line)</option>
                      <option value="pie">Biểu đồ Tròn (Pie)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Trục X (Nhãn/Danh mục)</label>
                    <select
                      className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={chart.xAxis}
                      onChange={(e) => handleUpdateChart(idx, { xAxis: e.target.value })}
                    >
                      <option value="">-- Chọn trường --</option>
                      {availableFields.map((f: any) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Trục Y (Giá trị đo lường)</label>
                    <select
                      className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={chart.yAxis}
                      onChange={(e) => handleUpdateChart(idx, { yAxis: e.target.value })}
                    >
                      <option value="">-- Chọn trường --</option>
                      {availableFields.map((f: any) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
