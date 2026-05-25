import apiClient from "@/lib/axiosInstance";
import { HrmMasterPlan, HrmPlanObjective } from "../types";
import { unwrapData, unwrapMeta } from "./utils";

const defaultPerspectives = [
  { id: "FINANCIAL", title: "Tài chính", colorClass: "emerald" },
  { id: "CUSTOMER", title: "Khách hàng", colorClass: "blue" },
  { id: "INTERNAL_PROCESS", title: "Quy trình nội bộ", colorClass: "amber" },
  { id: "LEARNING_GROWTH", title: "Học hỏi & Phát triển", colorClass: "purple" }
];

const mockPlans: HrmMasterPlan[] = [
  { id: 1, title: "Kế hoạch năm 2026", description: "Các nhiệm vụ trọng tâm 2026", startDate: "2026-01-01", endDate: "2026-12-31", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z", perspectives: [...defaultPerspectives] },
  { id: 2, title: "Kế hoạch Quý III/2026", description: "Đẩy mạnh chuyển đổi số", startDate: "2026-07-01", endDate: "2026-09-30", status: "ACTIVE", createdAt: "2026-06-25T00:00:00Z", perspectives: [...defaultPerspectives] }
];

const mockObjectives: HrmPlanObjective[] = [
  { id: 1, planId: 1, perspective: "FINANCIAL", title: "Tối ưu ngân sách Q3", metric: "Tỷ lệ tiết kiệm", target: "10%", weight: 30, status: "IN_PROGRESS", departmentIds: [4] },
  { id: 2, planId: 1, perspective: "CUSTOMER", title: "Nâng cao độ hài lòng", metric: "NPS Score", target: "> 85", weight: 20, status: "TODO", departmentIds: [5] },
  { id: 3, planId: 1, perspective: "INTERNAL_PROCESS", title: "Số hóa quy trình duyệt", metric: "Thời gian xử lý", target: "< 24h", weight: 30, status: "DONE", departmentIds: [2, 3] },
  { id: 4, planId: 1, perspective: "LEARNING_GROWTH", title: "Đào tạo nhân sự mới", metric: "Tỷ lệ pass test", target: "100%", weight: 20, status: "TODO", departmentIds: [3] },
];

export const hrmPlansApi = {
  aiGenerate(payload: { text: string }): Promise<any> {
    return apiClient.post('/hrm/master-plans/ai-generate', payload).then((res: any) => res);
  },

  list(params: any = {}): Promise<{ data: HrmMasterPlan[]; meta: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [...mockPlans],
          meta: { total: mockPlans.length, page: 1, pageSize: 20, totalPages: 1 }
        });
      }, 500);
    });
  },
  
  create(payload: any): Promise<{ success: boolean; data?: HrmMasterPlan }> {
    return apiClient.post('/hrm/master-plans', payload).then((res: any) => res);
  },
  
  getOne(id: number): Promise<HrmMasterPlan | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = mockPlans.find(p => p.id === id);
        if (plan && !plan.perspectives) {
          plan.perspectives = [...defaultPerspectives];
        }
        resolve(plan || null);
      }, 300);
    });
  },

  update(id: number, payload: Partial<HrmMasterPlan>): Promise<{ success: boolean; data?: HrmMasterPlan }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPlans.findIndex(p => p.id === id);
        if (index > -1) {
          mockPlans[index] = { ...mockPlans[index], ...payload };
          resolve({ success: true, data: mockPlans[index] });
        } else {
          resolve({ success: false });
        }
      }, 400);
    });
  }
};

export const hrmObjectivesApi = {
  list(planId: number): Promise<{ data: HrmPlanObjective[] }> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockObjectives.filter(o => o.planId === planId) }), 400);
    });
  },
  
  create(payload: any): Promise<{ success: boolean; data?: HrmPlanObjective }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newObj: HrmPlanObjective = {
          id: Date.now(),
          ...payload,
          status: payload.status || "TODO"
        };
        mockObjectives.push(newObj);
        resolve({ success: true, data: newObj });
      }, 500);
    });
  }
};
