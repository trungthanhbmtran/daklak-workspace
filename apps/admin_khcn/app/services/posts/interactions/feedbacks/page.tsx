"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { CitizenFeedback } from "@/features/posts/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Eye } from "lucide-react";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<CitizenFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await postsApi.getFeedbacks({ page: 1, limit: 20 });
      setFeedbacks(data);
    } catch (error) {
      toast.error("Không thể tải danh sách góp ý");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await postsApi.updateFeedbackStatus(id, status);
      toast.success("Đã cập nhật trạng thái góp ý");
      fetchFeedbacks();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý Góp ý công dân</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người gửi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại góp ý</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề / Nội dung</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbacks.map((f) => (
              <tr key={f.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{f.senderName}</div>
                  <div className="text-sm text-gray-500">{f.senderEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                    {f.feedbackType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">{f.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    f.status === 'PROCESSED' ? 'bg-green-100 text-green-800' : 
                    f.status === 'READ' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(f.id, 'READ')}>
                      <Eye className="w-4 h-4 mr-1" /> Xem
                    </Button>
                    {f.status !== 'PROCESSED' && (
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(f.id, 'PROCESSED')}>
                        <Check className="w-4 h-4 mr-1" /> Xử lý
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && feedbacks.length === 0 && (
          <p className="p-6 text-center text-gray-500">Chưa có góp ý nào từ công dân.</p>
        )}
      </div>
    </div>
  );
}
