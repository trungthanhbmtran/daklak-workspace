import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, MessageSquareCode } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useGetSystemConfigs, useUpdateMultipleSystemConfigs } from '../../hooks/useSystemConfigs';
import { toast } from 'sonner';

export function AiPromptConfig() {
  const { data: configs = {} } = useGetSystemConfigs();
  const updateMultiple = useUpdateMultipleSystemConfigs();
  
  const [promptMasterPlan, setPromptMasterPlan] = useState('');
  const [promptProjectTasks, setPromptProjectTasks] = useState('');

  useEffect(() => {
    if (configs['AI_PROMPT_MASTER_PLAN_TASKS'] !== undefined) {
      setPromptMasterPlan(configs['AI_PROMPT_MASTER_PLAN_TASKS']);
    } else {
      setPromptMasterPlan(`Bạn là chuyên gia Quản trị nhân sự và Xây dựng Kế hoạch. 
Hãy sinh ra một danh sách 3-5 chỉ tiêu/hành động chính cho Kế hoạch thuộc mô hình {framework}.
Tên kế hoạch: "{planTitle}"
Mục tiêu: "{planObjective}"
Các phòng ban hiện có: {orgContext}
Các chức danh/ngạch hiện có: {rolesContext}

Trả về một mảng JSON thuần túy (KHÔNG CÓ markdown format \`\`\`json, chỉ mảng []) với cấu trúc:
[
  {
    "title": "Tên hành động/chỉ tiêu",
    "perspective": "DIGITAL_TRANSFORM", // hoặc STRATEGIC_GOAL, OPERATIONAL_REFORM, RESOURCE_FINANCE
    "legalBasis": "Căn cứ pháp lý (nếu có)",
    "metricFactor": 20, // Trọng số hoặc Mức độ ưu tiên
    "targetValue": 100, // Định mức mục tiêu
    "unit": "Tỉ lệ % hoặc số lượng",
    "supervisor": "Tên phòng ban giám sát",
    "rankType": "Tên Ngạch/Chức danh phù hợp nhất"
  }
]`);
    }

    if (configs['AI_PROMPT_PROJECT_TASKS'] !== undefined) {
      setPromptProjectTasks(configs['AI_PROMPT_PROJECT_TASKS']);
    } else {
      setPromptProjectTasks(`Bạn là một chuyên gia quản trị dự án cấp cao.
{modelContext}

Thông tin Kế hoạch:
Tiêu đề: "{title}"
Mục tiêu: "{objective}"

Hãy sinh ra cho tôi một danh sách 5-10 phân việc quan trọng nhất.
Trả về định dạng JSON thuần túy (không chứa markdown như \`\`\`json) là một mảng các đối tượng:
[
  {
    "title": "Tên công việc / Kết quả then chốt",
    "description": "Mô tả chi tiết",
    "priority": "HIGH",
    "weight": 10
  }
]`);
    }
  }, [configs['AI_PROMPT_MASTER_PLAN_TASKS'], configs['AI_PROMPT_PROJECT_TASKS']]);

  const handleSavePrompts = async () => {
    try {
      await updateMultiple.mutateAsync([
        {
          key: 'AI_PROMPT_MASTER_PLAN_TASKS',
          value: promptMasterPlan,
          description: 'Mẫu Prompt sinh Chỉ tiêu/Hành động cho Kế hoạch'
        },
        {
          key: 'AI_PROMPT_PROJECT_TASKS',
          value: promptProjectTasks,
          description: 'Mẫu Prompt sinh công việc cho Dự án/OKR'
        }
      ]);
      toast.success('Đã lưu cấu hình AI Prompt thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi hệ thống khi lưu cấu hình AI Prompt');
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquareCode className="w-6 h-6 text-emerald-600" />
          Cấu hình AI Prompt (Kịch bản nhắc lệnh)
        </CardTitle>
        <Button onClick={handleSavePrompts} disabled={updateMultiple.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg px-6 h-11">
          {updateMultiple.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu các Prompt</>}
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">1. Prompt sinh Chỉ tiêu/Hành động (Master Plan)</label>
          <p className="text-xs text-slate-500">Các biến hỗ trợ: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{framework}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{planTitle}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{planObjective}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{orgContext}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{rolesContext}`}</code></p>
          <Textarea 
            className="min-h-[250px] font-mono text-sm bg-slate-50 rounded-xl border-slate-200"
            value={promptMasterPlan}
            onChange={(e) => setPromptMasterPlan(e.target.value)}
          />
        </div>
        
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <label className="text-sm font-bold text-slate-700">2. Prompt phân rã Công việc (Dự án / OKR)</label>
          <p className="text-xs text-slate-500">Các biến hỗ trợ: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{modelContext}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{title}`}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{`{objective}`}</code></p>
          <Textarea 
            className="min-h-[250px] font-mono text-sm bg-slate-50 rounded-xl border-slate-200"
            value={promptProjectTasks}
            onChange={(e) => setPromptProjectTasks(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
