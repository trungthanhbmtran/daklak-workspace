import apiClient from "@/lib/axiosInstance";
import { AI_API_TIMEOUT_MS } from "@/config/constants";

// Cache for system configs to avoid redundant API calls
let configCache: any[] | null = null;
let configCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const aiApi = {
  /**
   * Helper function to get a system config by key with caching
   */
  async getPromptConfig(key: string, defaultPrompt: string): Promise<string> {
    try {
      if (!configCache || Date.now() - configCacheTime > CACHE_TTL_MS) {
        const res = await apiClient.get('/system-configs') as any;
        if (res.status === 'success' && Array.isArray(res.data)) {
          configCache = res.data;
          configCacheTime = Date.now();
        }
      }

      if (configCache) {
        const config = configCache.find((c: any) => c.key === key);
        if (config && config.value) {
          return config.value;
        }
      }
    } catch (e) {
      console.warn(`Could not fetch config ${key}, using fallback prompt.`);
    }
    return defaultPrompt;
  },

  /**
   * Truy vấn trạng thái của một AI Job đang chạy trong Background
   */
  async getAiJobStatus(jobId: string) {
    const res = await apiClient.get(`/ai/jobs/${jobId}`) as any;
    if (res.status === 'success') {
      return res.data;
    }
    throw new Error(res.message || "Lỗi khi truy vấn trạng thái AI Job");
  },

  /**
   * Sinh danh sách chỉ tiêu/hành động cho Kế hoạch (Master Plan)
   */
  async generateMasterPlanTasks(payload: {
    framework: string;
    planTitle: string;
    planObjective: string;
    orgContext: string;
    rolesContext: string;
  }) {
    const defaultPrompt = `Bạn là chuyên gia Quản trị nhân sự và Xây dựng Kế hoạch. 
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
]`;

    let promptTemplate = await this.getPromptConfig('AI_PROMPT_MASTER_PLAN_TASKS', defaultPrompt);
    
    // Replace placeholders
    const prompt = promptTemplate
      .replace(/{framework}/g, payload.framework)
      .replace(/{planTitle}/g, payload.planTitle)
      .replace(/{planObjective}/g, payload.planObjective)
      .replace(/{orgContext}/g, payload.orgContext)
      .replace(/{rolesContext}/g, payload.rolesContext);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any;
    return this.parseJsonResponse(res);
  },

  /**
   * Sinh danh sách phân việc quan trọng cho Dự án/Kế hoạch (từ hook useCreateMasterPlan)
   */
  async generateProjectTasks(payload: {
    title: string;
    objective: string;
    type: string;
  }) {
    let modelContext = "";
    if (payload.type === "OKR") {
      modelContext = "Tôi đang xây dựng kế hoạch theo mô hình OKR (Objective and Key Results). Hãy sinh ra các 'Kết quả then chốt' (Key Results) đo lường được để đạt được Mục tiêu (Objective) trên.";
    } else if (payload.type === "PROJECT") {
      modelContext = "Tôi đang xây dựng kế hoạch theo mô hình Quản lý Dự án (Project Management). Hãy sinh ra các 'Nhiệm vụ / Milestones' theo từng giai đoạn (Phân tích, Thiết kế, Triển khai, v.v.).";
    } else {
      modelContext = "Tôi đang xây dựng một Kế hoạch Tổng thể. Hãy phân rã công việc theo cấu trúc WBS (Work Breakdown Structure).";
    }

    const defaultPrompt = `Bạn là một chuyên gia quản trị dự án cấp cao.
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
]`;

    let promptTemplate = await this.getPromptConfig('AI_PROMPT_PROJECT_TASKS', defaultPrompt);
    
    // Replace placeholders
    const prompt = promptTemplate
      .replace(/{modelContext}/g, modelContext)
      .replace(/{title}/g, payload.title)
      .replace(/{objective}/g, payload.objective);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any;
    return this.parseJsonResponse(res);
  },

  /**
   * Sinh Kế hoạch thông minh bằng cách đối chiếu Lịch sử và đánh giá Độ khả thi
   */
  async evaluatePlanFeasibility(payload: {
    title: string;
    type: string;
    objective: string;
    durationDays: number;
    orgContext: string;
    rolesContext: string;
  }) {
    // 1. Fetch Historical Feasibility Data
    let historyStr = "Không tìm thấy dữ liệu lịch sử tương tự.";
    try {
      const histRes = await apiClient.get(`/hrm/master-plans/advanced/historical-feasibility`, {
        params: {
          title: payload.title,
          type: payload.type,
          durationDays: payload.durationDays
        }
      }) as any;
      
      if (histRes && histRes.data) {
        const d = histRes.data;
        if (d.pastPlansCount > 0) {
          historyStr = `Dữ liệu lịch sử: Có ${d.pastPlansCount} kế hoạch tương tự.
          Tổng số phân việc: ${d.totalTasks}, đã hoàn thành: ${d.completedTasks}, trễ hạn: ${d.overdueTasks}.
          Tỷ lệ khả thi trung bình trong quá khứ: ${d.feasibilityScore}%.`;
        }
      }
    } catch (e) {
      console.warn("Could not fetch historical feasibility data", e);
    }

    // 2. Build Prompt cho AI
    const defaultPrompt = `Bạn là chuyên gia Quản trị nhân sự và Xây dựng Kế hoạch có sử dụng dữ liệu lịch sử để đánh giá rủi ro.
Hãy lập danh sách 3-5 công việc chính cho Kế hoạch sau:
Tên kế hoạch: "{title}"
Mục tiêu: "{objective}"
Thời gian dự kiến: {durationDays} ngày
Các phòng ban hiện có: {orgContext}
Các chức danh/ngạch hiện có: {rolesContext}

{historyStr}

Dựa vào dữ liệu lịch sử, hãy phân tích độ khả thi của kế hoạch này và điều chỉnh phân việc / trọng số / người thực hiện cho phù hợp nhằm tối đa hóa tỷ lệ thành công.

Trả về một mảng JSON thuần túy (chỉ bao gồm mảng [], không chứa text markdown) theo cấu trúc sau:
[
  {
    "type": "FEASIBILITY_ANALYSIS",
    "score": 85, // Điểm khả thi dự đoán (%)
    "advice": "Nhận xét và lời khuyên dựa trên lịch sử để tăng tỷ lệ thành công."
  },
  {
    "type": "TASK",
    "title": "Tên công việc 1",
    "priority": "HIGH",
    "weight": 20,
    "targetValue": 100,
    "assigneeRole": "Tên Ngạch/Chức danh được đề xuất",
    "reasoning": "Lý do giao việc này cho vị trí này dựa vào phân tích AI."
  }
]`;

    let promptTemplate = await this.getPromptConfig('AI_PROMPT_EVALUATE_FEASIBILITY', defaultPrompt);
    const prompt = promptTemplate
      .replace(/{title}/g, payload.title)
      .replace(/{objective}/g, payload.objective)
      .replace(/{durationDays}/g, payload.durationDays.toString())
      .replace(/{orgContext}/g, payload.orgContext)
      .replace(/{rolesContext}/g, payload.rolesContext)
      .replace(/{historyStr}/g, historyStr);

    const res = await apiClient.post('/ai/generate', { prompt }, { timeout: AI_API_TIMEOUT_MS }) as any;
    return this.parseJsonResponse(res);
  },

  /**
   * Hàm hỗ trợ parse chuỗi JSON từ AI
   */
  parseJsonResponse(res: any) {
    if (res.status === 'success' && res.data) {
      // If backend returns an object directly (like { jobId, status })
      if (typeof res.data === 'object') {
        return res.data;
      }

      let jsonStr = res.data;
      if (typeof jsonStr === 'string') {
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```/g, '').trim();
        }
        return JSON.parse(jsonStr);
      }
    }
    
    // Nếu có lỗi, bóc message từ res.data (do NestJS TransformInterceptor bọc lại)
    const errorMsg = res.message || res.data?.message || res.error || "Lỗi khi gọi AI (Không xác định)";
    throw new Error(errorMsg);
  }
};
