"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';

export function CreateMasterPlanClient() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:3000/admin/hrm/master-plans/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setPlanData(json.data);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gọi AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!planData) return;
    setIsSaving(true);
    try {
      const planRes = await fetch('http://localhost:3000/admin/hrm/master-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: planData.title,
          objective: planData.objective,
          startDate: planData.startDate,
          endDate: planData.endDate,
          status: 'DRAFT',
          type: 'PROJECT',
        }),
      });
      const planJson = await planRes.json();
      const planId = planJson.data?.id;

      if (planId) {
        if (planData.tasks && planData.tasks.length > 0) {
          await Promise.all(planData.tasks.map((task: any) => 
            fetch('http://localhost:3000/admin/hrm/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: 'TODO',
                dueDate: task.dueDate,
                assigneeCode: task.assigneeCode,
                planId: planId,
              })
            })
          ));
        }
        alert('Đã tạo Chủ trương và giao việc thành công!');
        router.push('/services/hrm/plans');
      } else {
        alert('Lỗi tạo Kế hoạch');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi hệ thống khi lưu Kế hoạch.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Khởi tạo bằng AI (Task Decomposition)
          </CardTitle>
          <p className="text-sm text-gray-500">Dán nội dung Nghị quyết, Văn bản chỉ đạo vào đây để AI tự động phân rã thành Chủ trương và các Đầu việc chi tiết.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <textarea
            className="w-full h-80 p-4 rounded-xl border border-indigo-100 bg-white/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all resize-none shadow-inner"
            placeholder="Nhập nội dung văn bản (VD: Nghị quyết đẩy mạnh CĐS ngành y tế năm 2026...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="relative overflow-hidden w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI đang suy nghĩ...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">✨</span> Phân tích bằng AI
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              </span>
            )}
          </button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Kết quả Đề xuất</CardTitle>
          <p className="text-sm text-gray-500">Chủ trương và danh sách các công việc đã được tự động phân rã.</p>
        </CardHeader>
        <CardContent>
          {!planData ? (
            <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="text-4xl mb-4 opacity-50">🤖</div>
              <p className="text-gray-400 font-medium">Chưa có kết quả phân tích</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-800 mb-2">{planData.title}</h3>
                <p className="text-sm text-blue-700 mb-3"><span className="font-semibold">Mục tiêu:</span> {planData.objective}</p>
                <div className="flex gap-4 text-xs font-medium text-blue-600">
                  <span className="px-2 py-1 bg-blue-100 rounded-md">Từ: {new Date(planData.startDate).toLocaleDateString('vi-VN')}</span>
                  <span className="px-2 py-1 bg-blue-100 rounded-md">Đến: {new Date(planData.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-sm">{planData.tasks.length}</span>
                  Công việc phân rã
                </h4>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
                  {planData.tasks.map((task: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-sm text-slate-800">{task.title}</h5>
                        <span className={`text-[10px] px-2 py-1 font-bold rounded-full uppercase ${
                          task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-slate-500">👤 Giao cho: {task.assigneeCode}</span>
                        <span className="text-slate-500">⏳ Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-md disabled:opacity-50 mt-4"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Kế hoạch & Các công việc'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
