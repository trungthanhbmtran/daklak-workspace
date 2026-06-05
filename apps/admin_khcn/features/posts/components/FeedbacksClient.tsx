"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/features/posts/api";
import { CitizenFeedback } from "@/features/posts/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Eye, Mail, FileText, Calendar, Filter, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function FeedbacksClient() {
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<CitizenFeedback | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: feedbacks = [], isLoading: loading } = useQuery({
    queryKey: ['feedbacks', 1, 50],
    queryFn: async () => {
      const response = await postsApi.getFeedbacks({ page: 1, limit: 50 });
      return response.data || [];
    },
    staleTime: 60_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => postsApi.updateFeedbackStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'READ' ? "Đã đánh dấu là đã đọc" : "Đã chuyển trạng thái sang đã xử lý");
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      if (selectedFeedback && selectedFeedback.id === variables.id) setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const openDetailDialog = (f: CitizenFeedback) => {
    setSelectedFeedback(f);
    setIsDialogOpen(true);
    if (f.status === 'NEW') handleUpdateStatus(f.id, 'READ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSED': return <Badge className="bg-green-100 text-green-800 border-green-200">Đã xử lý</Badge>;
      case 'READ': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đã xem</Badge>;
      default: return <Badge className="bg-orange-100 text-orange-800 border-orange-200 animate-pulse">Mới</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DRAFT_DOC': return <Badge variant="outline" className="text-purple-600 border-purple-100 bg-purple-50">Dự thảo văn bản</Badge>;
      case 'SERVICE': return <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50">Dịch vụ công</Badge>;
      default: return <Badge variant="outline" className="text-gray-600 border-gray-100 bg-gray-50">Góp ý chung</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Góp ý công dân</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý ý kiến đóng góp cho dự thảo văn bản và chất lượng dịch vụ</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="bg-white"><Filter className="w-4 h-4 mr-2" /> Bộ lọc</Button>
          <Button variant="outline" size="sm" className="bg-white"><Search className="w-4 h-4 mr-2" /> Tìm kiếm</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người gửi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại &amp; Tiêu đề</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày nhận</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {feedbacks.map((f) => (
              <tr key={f.id} className={`hover:bg-gray-50/50 transition-colors ${f.status === 'NEW' ? 'bg-orange-50/20' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{f.senderName}</span>
                    <span className="text-xs text-gray-500 flex items-center mt-1"><Mail className="w-3 h-3 mr-1" /> {f.senderEmail}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {getTypeBadge(f.feedbackType)}
                    <span className="text-sm font-semibold text-gray-800 line-clamp-1">{f.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(f.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(f.createdAt).toLocaleDateString('vi-VN')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openDetailDialog(f)}><Eye className="w-4 h-4 mr-1" /> Chi tiết</Button>
                    {f.status !== 'PROCESSED' && (
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStatus(f.id, 'PROCESSED')}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && feedbacks.length === 0 && (
          <div className="p-16 text-center text-gray-400 italic">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Chưa có góp ý nào từ người dân gửi đến hệ thống.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <FileText className="w-6 h-6 mr-2 text-green-600" /> Chi tiết ý kiến góp ý
            </DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{selectedFeedback.title}</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    {getTypeBadge(selectedFeedback.feedbackType)}
                    <span className="text-xs text-gray-400 flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                {getStatusBadge(selectedFeedback.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Người gửi</p>
                  <div className="flex items-center text-sm font-semibold text-gray-700"><User className="w-4 h-4 mr-2 text-gray-400" /> {selectedFeedback.senderName}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Email liên hệ</p>
                  <div className="flex items-center text-sm font-semibold text-gray-700"><Mail className="w-4 h-4 mr-2 text-gray-400" /> {selectedFeedback.senderEmail}</div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900">Nội dung góp ý:</p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 leading-relaxed min-h-[120px]">{selectedFeedback.content}</div>
              </div>
              {selectedFeedback.referenceId && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700">ID tham chiếu tài liệu: {selectedFeedback.referenceId}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Đóng</Button>
            {selectedFeedback?.status !== 'PROCESSED' && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(selectedFeedback!.id, 'PROCESSED')}>
                <Check className="w-4 h-4 mr-2" /> Đánh dấu đã xử lý
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
