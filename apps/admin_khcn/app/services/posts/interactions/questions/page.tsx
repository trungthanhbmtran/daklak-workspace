"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { CitizenQuestion } from "@/features/posts/types";
import { toast } from "sonner";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<CitizenQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await postsApi.getQuestions({ page: 1, limit: 20 });
      setQuestions(data);
    } catch {
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý Hỏi đáp (Hệ thống tiếp nhận ý kiến)</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người hỏi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="px-6 py-4 whitespace-nowrap">{q.askedByName}</td>
                <td className="px-6 py-4">{q.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${q.status === 'ANSWERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && questions.length === 0 && (
          <p className="p-6 text-center text-gray-500">Chưa có câu hỏi nào từ công dân.</p>
        )}
      </div>
    </div>
  );
}
