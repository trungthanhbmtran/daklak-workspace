 
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
  const [promptSubtaskAssignment, setPromptSubtaskAssignment] = useState('');
  const [promptCalendarReuse, setPromptCalendarReuse] = useState('');
  const [promptSystemAssistant, setPromptSystemAssistant] = useState('');

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

    if (configs['AI_PROMPT_SUBTASK_ASSIGNMENT'] !== undefined) {
      setPromptSubtaskAssignment(configs['AI_PROMPT_SUBTASK_ASSIGNMENT']);
    } else {
      setPromptSubtaskAssignment(`Bạn là Trưởng nhóm đang cần phân rã một công việc lớn thành các công việc con (Subtasks) và giao cho các thành viên trong nhóm.

Thông tin công việc lớn:
Tên: "{parentTitle}"
Mô tả/Yêu cầu: "{parentDescription}"

Danh sách nhân sự hiện có (kèm Ngạch/Chức danh, mã nhân viên):
{employeesContext}

Hãy phân rã công việc này thành 3-5 subtask chi tiết để hoàn thành mục tiêu. Đối với mỗi subtask, hãy đề xuất 1 người thực hiện phù hợp nhất dựa trên danh sách nhân sự.

Trả về duy nhất một mảng JSON thuần túy (không bọc markdown \`\`\`json) theo cấu trúc:
[
  {
    "title": "Tên subtask",
    "description": "Mô tả chi tiết",
    "priority": "HIGH/MEDIUM/LOW",
    "dueDate": "YYYY-MM-DD",
    "assigneeCode": "Mã nhân viên (ví dụ: NV001, hoặc UNASSIGNED nếu không rõ)",
    "reasoning": "Giải thích ngắn gọn lý do chọn người này"
  }
]`);
    }
    if (configs['AI_PROMPT_CALENDAR_SCHEDULE_REUSE'] !== undefined) {
      setPromptCalendarReuse(configs['AI_PROMPT_CALENDAR_SCHEDULE_REUSE']);
    } else {
      setPromptCalendarReuse(`Bạn là một trợ lý AI chuyên tạo lịch trình thông minh.
Dưới đây là lịch trình của tuần trước:
{historyContext}

Dựa vào yêu cầu chỉnh sửa sau: "{userInput}".
Hãy tạo một lịch trình mới hợp lý dựa trên lịch cũ nhưng áp dụng các thay đổi trên.
Trả về CHỈ định dạng JSON (không Markdown) như sau: {"message": "Câu chào mừng ngắn gọn", "events": [{"title": "Tên sự kiện", "time": "Thời gian (VD: 07:00 - 11:30, Ngày mai)"}]}`);
    }

    if (configs['AI_PROMPT_SYSTEM_ASSISTANT'] !== undefined) {
      setPromptSystemAssistant(configs['AI_PROMPT_SYSTEM_ASSISTANT']);
    } else {
      setPromptSystemAssistant(`Bạn là một trợ lý AI thông minh cấp cao của hệ thống HRM (Quản trị Nhân sự & Lập kế hoạch).
Vai trò của bạn là hỗ trợ nhân viên lập kế hoạch, sắp xếp công việc, phân bổ nguồn lực một cách khoa học.
Tuân thủ các nguyên tắc sau:
1. Luôn trả lời ngắn gọn, chuẩn mực, lịch sự.
2. Trả về ĐÚNG cấu trúc JSON được yêu cầu (nếu có), không kèm theo markdown block như \`\`\`json.
3. Luôn bám sát các cơ sở pháp lý và quy chế nội bộ nếu có.
4. Tránh bịa đặt số liệu hoặc thông tin không có thực. Nếu thiếu dữ kiện, hãy sử dụng các ước lượng hợp lý nhưng chỉ ra rõ ràng.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs['AI_PROMPT_MASTER_PLAN_TASKS'], configs['AI_PROMPT_PROJECT_TASKS'], configs['AI_PROMPT_SUBTASK_ASSIGNMENT'], configs['AI_PROMPT_CALENDAR_SCHEDULE_REUSE'], configs['AI_PROMPT_SYSTEM_ASSISTANT']]);

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
        },
        {
          key: 'AI_PROMPT_SUBTASK_ASSIGNMENT',
          value: promptSubtaskAssignment,
          description: 'Mẫu Prompt phân rã công việc & giao việc'
        },
        {
          key: 'AI_PROMPT_CALENDAR_SCHEDULE_REUSE',
          value: promptCalendarReuse,
          description: 'Mẫu Prompt tái sử dụng lịch tuần trước'
        },
        {
          key: 'AI_PROMPT_SYSTEM_ASSISTANT',
          value: promptSystemAssistant,
          description: 'Mẫu System Prompt chung cho Trợ lý AI'
        }
      ]);
      toast.success('Đã lưu cấu hình AI Prompt thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi hệ thống khi lưu cấu hình AI Prompt');
    }
  };

  return (
    <Card className="border border-border shadow-lg bg-card rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquareCode className="w-6 h-6 text-primary" />
          Cấu hình AI Prompt (Kịch bản nhắc lệnh)
        </CardTitle>
        <Button onClick={handleSavePrompts} disabled={updateMultiple.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg px-6 h-11 w-full sm:w-auto">
          {updateMultiple.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu các Prompt</>}
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3 pb-6 border-b border-border">
          <label className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">0. Prompt Trợ lý Hệ thống (System Persona & Legal Basis)</label>
          <p className="text-xs text-muted-foreground">Đây là kịch bản Gốc (System Prompt) sẽ được gửi ngầm cho mọi chức năng AI, nhằm định hướng tính cách, nguyên tắc và cơ sở pháp lý chung của Trợ lý.</p>
          <Textarea 
            className="min-h-[200px] font-mono text-sm bg-violet-50/50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/50 focus-visible:ring-violet-500 rounded-xl"
            value={promptSystemAssistant}
            onChange={(e) => setPromptSystemAssistant(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-muted-foreground">1. Prompt sinh Chỉ tiêu/Hành động (Master Plan)</label>
          <p className="text-xs text-muted-foreground">Các biến hỗ trợ: <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{framework}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{planTitle}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{planObjective}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{orgContext}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{rolesContext}`}</code></p>
          <Textarea 
            className="min-h-[250px] font-mono text-sm bg-background rounded-xl border-input"
            value={promptMasterPlan}
            onChange={(e) => setPromptMasterPlan(e.target.value)}
          />
        </div>
        
        <div className="space-y-3 pt-6 border-t border-border">
          <label className="text-sm font-bold text-muted-foreground">2. Prompt phân rã Công việc (Dự án / OKR)</label>
          <p className="text-xs text-muted-foreground">Các biến hỗ trợ: <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{modelContext}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{title}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{objective}`}</code></p>
          <Textarea 
            className="min-h-[250px] font-mono text-sm bg-background rounded-xl border-input"
            value={promptProjectTasks}
            onChange={(e) => setPromptProjectTasks(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-6 border-t border-border">
          <label className="text-sm font-bold text-muted-foreground">3. Prompt Phân rã Công việc & Giao việc (Subtasks)</label>
          <p className="text-xs text-muted-foreground">Các biến hỗ trợ: <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{parentTitle}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{parentDescription}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{employeesContext}`}</code></p>
          <Textarea 
            className="min-h-[300px] font-mono text-sm bg-background rounded-xl border-input"
            value={promptSubtaskAssignment}
            onChange={(e) => setPromptSubtaskAssignment(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-6 border-t border-border">
          <label className="text-sm font-bold text-muted-foreground">4. Prompt Tái sử dụng lịch tuần trước (Calendar)</label>
          <p className="text-xs text-muted-foreground">Các biến hỗ trợ: <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{historyContext}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-primary">{`{userInput}`}</code></p>
          <Textarea 
            className="min-h-[200px] font-mono text-sm bg-background rounded-xl border-input"
            value={promptCalendarReuse}
            onChange={(e) => setPromptCalendarReuse(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
