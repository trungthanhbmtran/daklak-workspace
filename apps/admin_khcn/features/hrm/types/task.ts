import { HrmEmployee } from "../types";

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
  
  assignerId: number; // Người giao việc (Lãnh đạo / Trưởng phòng)
  assigneeId: number; // Người xử lý chính (Chuyên viên)
  coAssigneeIds?: number[]; // Người phối hợp
  
  assigner?: HrmEmployee;
  assignee?: HrmEmployee;
  coAssignees?: HrmEmployee[];
  
  startDate: string;
  dueDate: string;
  completedAt?: string;
  
  progress: number; // 0 - 100%
  
  attachments?: HrmTaskAttachment[];
  comments?: HrmTaskComment[];
  kpi?: HrmTaskKPI; // Kết quả đánh giá KPI sau khi hoàn thành
  
  createdAt: string;
  updatedAt: string;
}
