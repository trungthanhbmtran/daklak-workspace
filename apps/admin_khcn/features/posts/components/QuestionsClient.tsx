"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { CitizenQuestion } from "@/features/posts/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, Send, User, Calendar, MapPin, Phone, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function QuestionsClient() {
  const [questions, setQuestions] = useState<CitizenQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<CitizenQuestion | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await postsApi.getQuestions({ page: 1, limit: 50 });
      setQuestions(response.data || []);
    } catch {
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const openAnswerDialog = (q: CitizenQuestion) => {
    setSelectedQuestion(q);
    setAnswerContent(q.answerContent || "");
    setIsPublic(q.isPublic);
    setIsDialogOpen(true);
  };

  const handleAnswer = async () => {
    if (!selectedQuestion) return;
    if (!answerContent.trim()) {
      toast.error("Vui lòng nhập nội dung câu trả lời");
      return;
    }
    try {
      await postsApi.answerQuestion(selectedQuestion.id, { answerContent, isPublic });
      toast.success("Đã gửi câu trả lời");
      setIsDialogOpen(false);
      fetchQuestions();
    } catch {
      toast.error("Lỗi khi gửi câu trả lời");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANSWERED': return <Badge className="bg-green-100 text-green-800 border-green-200">Đã trả lời</Badge>;
      case 'PROCESSING': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đang xử lý</Badge>;
      case 'REJECTED': return <Badge className="bg-red-100 text-red-800 border-red-200">Từ chối</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ tiếp nhận</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hỏi đáp công dân</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống tiếp nhận và trả lời ý kiến, vướng mắc của người dân</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người gửi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề &amp; Nội dung</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày gửi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{q.askedByName}</span>
                    <span className="text-xs text-gray-500">{q.askedByPhone || q.askedByEmail}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">{q.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-2 mt-1 italic">&quot;{q.content}&quot;</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(q.status)}
                  {q.isPublic && <Badge variant="outline" className="ml-2 text-[10px] text-blue-600 border-blue-200">Công khai</Badge>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant={q.status === 'ANSWERED' ? "outline" : "default"}
                    size="sm"
                    className={q.status === 'ANSWERED' ? "" : "bg-blue-600 hover:bg-blue-700"}
                    onClick={() => openAnswerDialog(q)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {q.status === 'ANSWERED' ? "Xem lại" : "Trả lời"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && questions.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">Tuyệt vời! Hệ thống không có câu hỏi nào chưa xử lý.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              {selectedQuestion?.status === 'ANSWERED' ? "Chi tiết câu hỏi & Trả lời" : "Trả lời câu hỏi từ công dân"}
            </DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6 py-4">
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600"><User className="w-4 h-4 mr-2" /><span className="font-semibold mr-2">Người gửi:</span> {selectedQuestion.askedByName}</div>
                <div className="flex items-center text-gray-600"><Phone className="w-4 h-4 mr-2" /><span className="font-semibold mr-2">Số điện thoại:</span> {selectedQuestion.askedByPhone || 'N/A'}</div>
                <div className="flex items-center text-gray-600"><Mail className="w-4 h-4 mr-2" /><span className="font-semibold mr-2">Email:</span> {selectedQuestion.askedByEmail || 'N/A'}</div>
                <div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-2" /><span className="font-semibold mr-2">Địa chỉ:</span> {selectedQuestion.address || 'N/A'}</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Nội dung câu hỏi:</h3>
                <div className="p-4 border rounded-lg bg-blue-50/30 border-blue-100 italic text-gray-800">
                  <p className="font-semibold mb-1">{selectedQuestion.title}</p>
                  <p className="text-sm">{selectedQuestion.content}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="answer" className="text-sm font-bold text-gray-900 mb-2 block">Câu trả lời của cơ quan chức năng:</Label>
                <Textarea
                  id="answer"
                  placeholder="Nhập nội dung phản hồi chính thức cho người dân..."
                  className="min-h-[150px] focus:ring-blue-500"
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  readOnly={selectedQuestion.status === 'ANSWERED'}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(!!checked)}
                  disabled={selectedQuestion.status === 'ANSWERED'}
                />
                <label htmlFor="isPublic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Công khai câu hỏi và câu trả lời lên Portal
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Đóng</Button>
            {selectedQuestion?.status !== 'ANSWERED' && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAnswer}>
                <Send className="w-4 h-4 mr-2" /> Gửi phản hồi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
