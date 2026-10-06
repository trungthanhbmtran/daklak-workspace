import React, { useState } from 'react';
import { useGetReportDefinitions, useCreateReportDefinition } from '../../../api/v2';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { ReportDesigner } from './designer/ReportDesigner';
import { ReportViewer } from './ReportViewer';
import { ReportConfigAST } from '../../../types/v2';

export const ReportWorkspace = () => {
  const { data: reports, isLoading } = useGetReportDefinitions();
  const createMutation = useCreateReportDefinition();
  const [isDesigning, setIsDesigning] = useState(false);
  const [viewingReport, setViewingReport] = useState<{id: number, config: any} | null>(null);

  const handleSaveConfig = async (config: ReportConfigAST) => {
    await createMutation.mutateAsync({
      name: 'Báo cáo mới ' + new Date().getTime(),
      configuration: config,
    });
    setIsDesigning(false);
  };

  if (isDesigning) {
    return (
      <ReportDesigner
        onSave={handleSaveConfig}
        onCancel={() => setIsDesigning(false)}
      />
    );
  }

  if (viewingReport) {
    return (
      <ReportViewer 
        definitionId={viewingReport.id}
        config={viewingReport.config}
        onBack={() => setViewingReport(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Không gian làm việc Báo cáo</h1>
        <Button onClick={() => setIsDesigning(true)}>Tạo báo cáo mới</Button>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports?.map((report: any) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle>{report.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{report.description || 'Chưa có mô tả'}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDesigning(true)}>Mở thiết kế</Button>
                  <Button variant="default" size="sm" onClick={() => setViewingReport({ id: report.id, config: report.configuration })}>
                    Chạy báo cáo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!reports?.length && (
            <p className="text-gray-500">Chưa có báo cáo nào được định nghĩa.</p>
          )}
        </div>
      )}
    </div>
  );
};
