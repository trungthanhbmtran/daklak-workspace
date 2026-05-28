import apiClient from "@/lib/axiosInstance";

export const aiApi = {
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
    const prompt = `Bạn là chuyên gia Quản trị nhân sự và Xây dựng Kế hoạch. 
Hãy sinh ra một danh sách 3-5 chỉ tiêu/hành động chính cho Kế hoạch thuộc mô hình ${payload.framework}.
Tên kế hoạch: "${payload.planTitle}"
Mục tiêu: "${payload.planObjective}"
Các phòng ban hiện có: ${payload.orgContext}
Các chức danh/ngạch hiện có: ${payload.rolesContext}

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

    const res = await apiClient.post('/ai/generate', { prompt }) as any;
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
      modelContext = "Tôi đang xây dựng một Kế hoạch Tổng thể. Hãy phân rã công việc theo mô trúc WBS (Work Breakdown Structure).";
    }

    const prompt = `Bạn là một chuyên gia quản trị dự án cấp cao.
${modelContext}

Thông tin Kế hoạch:
Tiêu đề: "${payload.title}"
Mục tiêu: "${payload.objective}"

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
    return this.parseJsonResponse(res);
  },

  /**
   * Hàm hỗ trợ parse chuỗi JSON từ AI
   */
  parseJsonResponse(res: any) {
    if (res.status === 'success' && res.data) {
      let jsonStr = res.data;
      if (jsonStr.startsWith('\`\`\`json')) {
        jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      } else if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
      }
      return JSON.parse(jsonStr);
    }
    throw new Error(res.message || "Lỗi khi gọi AI");
  }
};
