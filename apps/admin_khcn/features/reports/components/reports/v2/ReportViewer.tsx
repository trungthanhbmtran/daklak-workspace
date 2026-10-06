import React from 'react';
import { useGetReportRunStatus, useGetDatasetSnapshot, useRunReport } from '../../api/v2';
import { Button } from '../../../../../../components/ui/button';

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
              <div>
                <h3 className="font-semibold text-lg mb-2">Bảng Dữ liệu (Snapshot)</h3>
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
