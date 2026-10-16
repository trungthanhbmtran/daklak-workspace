/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const hrmTasksApi = {
  list(params: any = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get("/hrm/tasks", { params }) as any;
  },

  getStats: async (params?: any) => {
    return apiClient.get("/reports/tasks", { params }) as any;
  },

  getTask(id: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/hrm/tasks/${id}`) as any;
  },

  create(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/tasks', payload) as any;
  },

  getTaskContext(params: {
    departmentId?: number | string;
    assignee?: string;
    coordinatorIds?: string;
    priority?: string;
  }): Promise<ApiResponse<{
    deptLeaders: Array<{
      employeeCode: string;
      fullName: string;
      jobTitleName: string;
      departmentName: string;
      isLeader: boolean;
    }>;
    deptStaff: Array<{
      employeeCode: string;
      fullName: string;
      jobTitleName: string;
      departmentName: string;
      isLeader: boolean;
    }>;
    stepAssigneeOptions: {
      label: string;
      list: Array<{
        employeeCode: string;
        fullName: string;
        jobTitleName: string;
        departmentName: string;
      }>;
    };
    formulaDomainCode: string;
    kpiDefaults: {
      baseScore: number;
      difficultyK: number;
    };
    supervisor: {
      code: string;
      name: string;
      jobTitle?: string;
      unitName?: string;
      reason?: string;
    } | null;
  }>> {
    return apiClient.get('/hrm/tasks/task-context', { params }) as any;
  },

  balancePercentages(payload: {
    coordinatorCount?: number;
    coordinatorCodes?: string[];
  }): Promise<ApiResponse<{
    assigneePercentage: number;
    coordinatorPercentage: number;
    coordinators: Array<{ id: string; percentage: number }>;
  }>> {
    return apiClient.post('/hrm/tasks/balance-percentages', payload) as any;
  },

  getPersonalWorkbench(params?: {
    startDate?: string;
    endDate?: string;
    unitScope?: string;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<{
    metrics: {
      total: number;
      completed: number;
      overdue: number;
      completedOverdue: number;
      dueSoon: number;
      completionRate: number;
    };
    actionItems: Array<{
      id: number;
      title: string;
      status: string;
      dueDate: string;
      priority: string;
    }>;
    recentTasks: Array<{
      id: number;
      title: string;
      docRef: string;
      status: string;
      priority: string;
      dueDate: string;
      role: string;
      progress: number;
      completedAt: string | null;
    }>;
    workloadBenchmark: {
      personalScore: number;
      departmentAverage: number;
      diffPercent: number;
      isLower: boolean;
      evaluation: string;
    };
  }>> {
    return apiClient.get('/hrm/tasks/personal-workbench', { params }) as any;
  },

  getSupervisorByScope(params: { departmentId?: number; domainId?: number; assigneeCode?: string }): Promise<ApiResponse<any>> {
    return apiClient.get('/hrm/tasks/supervisor-by-scope', { params }) as any;
  },

  getRecommendations(params: {
    departmentId?: number;
    domainId?: number;
    jobTitleId?: number;
    strategy?: string;
  }): Promise<ApiResponse<{
    topEmployees: Array<{
      id?: number;
      employeeCode: string;
      employeeName: string;
      fullName?: string;
      departmentId?: number;
      jobTitleId?: number;
      jobTitleName?: string;
      departmentName?: string;
      avatar?: string;
      currentLoad: number;
      performanceScore: number;
      matchScore: number;
      reason?: string;
    }>;
    topDepartments: Array<{
      departmentId: number;
      departmentName?: string;
      employeeCount: number;
      currentLoad: number;
      performanceScore: number;
      lightLoadCount?: number;
      mediumLoadCount?: number;
      heavyLoadCount?: number;
    }>;
  }>> {
    return apiClient.get('/hrm/tasks/recommendations', { params }) as any;
  },

  /** Tạo nhiệm vụ con dưới task được giao. planId tự động propagate từ task cha phía backend. */
  createSubTask(parentId: string | number, payload: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    assignerCode?: string;
    assigneeCode?: string;
    planId?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${parentId}/breakdown`, {
      ...payload,
      assigneeCode: payload.assigneeCode || 'UNASSIGNED',
    }) as any;
  },

  update(id: number, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}`, payload) as any;
  },

  extendTask(id: number, payload: { dueDate: string; reason: string }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/extend`, payload) as any;
  },

  updateStatus(id: number, payload: { status: string; rejectReason?: string; actionName?: string; evidence?: string; evidenceData?: any }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/status`, payload) as any;
  },

  respondTask(id: number, payload: { action: string; rejectReason?: string; message?: string }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/respond`, payload) as any;
  },

  assignTask(id: number, payload: { assigneeCode?: string; assignee?: string; assigneePercentage?: number; coAssigneeCodes?: string[]; coordinators?: string[]; coassigneePercentages?: number[]; departmentId?: number }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/assign`, payload) as any;
  },

  getComments(conversationId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/chat/conversation/${conversationId}/messages`) as any;
  },

  addComment(conversationId: string, payload: { senderId?: string; content: string; type?: string }): Promise<ApiResponse<any>> {
    return apiClient.post(`/chat/message`, { conversationId, ...payload }) as any;
  },

  getSubTasks(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/subtasks`) as any;
  },

  /** Gửi yêu cầu phối hợp lên LÃNH ĐẠO TRỰC TIẾP (người đang xử lý gọi). */
  requestCoordination(id: number, payload?: { message?: string }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/coordinate`, payload || {}) as any;
  },

  getHistory(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/history`) as any;
  },

  /** Steps (Checklist nội bộ) */
  listSteps(taskId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${taskId}/steps`) as any;
  },

  createStep(taskId: number, payload: { title: string; order?: number; assigneeCode?: string; assignee?: string; baseScore?: number | ""; }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${taskId}/steps`, payload) as any;
  },

  updateStep(taskId: number, stepId: number, payload: { title?: string; status?: string; order?: number; assigneeCode?: string; baseScore?: number; evidence?: string; evidenceData?: any }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${taskId}/steps/${stepId}`, payload) as any;
  },

  recordAttendance(id: number): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/attend`) as any;
  },

  getAttendanceStats(id: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/hrm/tasks/${id}/attendance-stats`) as any;
  },
};
