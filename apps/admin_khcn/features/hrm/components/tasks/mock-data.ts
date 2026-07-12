import { HrmTask } from "../../types/task";

export const MOCK_TASKS: HrmTask[] = [
  {
    id: "TASK-001",
    title: "Thẩm định hồ sơ xin cấp phép hoạt động KHCN",
    description: "Kiểm tra và thẩm định hồ sơ công ty TNHH ABC. Đảm bảo đúng quy định hiện hành.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    sourceDocumentRef: "123/UBND-KHCN",
    assignerId: 101, // Lãnh đạo
    assigneeId: 201, // Chuyên viên
    coAssigneeIds: [202],
    assigner: { id: 101, employeeCode: "NV001", firstname: "Nguyễn", lastname: "Văn A", fullName: "Nguyễn Văn A", email: "", phone: "", identityCard: "" },
    assignee: { id: 201, employeeCode: "NV002", firstname: "Trần", lastname: "Thị B", fullName: "Trần Thị B", email: "", phone: "", identityCard: "" },
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // in 2 days
    progress: 40,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    subTasks: [
      {
        id: "SUB-001",
        taskId: "TASK-001",
        title: "Xây dựng đề án",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assigneeId: 201,
        assignee: { id: 201, employeeCode: "NV002", firstname: "Trần", lastname: "Thị B", fullName: "Trần Thị B", email: "", phone: "", identityCard: "" }
      },
      {
        id: "SUB-002",
        taskId: "TASK-001",
        title: "Trình lãnh đạo trung tâm duyệt",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigneeId: 201,
        assignee: { id: 201, employeeCode: "NV002", firstname: "Trần", lastname: "Thị B", fullName: "Trần Thị B", email: "", phone: "", identityCard: "" }
      },
      {
        id: "SUB-003",
        taskId: "TASK-001",
        title: "Trình cho Sở Khoa học & Công nghệ",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigneeId: 202,
        assignee: { id: 202, employeeCode: "NV004", firstname: "Phạm", lastname: "Thị D", fullName: "Phạm Thị D", email: "", phone: "", identityCard: "" }
      },
      {
        id: "SUB-004",
        taskId: "TASK-001",
        title: "Gửi Sở Tài chính thẩm định dự toán",
        status: "TODO",
        assigneeId: 202,
        assignee: { id: 202, employeeCode: "NV004", firstname: "Phạm", lastname: "Thị D", fullName: "Phạm Thị D", email: "", phone: "", identityCard: "" }
      }
    ]
  },
  {
    id: "TASK-002",
    title: "Báo cáo tiến độ đề tài NCKH cấp Tỉnh",
    description: "Tổng hợp báo cáo tiến độ quý 3 các đề tài đang triển khai.",
    status: "PENDING_REVIEW",
    priority: "NORMAL",
    assignerId: 102, // Trưởng phòng
    assigneeId: 201, // Chuyên viên
    assigner: { id: 102, employeeCode: "NV003", firstname: "Lê", lastname: "Văn C", fullName: "Lê Văn C", email: "", phone: "", identityCard: "" },
    assignee: { id: 201, employeeCode: "NV002", firstname: "Trần", lastname: "Thị B", fullName: "Trần Thị B", email: "", phone: "", identityCard: "" },
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // overdue 1 day
    progress: 100,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK-003",
    title: "Tổ chức hội đồng nghiệm thu cơ sở",
    description: "Chuẩn bị tài liệu, phòng họp và gửi giấy mời.",
    status: "COMPLETED",
    priority: "HIGH",
    assignerId: 102,
    assigneeId: 202,
    assigner: { id: 102, employeeCode: "NV003", firstname: "Lê", lastname: "Văn C", fullName: "Lê Văn C", email: "", phone: "", identityCard: "" },
    assignee: { id: 202, employeeCode: "NV004", firstname: "Phạm", lastname: "Thị D", fullName: "Phạm Thị D", email: "", phone: "", identityCard: "" },
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // completed early
    progress: 100,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    kpi: {
      id: "KPI-001",
      taskId: "TASK-003",
      evaluatorId: 102,
      evaluatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      timelinessScore: 40, // 40/40 (Sớm hạn)
      qualityGrade: "EXCELLENT",
      qualityScore: 40, // 40/40
      volumeScore: 20, // 20/20
      totalScore: 100,
      note: "Chuẩn bị chu đáo, đúng tiến độ."
    }
  },
  {
    id: "TASK-004",
    title: "Cập nhật dữ liệu phần mềm quản lý nhiệm vụ",
    description: "Cập nhật danh sách nhiệm vụ năm 2026 lên hệ thống.",
    status: "ASSIGNED",
    priority: "NORMAL",
    assignerId: 102,
    assigneeId: 201,
    assigner: { id: 102, employeeCode: "NV003", firstname: "Lê", lastname: "Văn C", fullName: "Lê Văn C", email: "", phone: "", identityCard: "" },
    assignee: { id: 201, employeeCode: "NV002", firstname: "Trần", lastname: "Thị B", fullName: "Trần Thị B", email: "", phone: "", identityCard: "" },
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TASK-005",
    title: "Xây dựng kế hoạch chuyển đổi số năm 2026",
    description: "Yêu cầu Phòng CNTT chủ trì, phối hợp với các phòng ban khác xây dựng kế hoạch chuyển đổi số.",
    status: "ASSIGNED",
    priority: "HIGH",
    sourceDocumentRef: "246/UBND-CĐS",
    assignerId: 101, // Lãnh đạo
    assigneeDepartmentId: 10, // Phòng CNTT
    assigner: { id: 101, employeeCode: "NV001", firstname: "Nguyễn", lastname: "Văn A", fullName: "Nguyễn Văn A", email: "", phone: "", identityCard: "" },
    assigneeDepartment: { id: 10, name: "Phòng Công nghệ thông tin", code: "CNTT" },
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subTasks: []
  }
];
