import apiClient from "@/lib/axiosInstance";
import { HrmTaskTheme } from "../types";

const mockTaskThemes: HrmTaskTheme[] = [
  {
    id: 1,
    title: "Tuyển dụng nhân sự mới",
    description: "Tuyển dụng nhân sự theo yêu cầu định biên của các phòng ban",
    defaultMetric: "Thời gian đóng vị trí",
    defaultTarget: "< 30 ngày",
    defaultCases: ["Đăng tuyển", "Lọc CV", "Phỏng vấn vòng 1", "Offer"],
    targetDepartmentIds: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    title: "Phát triển tính năng mới",
    description: "Lập trình và kiểm thử tính năng theo yêu cầu sản phẩm",
    defaultMetric: "Bug rate sau release",
    defaultTarget: "< 5%",
    defaultCases: ["Phân tích tài liệu", "Lập trình", "Tự test (Unit Test)", "Tạo Pull Request"],
    targetDepartmentIds: [2, 3]
  },
  {
    id: 3,
    title: "Quyết toán thuế tháng",
    description: "Thực hiện rà soát và nộp báo cáo thuế đúng hạn",
    defaultMetric: "Tỷ lệ sai sót",
    defaultTarget: "0%",
    defaultCases: ["Kiểm tra hóa đơn", "Đối chiếu sổ phụ ngân hàng", "Lập tờ khai thuế", "Nộp thuế"],
    targetDepartmentIds: [4, 5]
  }
];

export const hrmTaskThemesApi = {
  list(): Promise<{ data: HrmTaskTheme[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockTaskThemes });
      }, 300);
    });
  }
};

export const hrmTasksApi = {
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/tasks', payload).then((res: any) => res);
  }
};
