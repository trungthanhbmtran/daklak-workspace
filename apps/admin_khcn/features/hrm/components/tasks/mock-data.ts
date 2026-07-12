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
        id: "TASK-001-A",
        parentId: "TASK-001",
        title: "Xây dựng đề án",
        description: "Viết dự thảo đề án trình lãnh đạo",
        status: "COMPLETED",
        priority: "NORMAL",
        assignerId: 102,
        assigneeId: 201,
        assigner: { id: 102, employeeCode: "NV003", firstname: "Lê", lastname: "Văn C", fullName: "Lê Văn C", email: "", phone: "", identityCard: "" },
        assignee: { id: 201, employeeCode: "NV002", firstname: "Trần", lastname: "Thị B", fullName: "Trần Thị B", email: "", phone: "", identityCard: "" },
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 100,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        steps: [
          { id: "S1", taskId: "TASK-001-A", title: "Thu thập tài liệu liên quan", status: "COMPLETED", order: 1 },
          { id: "S2", taskId: "TASK-001-A", title: "Viết dự thảo đề án", status: "COMPLETED", order: 2 },
          { id: "S3", taskId: "TASK-001-A", title: "Gửi lãnh đạo phòng duyệt", status: "COMPLETED", order: 3 },
        ]
      },
      {
        id: "TASK-001-B",
        parentId: "TASK-001",
        title: "Trình cho Sở Khoa học & Công nghệ",
        description: "Gửi công văn xin ý kiến Sở",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assignerId: 102,
        assigneeId: 202,
        assigner: { id: 102, employeeCode: "NV003", firstname: "Lê", lastname: "Văn C", fullName: "Lê Văn C", email: "", phone: "", identityCard: "" },
        assignee: { id: 202, employeeCode: "NV004", firstname: "Phạm", lastname: "Thị D", fullName: "Phạm Thị D", email: "", phone: "", identityCard: "" },
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 50,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
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
    steps: [
      { id: "S4", taskId: "TASK-002", title: "Khảo sát hệ thống cũ", status: "COMPLETED", order: 1 },
      { id: "S5", taskId: "TASK-002", title: "Lập danh sách lỗi", status: "COMPLETED", order: 2 },
      { id: "S6", taskId: "TASK-002", title: "Bảo trì máy chủ", status: "COMPLETED", order: 3 },
      { id: "S7", taskId: "TASK-002", title: "Lập biên bản nghiệm thu", status: "TODO", order: 4 },
    ]
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
