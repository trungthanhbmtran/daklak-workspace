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
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Trung tâm Báo cáo</h1>
            <p className="text-slate-500 mt-1">Quản lý, thiết kế và thực thi các báo cáo phân tích dữ liệu.</p>
          </div>
          <Button 
            onClick={() => setIsDesigning(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-lg px-5 py-2.5 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tạo báo cáo mới
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports?.map((report: any) => (
              <Card key={report.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden group">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{report.name}</CardTitle>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">V2</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 bg-slate-50/50">
                  <p className="text-sm text-slate-500 line-clamp-2 h-10">
                    {report.description || 'Báo cáo cấu hình động, cho phép tự định nghĩa biểu đồ và truy xuất nguồn dữ liệu tuỳ chọn.'}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1 bg-white border-slate-200 hover:bg-slate-50 text-slate-700" size="sm" onClick={() => setIsDesigning(true)}>Thiết kế lại</Button>
                    <Button variant="default" className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm" size="sm" onClick={() => setViewingReport({ id: report.id, config: report.configuration })}>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Chạy báo cáo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!reports?.length && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
                <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p className="text-lg font-medium text-slate-500">Chưa có báo cáo nào</p>
                <p className="text-sm">Bấm "Tạo báo cáo mới" để thiết kế báo cáo đầu tiên của bạn.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
