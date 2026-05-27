import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { hrmPlansApi, hrmTasksApi, hrmKpiCriteriaApi, hrmApi, hrmDepartmentsApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';
import type { PlanBasicInfoData } from '../CreatePlan/PlanBasicInfoForm';
import type { TaskItemData } from '../CreatePlan/PlanTaskConfigList';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';
import apiClient from "@/lib/axiosInstance";

export function useCreateMasterPlan() {
  const router = useRouter();
  
  // Local state
  const [activeTab, setActiveTab] = useState('info');
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [plan, setPlan] = useState<PlanBasicInfoData>({
    title: '',
    objective: '',
    type: 'MASTER_PLAN',
    startDate: '',
    endDate: '',
  });

  const [tasks, setTasks] = useState<TaskItemData[]>([{
    title: '', description: '', priority: 'NORMAL', assigneeCode: '', dueDate: '',
    baseScore: 100, weight: 100, scoringMethod: 'MANUAL', 
    difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0,
    bonusPerDay: 0, penaltyPerDay: 0, supervisorCode: '', isKpiLocked: false, kpiCriteriaId: null
  }]);

  // Data fetching using React Query
  const { data: planFrameworkCategories = [] } = useGetCategoryByGroup("PLAN_FRAMEWORK");

  const { data: criteriaLibrary = [] } = useQuery({
    queryKey: hrmKeys.kpis(),
    queryFn: async () => {
      const res = await hrmKpiCriteriaApi.list();
      return res.data || [];
    }
  });

  const { data: departments = [] } = useQuery({
    queryKey: hrmKeys.departments(),
    queryFn: async () => {
      const res = await hrmDepartmentsApi.list();
      return (res.data || []).map((d: any) => d.name);
    }
  });

  const { data: employees = [] } = useQuery({
    queryKey: [...hrmKeys.employees(), 'all'],
    queryFn: async () => {
      const res = await hrmApi.list({ pageSize: 100 });
      return (res.data || []).map((e: any) => ({
        code: e.employeeCode || e.id.toString(),
        name: `${e.lastname} ${e.firstname}`.trim(),
        dept: e.department?.name || 'Chưa phân bổ'
      }));
    }
  });

  // Derived state
  const fields = ["Chuyển đổi số", "Tổ chức cán bộ", "Tài chính", "Đầu tư"];

  const getUiLabels = () => {
    if (plan.type === "OKR") {
      return { tab1: "1. Mục tiêu (Objective)", tab2: "2. Kết quả then chốt (Key Results)", taskPrefix: "KR", taskTitle: "Kết quả then chốt (KR)" };
    }
    if (plan.type === "PROJECT") {
      return { tab1: "1. Tổng quan Dự án", tab2: "2. Giai đoạn & Nhiệm vụ", taskPrefix: "TASK", taskTitle: "Nhiệm vụ / Milestones" };
    }
    return { tab1: "1. Kế hoạch Tổng thể", tab2: "2. Phân rã công việc (WBS)", taskPrefix: "WBS", taskTitle: "Hạng mục công việc" };
  };
  const uiLabels = getUiLabels();

  // Handlers
  const handleTaskChange = (index: number, field: string, value: any) => {
    const newTasks = [...tasks];
    (newTasks[index] as any)[field] = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, {
      title: '', description: '', priority: 'NORMAL', assigneeCode: '', dueDate: '',
      baseScore: 100, weight: 10, scoringMethod: 'MANUAL', 
      difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0,
      bonusPerDay: 0, penaltyPerDay: 0, supervisorCode: '', isKpiLocked: false, kpiCriteriaId: null
    }]);
    toast.success("Đã thêm một mục tiêu con mới");
  };

  const removeTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const openAssigneeModal = (index: number) => {
    setCurrentTaskIndex(index);
    setIsAssigneeModalOpen(true);
  };

  const selectAssignee = (code: string) => {
    if (currentTaskIndex !== null) {
      handleTaskChange(currentTaskIndex, 'assigneeCode', code);
    }
    setIsAssigneeModalOpen(false);
    toast.success(`Đã phân công cho nhân sự ${code}`);
  };

  const applyKpiCriteria = (taskIndex: number, criteriaId: string) => {
    if (criteriaId === "NONE") {
      const newTasks = [...tasks];
      newTasks[taskIndex].isKpiLocked = false;
      newTasks[taskIndex].kpiCriteriaId = null;
      setTasks(newTasks);
      return;
    }

    const criteria = criteriaLibrary.find((c: any) => c.id.toString() === criteriaId);
    if (criteria) {
      const newTasks = [...tasks];
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        kpiCriteriaId: criteria.id,
        isKpiLocked: true,
        baseScore: criteria.baseScore,
        weight: criteria.weight,
        scoringMethod: criteria.scoringMethod,
        difficulty: criteria.difficulty,
        difficultyMultiplier: criteria.difficultyMultiplier,
        bonusThresholdDays: criteria.bonusThresholdDays,
        bonusPerDay: criteria.bonusPerDay,
        penaltyPerDay: criteria.penaltyPerDay,
      };
      setTasks(newTasks);
      toast.success("Đã áp dụng công thức từ Thư viện");
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Vui lòng tải lên tệp Excel (.xlsx, .xls)");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const imported = data.map((row: any) => {
          const criteriaId = row["Mã Tiêu chí KPI (Từ Thư viện)"]?.toString();
          const criteria = criteriaLibrary.find((c: any) => c.id.toString() === criteriaId);
          
          return {
            title: row["Tên công việc"] || row["Tên việc"] || "",
            description: row["Mô tả"] || "",
            priority: row["Độ ưu tiên"] || row["Ưu tiên"] || "NORMAL",
            assigneeCode: row["Mã người nhận"] || row["Người nhận"] || "",
            dueDate: row["Ngày hết hạn"] || row["Deadline"] || "",
            kpiCriteriaId: criteria?.id || null,
            isKpiLocked: !!criteria,
            baseScore: criteria?.baseScore || 100,
            weight: criteria?.weight || 10,
            scoringMethod: criteria?.scoringMethod || 'MANUAL',
            difficulty: criteria?.difficulty || 'NORMAL',
            difficultyMultiplier: criteria?.difficultyMultiplier || 1.0,
            bonusThresholdDays: criteria?.bonusThresholdDays || 0,
            bonusPerDay: criteria?.bonusPerDay || 0,
            penaltyPerDay: criteria?.penaltyPerDay || 0,
            supervisorCode: ''
          };
        });

        const validImported = imported.filter(t => t.title.trim() !== "");
        
        if (validImported.length > 0) {
          if (tasks.length === 1 && tasks[0].title === "" && !tasks[0].kpiCriteriaId) {
            setTasks(validImported);
          } else {
            setTasks([...tasks, ...validImported]);
          }
          toast.success(`Đã import thành công ${validImported.length} phân việc!`);
        } else {
          toast.error("Không tìm thấy dữ liệu hợp lệ trong file");
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi đọc file Excel.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const generateTasksWithAI = async () => {
    if (!plan.title.trim() || !plan.objective.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tiêu đề và Mục tiêu Kế hoạch trước khi nhờ AI phân việc.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      let modelContext = "";
      if (plan.type === "OKR") {
        modelContext = "Tôi đang xây dựng kế hoạch theo mô hình OKR (Objective and Key Results). Hãy sinh ra các 'Kết quả then chốt' (Key Results) đo lường được để đạt được Mục tiêu (Objective) trên.";
      } else if (plan.type === "PROJECT") {
        modelContext = "Tôi đang xây dựng kế hoạch theo mô hình Quản lý Dự án (Project Management). Hãy sinh ra các 'Nhiệm vụ / Milestones' theo từng giai đoạn (Phân tích, Thiết kế, Triển khai, v.v.).";
      } else {
        modelContext = "Tôi đang xây dựng một Kế hoạch Tổng thể. Hãy phân rã công việc theo mô trúc WBS (Work Breakdown Structure).";
      }

      const prompt = `Bạn là một chuyên gia quản trị dự án cấp cao.
${modelContext}

Thông tin Kế hoạch:
Tiêu đề: "${plan.title}"
Mục tiêu: "${plan.objective}"

Hãy sinh ra cho tôi một danh sách 5-10 phân việc quan trọng nhất.
Trả về định dạng JSON thuần túy (không chứa markdown như \`\`\`json) là một mảng các đối tượng:
[
  {
    "title": "Tên công việc / Kết quả then chốt",
    "description": "Mô tả chi tiết",
    "priority": "HIGH",
    "weight": 10
  }
]`;

      const res = await apiClient.post('/ai/generate', { prompt }) as any;
      if (res.status === 'success' && res.data) {
        let jsonStr = res.data;
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```/g, '').trim();
        }

        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const newTasks = parsed.map((item: any) => ({
            title: item.title || '',
            description: item.description || '',
            priority: item.priority || 'NORMAL',
            assigneeCode: '',
            dueDate: '',
            baseScore: 100,
            weight: item.weight || 10,
            scoringMethod: 'MANUAL',
            difficulty: 'NORMAL',
            difficultyMultiplier: 1.0,
            bonusThresholdDays: 0,
            bonusPerDay: 0,
            penaltyPerDay: 0,
            supervisorCode: '',
            isKpiLocked: false,
            kpiCriteriaId: null
          }));
          
          if (tasks.length === 1 && tasks[0].title === "") {
            setTasks(newTasks);
          } else {
            setTasks([...tasks, ...newTasks]);
          }
          toast.success(`AI đã tạo thành công ${newTasks.length} phân việc!`);
        } else {
          throw new Error('Dữ liệu AI trả về không hợp lệ');
        }
      } else {
        throw new Error(res.message || 'Lỗi từ AI');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi gọi AI: ' + (err.message || 'Xin thử lại'));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!plan.title.trim() || !plan.objective.trim()) {
        throw new Error('Vui lòng nhập đầy đủ Tiêu đề và Mục tiêu tổng thể.');
      }
      
      const planRes = await hrmPlansApi.create({
        title: plan.title,
        objective: plan.objective,
        startDate: plan.startDate ? new Date(plan.startDate).toISOString() : null,
        endDate: plan.endDate ? new Date(plan.endDate).toISOString() : null,
        type: plan.type,
        status: 'ACTIVE',
      });

      const planId = planRes.data?.id;

      if (planId && tasks.length > 0) {
        await Promise.all(tasks.filter(t => t.title.trim() !== '').map((task: any) =>
          hrmTasksApi.create({
            title: task.title,
            description: task.description,
            priority: task.priority || 'NORMAL',
            status: 'TODO',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            assigneeCode: task.assigneeCode || 'SYSTEM',
            planId: planId,
            baseScore: Number(task.baseScore) || 0,
            weight: Number(task.weight) || 0,
            scoringMethod: task.scoringMethod,
            bonusPerDay: Number(task.bonusPerDay) || 0,
            penaltyPerDay: Number(task.penaltyPerDay) || 0,
            supervisorCode: task.supervisorCode || 'SYSTEM'
          })
        ));
      }
    },
    onSuccess: () => {
      toast.success('Khởi tạo Kế hoạch & Mục tiêu thành công!');
      router.push('/services/hrm/plans');
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.message || 'Lỗi hệ thống khi lưu Kế hoạch.');
    }
  });

  return {
    plan,
    setPlan,
    tasks,
    activeTab,
    setActiveTab,
    uiLabels,
    criteriaLibrary,
    departments,
    fields,
    employees,
    isAssigneeModalOpen,
    setIsAssigneeModalOpen,
    fileInputRef,
    isSaving: saveMutation.isPending,
    planFrameworkCategories,
    handleTaskChange,
    addTask,
    removeTask,
    openAssigneeModal,
    selectAssignee,
    applyKpiCriteria,
    handleExcelUpload,
    isGeneratingAI,
    generateTasksWithAI,
    handleSave: () => saveMutation.mutate(),
  };
}
