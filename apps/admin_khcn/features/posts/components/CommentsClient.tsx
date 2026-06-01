"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { Comment } from "@/features/posts/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CommentsClient() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await postsApi.getComments({ status: 'PENDING', page: 1, limit: 50 });
      setComments(response.data || []);
    } catch {
      toast.error("Không thể tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await postsApi.updateCommentStatus(id, status);
      toast.success(`Đã chuyển trạng thái sang ${status}`);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await postsApi.deleteComment(id);
      toast.success("Đã xóa bình luận");
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kiểm duyệt bình luận</h1>
          <div className="text-sm text-gray-500">Đang hiển thị các bình luận chờ duyệt (PENDING)</div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người gửi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comments.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{c.authorName || 'Ẩn danh'}</div>
                    <div className="text-xs text-gray-500">{c.authorEmail || c.authorIp}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 italic">&quot;{c.content}&quot;</div>
                    <div className="text-xs text-blue-500 mt-1">Post ID: {c.postId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(c.id, 'APPROVED')}><Check className="w-4 h-4 mr-1" /> Duyệt</Button>
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => handleUpdateStatus(c.id, 'REJECTED')}><X className="w-4 h-4 mr-1" /> Từ chối</Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(c.id, 'SPAM')}><ShieldAlert className="w-4 h-4 mr-1" /> Spam</Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600" onClick={() => setDeletingCommentId(c.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && comments.length === 0 && (
            <p className="p-12 text-center text-gray-500">Tuyệt vời! Không có bình luận nào đang chờ duyệt.</p>
          )}
        </div>
      </div>

      <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Bình luận này sẽ bị xóa vĩnh viễn khỏi hệ thống.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deletingCommentId) { confirmDelete(deletingCommentId); setDeletingCommentId(null); } }}
            >
              Xóa bình luận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
