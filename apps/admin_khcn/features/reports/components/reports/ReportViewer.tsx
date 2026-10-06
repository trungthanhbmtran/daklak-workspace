"use client";
import React from 'react';
import { useGetReportRunStatus, useGetDatasetSnapshot, useRunReport } from '../../api';
import { Button } from '../../../../components/ui/button';

interface ReportViewerProps {
  definitionId: number;
  config: any;
  onBack: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ definitionId, config, onBack }) => {
  const [runId, setRunId] = React.useState<string | null>(null);
  
  const runMutation = useRunReport();
  const { data: runStatus, isLoading: isStatusLoading } = useGetReportRunStatus(runId!, !!runId);
  
  // Chỉ fetch snapshot khi run thành công
  const { data: snapshot, isLoading: isSnapshotLoading } = useGetDatasetSnapshot(
    runStatus?.status === 'SUCCEEDED' ? runId! : ''
  );

  const handleRun = async () => {
    try {
      const result = await runMutation.mutateAsync({ definitionId, config });
      setRunId(result.runId.toString());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold">Trình Xem Trước Báo Cáo</h2>
          <p className="text-sm text-gray-500">ID Cấu hình: {definitionId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Trở về</Button>
          <Button onClick={handleRun} disabled={runMutation.isPending || runStatus?.status === 'RUNNING'}>
            {runMutation.isPending ? 'Đang gửi yêu cầu...' : 'Chạy lại (Run)'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {!runId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>Chưa có phiên bản thực thi (Run). Hãy nhấn "Chạy lại" để sinh dữ liệu.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded border">
              <h3 className="font-semibold text-sm">Trạng thái Thực thi (Run ID: {runId})</h3>
              <div className="mt-2 text-sm">
                <span className="font-medium mr-2">Trạng thái:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  runStatus?.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                  runStatus?.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {isStatusLoading ? 'Đang lấy trạng thái...' : runStatus?.status || 'UNKNOWN'}
                </span>
                
                {runStatus?.rowCount !== undefined && (
                  <span className="ml-4 text-gray-600">Số dòng kết quả: {runStatus.rowCount}</span>
                )}
              </div>
            </div>

            {runStatus?.status === 'SUCCEEDED' && (
              <div className="space-y-6">
                {/* Khu vực Biểu đồ (Aesthetic View) */}
                {config?.charts && config.charts.length > 0 && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Trực quan hóa Dữ liệu</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {config.charts.map((chart: any, index: number) => (
                        <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                            <h4 className="font-bold text-slate-700 truncate">{chart.title || 'Biểu đồ'}</h4>
                            <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md uppercase tracking-wider">{chart.type}</span>
                          </div>
                          
                          <div className="h-56 bg-slate-50 relative flex flex-col items-center justify-center p-4">
                            {/* Lưới nền (Grid background) */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                            
                            {/* Dummy Data Visualization */}
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-4">
                              {chart.type === 'bar' && (
                                <div className="flex items-end justify-center gap-3 w-full h-32 px-4">
                                  {[40, 70, 45, 90, 60, 30].map((h, i) => (
                                    <div key={i} className="w-1/6 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md relative group-hover:from-indigo-500 group-hover:to-indigo-300 transition-colors" style={{ height: `${h}%` }}></div>
                                  ))}
                                </div>
                              )}
                              
                              {chart.type === 'line' && (
                                <div className="w-full h-32 flex items-center justify-center">
                                  <svg className="w-full h-full drop-shadow-md text-indigo-500" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <path d="M0,35 Q10,30 20,20 T40,25 T60,10 T80,15 T100,5" fill="none" stroke="currentColor" strokeWidth="3.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M0,35 Q10,30 20,20 T40,25 T60,10 T80,15 T100,5 L100,40 L0,40 Z" fill="currentColor" opacity="0.1" stroke="none" />
                                  </svg>
                                </div>
                              )}
                              
                              {chart.type === 'pie' && (
                                <div className="w-32 h-32 mt-2">
                                  <div className="w-full h-full rounded-full border-[14px] border-indigo-100 border-t-indigo-500 border-r-indigo-400 border-b-indigo-300 shadow-inner transform group-hover:rotate-12 transition-transform duration-700 ease-out"></div>
                                </div>
                              )}
                            </div>
                            
                            {/* Trục hoành / Trục tung */}
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
                              <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-medium text-slate-500 border border-slate-200 shadow-sm inline-flex items-center gap-2">
                                <span><span className="text-slate-400">X:</span> {chart.xAxis}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span><span className="text-slate-400">Y:</span> {chart.yAxis}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bảng dữ liệu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Bảng Dữ liệu (Snapshot)</h3>
                    <Button variant="outline" size="sm">Xuất Excel / CSV</Button>
                  </div>
                  {isSnapshotLoading ? (
                    <p className="text-sm text-gray-500">Đang tải Snapshot...</p>
                  ) : (
                    <div className="border rounded overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 border-b">
                          <tr>
                            {snapshot?.schema?.map((col: any) => (
                              <th key={col.key} className="p-2 font-medium">{col.label || col.key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {snapshot?.data?.slice(0, 100).map((row: any, i: number) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                              {snapshot?.schema?.map((col: any) => (
                                <td key={col.key} className="p-2">{String(row[col.key] ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!snapshot?.data?.length && (
                        <p className="p-4 text-center text-gray-500">Không có dữ liệu.</p>
                      )}
                      {(snapshot?.data?.length || 0) > 100 && (
                        <p className="p-2 text-xs text-center text-gray-500 border-t">
                          Đang hiển thị 100 dòng đầu tiên của Snapshot. Sử dụng Server Pagination để xem thêm.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {runStatus?.status === 'FAILED' && (
              <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200 text-sm">
                Lỗi thực thi: {JSON.stringify(runStatus.errors) || 'Lỗi không xác định.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

