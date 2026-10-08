"use client";
import React, { useState } from 'react';
import { useGetReportDefinitions, useCreateReportDefinition, useAssignReport } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

import { ReportDesigner } from './designer/ReportDesigner';
import { ReportViewer } from './ReportViewer';
import { ReportConfigAST } from '../../types';

export const ReportWorkspace = () => {
  const { data: reports, isLoading } = useGetReportDefinitions();
  const createMutation = useCreateReportDefinition();
  const assignMutation = useAssignReport();
  const [isDesigning, setIsDesigning] = useState(false);
  const [viewingReport, setViewingReport] = useState<{ id: number, config: any } | null>(null);
  const [sharingReport, setSharingReport] = useState<number | null>(null);
  const [assigneeType, setAssigneeType] = useState('USER');
  const [assigneeId, setAssigneeId] = useState('');

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
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 bg-white border-slate-200 hover:bg-slate-50 text-slate-700" size="sm" onClick={() => setIsDesigning(true)}>Thiết kế lại</Button>
                    <Button variant="default" className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm" size="sm" onClick={() => setViewingReport({ id: report.id, config: report.configuration })}>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Chạy báo cáo
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full mt-3 text-indigo-600 border-indigo-200 hover:bg-indigo-50" size="sm" onClick={() => setSharingReport(report.id)}>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    Chia sẻ báo cáo
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

      
      <Dialog open={sharingReport !== null} onOpenChange={(open) => {
        if (!open) {
          setSharingReport(null);
          setAssigneeId('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ Báo cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeType">Loại đối tượng</Label>
              <Select value={assigneeType} onValueChange={setAssigneeType}>
                <SelectTrigger id="assigneeType">
                  <SelectValue placeholder="Chọn loại đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Cá nhân (User ID)</SelectItem>
                  <SelectItem value="UNIT">Đơn vị (Unit ID)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigneeId">ID (User hoặc Unit)</Label>
              <Input
                id="assigneeId"
                placeholder="Nhập ID..."
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSharingReport(null);
              setAssigneeId('');
            }}>
              Hủy
            </Button>
            <Button
              disabled={assignMutation.isPending || !assigneeId}
              onClick={async () => {
                if (!sharingReport) return;
                try {
                  await assignMutation.mutateAsync({
                    templateId: sharingReport,
                    assigneeType,
                    assigneeId,
                    permissions: 'VIEW'
                  });
                  alert('Gán báo cáo thành công!');
                  setSharingReport(null);
                  setAssigneeId('');
                } catch(err) {
                  alert('Có lỗi xảy ra khi gán báo cáo.');
                }
              }}
            >
              {assignMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Gán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

