import { HrmEmployee, HrmDepartment } from "../types";

export type TaskStatus = "DRAFT" | "ASSIGNED" | "IN_PROGRESS" | "PENDING_REVIEW" | "COMPLETED" | "OVERDUE" | "REJECTED";
export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type KpiQuality = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";

export interface HrmTaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: number;
  uploadedAt: string;
}

export interface HrmTaskComment {
  id: string;
  taskId: string;
  userId: number;
  content: string;
  createdAt: string;
  user?: HrmEmployee;
}

export interface HrmTaskStep {
  id: string;
  taskId: string;
  title: string;
  status: "TODO" | "COMPLETED";
  order: number;
}

export interface HrmTaskKPI {
  id: string;
  taskId: string;
  evaluatorId: number;
  evaluatedAt: string;
  timelinessScore: number; // Điểm tiến độ (ví dụ: tối đa 40đ)
  qualityGrade: KpiQuality; // Xếp loại chất lượng
  qualityScore: number; // Điểm chất lượng (ví dụ: tối đa 40đ)
  volumeScore: number; // Điểm khối lượng/độ phức tạp (ví dụ: tối đa 20đ)
  totalScore: number; // Tổng điểm
  note?: string;
}

export interface HrmTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  sourceDocumentId?: string; // Nguồn từ văn bản chỉ đạo (nếu có)
  sourceDocumentRef?: string; // Số ký hiệu văn bản
  
  assignerId: number; // Người giao việc (Lãnh đạo)
  
  // Nơi nhận việc (có thể là một cá nhân hoặc một phòng ban)
  assigneeId?: number; 
  assigneeDepartmentId?: number; 
  
  coAssigneeIds?: number[]; // Người phối hợp
  
  assigner?: HrmEmployee;
  assignee?: HrmEmployee;
  assigneeDepartment?: HrmDepartment;
  coAssignees?: HrmEmployee[];

  assigneeName?: string;
  assignerName?: string;
  supervisorName?: string;
  coassigneeNames?: string[];
  assigneeAvatar?: string;
  assigneeJobTitle?: string;
  assigneeUnitName?: string;
  
  startDate: string;
  dueDate: string;
  completedAt?: string;
  
  progress: number; // 0 - 100%
  
  attachments?: HrmTaskAttachment[];
  comments?: HrmTaskComment[];
  kpi?: HrmTaskKPI; // Kết quả đánh giá KPI sau khi hoàn thành
  
  // Quan hệ kế thừa nhiệm vụ (Cây phân cấp)
  parentId?: string; // ID của công việc cha (nếu có)
  parentTask?: HrmTask; 
  subTasks?: HrmTask[]; // Danh sách các công việc con được phân rã từ công việc này
  steps?: HrmTaskStep[]; // Các bước thực hiện nội bộ (checklist) để dễ giám sát tiến độ
  
  
  createdAt: string;
  updatedAt: string;
  allowedActions?: string[];
}
