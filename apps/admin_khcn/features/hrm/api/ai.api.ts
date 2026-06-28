import apiClient from "@/lib/axiosInstance";
import { AI_API_TIMEOUT_MS } from "@/config/constants";
import type { ApiResponse } from "@/lib/api.types";

// Cache for system configs to avoid redundant API calls
let configCache: any[] | null = null;
let configCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const aiApi = {
  /**
   * Helper function to get a system config by key with caching.
   * Reads res.data (array) from ApiResponse.
   */
  async getPromptConfig(key: string, defaultPrompt: string): Promise<string> {
    try {
      if (!configCache || Date.now() - configCacheTime > CACHE_TTL_MS) {
        const res = await apiClient.get('/system-configs') as any as ApiResponse<any[]>;
        if (res.success && Array.isArray(res.data)) {
          configCache = res.data;
          configCacheTime = Date.now();
        }
      }
      if (configCache) {
        const config = configCache.find((c: any) => c.key === key);
        if (config?.value) return config.value;
      }
    } catch (e) {
      console.warn(`Could not fetch config ${key}, using fallback prompt.`);
    }
    return defaultPrompt;
  },

  /**
   * Truy vấn trạng thái của một AI Job đang chạy trong Background.
   * Trả về entity job (đã bóc .data).
   */
  async getAiJobStatus(jobId: string): Promise<any> {
    const res = await apiClient.get(`/ai/jobs/${jobId}`) as any as ApiResponse<any>;
    if (res.success) return res.data;
    throw new Error(res.message || "Lỗi khi truy vấn trạng thái AI Job");
  },

  /**
   * Phân công công việc tự động bằng AI.
   */
  async generateTaskAssignment(payload: {
    instruction: string;
    employeesContext: string;
  }): Promise<any> {
    const defaultPrompt = `Bạn là Trưởng phòng nhân sự, đang cần phân công một công việc dựa trên yêu cầu sau:\nYêu cầu công việc: "{instruction}"\n\nDanh sách nhân viên (kèm Ngạch/Chức danh, khối lượng công việc hiện tại):\n{employeesContext}\n\nHãy phân tích yêu cầu và gợi ý người phù hợp nhất (ưu tiên người đúng chuyên môn/ngạch và đang có khối lượng công việc thấp). Đồng thời bóc tách thời gian, mức độ ưu tiên.\n\nTrả về duy nhất 1 JSON object (không bọc trong mảng) theo cấu trúc sau:\n{\n  "taskName": "Tên công việc ngắn gọn",\n  "assigneeCode": "Mã nhân viên được đề xuất",\n  "startDate": "YYYY-MM-DD",\n  "dueDate": "YYYY-MM-DD",\n  "priority": "HIGH/MEDIUM/LOW",\n  "weight": 20,\n  "baseScore": 10,\n  "reasoning": "Giải thích ngắn gọn lý do chọn người này"\n}\nLưu ý: Nếu không rõ ngày, hãy lấy mốc thời gian tương đối tính từ ngày hôm nay (${new Date().toISOString().split('T')[0]}).`;

    const promptTemplate = await this.getPromptConfig('AI_PROMPT_TASK_ASSIGNMENT', defaultPrompt);
    const prompt = promptTemplate
      .replace(/{instruction}/g, payload.instruction)
      .replace(/{employeesContext}/g, payload.employeesContext);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any as ApiResponse<any>;
    if (typeof res.data === 'object') return res.data;
    throw new Error("Không thể khởi tạo tiến trình AI (Task Assignment).");
  },

  /**
   * Sinh danh sách chỉ tiêu/hành động cho Kế hoạch (Master Plan).
   */
  async generateMasterPlanTasks(payload: {
    framework: string;
    planTitle: string;
    planObjective: string;
    orgContext: string;
    rolesContext: string;
  }): Promise<any> {
    const defaultPrompt = `Bạn là chuyên gia Quản trị nhân sự và Xây dựng Kế hoạch. \nHãy sinh ra một danh sách 3-5 chỉ tiêu/hành động chính cho Kế hoạch thuộc mô hình {framework}.\nTên kế hoạch: "{planTitle}"\nMục tiêu: "{planObjective}"\nCác phòng ban hiện có: {orgContext}\nCác chức danh/ngạch hiện có: {rolesContext}\n\nTrả về một mảng JSON thuần túy (KHÔNG CÓ markdown format \`\`\`json, chỉ mảng []) với cấu trúc:\n[\n  {\n    "title": "Tên hành động/chỉ tiêu",\n    "perspective": "DIGITAL_TRANSFORM",\n    "legalBasis": "Căn cứ pháp lý (nếu có)",\n    "metricFactor": 20,\n    "targetValue": 100,\n    "unit": "Tỉ lệ % hoặc số lượng",\n    "supervisor": "Tên phòng ban giám sát",\n    "rankType": "Tên Ngạch/Chức danh phù hợp nhất"\n  }\n]`;

    const promptTemplate = await this.getPromptConfig('AI_PROMPT_MASTER_PLAN_TASKS', defaultPrompt);
    const prompt = promptTemplate
      .replace(/{framework}/g, payload.framework)
      .replace(/{planTitle}/g, payload.planTitle)
      .replace(/{planObjective}/g, payload.planObjective)
      .replace(/{orgContext}/g, payload.orgContext)
      .replace(/{rolesContext}/g, payload.rolesContext);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any as ApiResponse<any>;
    return this.parseJsonData(res);
  },

  /**
   * Sinh danh sách phân việc quan trọng cho Dự án/Kế hoạch.
   */
  async generateProjectTasks(payload: {
    title: string;
    objective: string;
    type: string;
  }): Promise<any> {
    let modelContext = "";
    if (payload.type === "OKR") {
      modelContext = "Tôi đang xây dựng kế hoạch theo mô hình OKR (Objective and Key Results). Hãy sinh ra các 'Kết quả then chốt' (Key Results) đo lường được để đạt được Mục tiêu (Objective) trên.";
    } else if (payload.type === "PROJECT") {
      modelContext = "Tôi đang xây dựng kế hoạch theo mô hình Quản lý Dự án (Project Management). Hãy sinh ra các 'Nhiệm vụ / Milestones' theo từng giai đoạn (Phân tích, Thiết kế, Triển khai, v.v.).";
    } else {
      modelContext = "Tôi đang xây dựng một Kế hoạch Tổng thể. Hãy phân rã công việc theo cấu trúc WBS (Work Breakdown Structure).";
    }

    const defaultPrompt = `Bạn là một chuyên gia quản trị dự án cấp cao.\n{modelContext}\n\nThông tin Kế hoạch:\nTiêu đề: "{title}"\nMục tiêu: "{objective}"\n\nHãy sinh ra cho tôi một danh sách 5-10 phân việc quan trọng nhất.\nTrả về định dạng JSON thuần túy (không chứa markdown như \`\`\`json) là một mảng các đối tượng:\n[\n  {\n    "title": "Tên công việc / Kết quả then chốt",\n    "description": "Mô tả chi tiết",\n    "priority": "HIGH",\n    "weight": 10\n  }\n]`;

    const promptTemplate = await this.getPromptConfig('AI_PROMPT_PROJECT_TASKS', defaultPrompt);
    const prompt = promptTemplate
      .replace(/{modelContext}/g, modelContext)
      .replace(/{title}/g, payload.title)
      .replace(/{objective}/g, payload.objective);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any as ApiResponse<any>;
    return this.parseJsonData(res);
  },

  /**
   * Sinh Kế hoạch thông minh bằng cách đối chiếu Lịch sử và đánh giá Độ khả thi.
   */
  async evaluatePlanFeasibility(payload: {
    title: string;
    type: string;
    objective: string;
    durationDays: number;
    orgContext: string;
    rolesContext: string;
  }): Promise<any> {
    // 1. Fetch Historical Feasibility Data
    let historyStr = "Không tìm thấy dữ liệu lịch sử tương tự.";
    try {
      const histRes = await apiClient.get(`/hrm/master-plans/advanced/historical-feasibility`, {
        params: { title: payload.title, type: payload.type, durationDays: payload.durationDays },
      }) as any as ApiResponse<any>;

      if (histRes.success && histRes.data) {
        const d = histRes.data;
        if (d.pastPlansCount > 0) {
          historyStr = `Dữ liệu lịch sử: Có ${d.pastPlansCount} kế hoạch tương tự.\nTổng số phân việc: ${d.totalTasks}, đã hoàn thành: ${d.completedTasks}, trễ hạn: ${d.overdueTasks}.\nTỷ lệ khả thi trung bình trong quá khứ: ${d.feasibilityScore}%.`;
        }
      }
    } catch (e) {
      console.warn("Could not fetch historical feasibility data", e);
    }

    // 2. Build Prompt cho AI
    const defaultPrompt = `Bạn là chuyên gia Quản trị nhân sự và Xây dựng Kế hoạch có sử dụng dữ liệu lịch sử để đánh giá rủi ro.\nHãy lập danh sách 3-5 công việc chính cho Kế hoạch sau:\nTên kế hoạch: "{title}"\nMục tiêu: "{objective}"\nThời gian dự kiến: {durationDays} ngày\nCác phòng ban hiện có: {orgContext}\nCác chức danh/ngạch hiện có: {rolesContext}\n\n{historyStr}\n\nDựa vào dữ liệu lịch sử, hãy phân tích độ khả thi của kế hoạch này và điều chỉnh phân việc / trọng số / người thực hiện cho phù hợp nhằm tối đa hóa tỷ lệ thành công.\n\nTrả về một mảng JSON thuần túy (chỉ bao gồm mảng [], không chứa text markdown) theo cấu trúc sau:\n[\n  {\n    "type": "FEASIBILITY_ANALYSIS",\n    "score": 85,\n    "advice": "Nhận xét và lời khuyên dựa trên lịch sử để tăng tỷ lệ thành công."\n  },\n  {\n    "type": "TASK",\n    "title": "Tên công việc 1",\n    "priority": "HIGH",\n    "weight": 20,\n    "targetValue": 100,\n    "assigneeRole": "Tên Ngạch/Chức danh được đề xuất",\n    "reasoning": "Lý do giao việc này cho vị trí này dựa vào phân tích AI."\n  }\n]`;

    const promptTemplate = await this.getPromptConfig('AI_PROMPT_EVALUATE_FEASIBILITY', defaultPrompt);
    const prompt = promptTemplate
      .replace(/{title}/g, payload.title)
      .replace(/{objective}/g, payload.objective)
      .replace(/{durationDays}/g, payload.durationDays.toString())
      .replace(/{orgContext}/g, payload.orgContext)
      .replace(/{rolesContext}/g, payload.rolesContext)
      .replace(/{historyStr}/g, historyStr);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any as ApiResponse<any>;
    return this.parseJsonData(res);
  },

  /**
   * Sinh danh sách Subtask kèm phân công nhân sự dựa trên task cha.
   */
  async generateSubTasksAssignment(payload: {
    parentTitle: string;
    parentDescription: string;
    employeesContext: string;
  }): Promise<any> {
    const defaultPrompt = `Bạn là Trưởng nhóm đang cần phân rã một công việc lớn thành các công việc con (Subtasks) và giao cho các thành viên trong nhóm.\n\nThông tin công việc lớn:\nTên: "{parentTitle}"\nMô tả/Yêu cầu: "{parentDescription}"\n\nDanh sách nhân sự hiện có (kèm Ngạch/Chức danh, mã nhân viên):\n{employeesContext}\n\nHãy phân rã công việc này thành 3-5 subtask chi tiết để hoàn thành mục tiêu. Đối với mỗi subtask, hãy đề xuất 1 người thực hiện phù hợp nhất dựa trên danh sách nhân sự.\n\nTrả về duy nhất một mảng JSON thuần túy (không bọc markdown \`\`\`json) theo cấu trúc:\n[\n  {\n    "title": "Tên subtask",\n    "description": "Mô tả chi tiết",\n    "priority": "HIGH/MEDIUM/LOW",\n    "dueDate": "YYYY-MM-DD",\n    "assigneeCode": "Mã nhân viên (ví dụ: NV001, hoặc UNASSIGNED nếu không rõ)",\n    "reasoning": "Giải thích ngắn gọn lý do chọn người này"\n  }\n]\nLưu ý: Nếu không rõ ngày, lấy mốc tương đối từ hôm nay (${new Date().toISOString().split('T')[0]}). Mảng JSON phải đúng chuẩn.`;

    const promptTemplate = await this.getPromptConfig('AI_PROMPT_SUBTASK_ASSIGNMENT', defaultPrompt);
    const prompt = promptTemplate
      .replace(/{parentTitle}/g, payload.parentTitle)
      .replace(/{parentDescription}/g, payload.parentDescription || 'Không có')
      .replace(/{employeesContext}/g, payload.employeesContext);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any as ApiResponse<any>;
    return this.parseJsonData(res);
  },

  /**
   * Parse JSON string từ AI response.
   * Đọc res.data (chuẩn ApiResponse) — không dùng res.status nữa.
   */
  parseJsonData(res: ApiResponse<any>): any {
    if (!res.success) {
      throw new Error(res.message || "Lỗi khi gọi AI (Không xác định)");
    }

    const payload = res.data;

    // Backend trả về object trực tiếp (e.g. { jobId, status })
    if (typeof payload === 'object' && payload !== null) {
      return payload;
    }

    // Backend trả về JSON string
    if (typeof payload === 'string') {
      let jsonStr = payload.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```/g, '').trim();
      }
      return JSON.parse(jsonStr);
    }

    throw new Error("Định dạng phản hồi AI không hợp lệ.");
  },
};
