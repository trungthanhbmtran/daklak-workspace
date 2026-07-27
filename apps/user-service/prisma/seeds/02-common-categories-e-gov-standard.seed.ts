import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedCommonCategoriesEGovStandard(prisma: PrismaClient) {
  
  const categoriesData = [
    // --- SYSTEM & MANAGEMENT ---
    {
      group: 'STATUS',
      code: 'ACTIVE',
      order: 1,
      nameVi: 'Hoạt động',
      nameEn: 'Active',
    },
    {
      group: 'STATUS',
      code: 'INACTIVE',
      order: 2,
      nameVi: 'Ngưng hoạt động',
      nameEn: 'Inactive',
    },
    {
      group: 'STATUS',
      code: 'PENDING',
      order: 3,
      nameVi: 'Chờ xử lý',
      nameEn: 'Pending',
    },
    {
      group: 'STATUS',
      code: 'LOCKED',
      order: 4,
      nameVi: 'Đã khóa',
      nameEn: 'Locked',
    },

    // --- WORKFLOW STATUSES ---
    {
      group: 'WORKFLOW_STATUS',
      code: 'RUNNING',
      order: 1,
      nameVi: 'Đang chạy',
      nameEn: 'Running',
      description: '{"color": "bg-blue-100 text-blue-700 border-blue-200", "icon": "Play"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'COMPLETED',
      order: 2,
      nameVi: 'Hoàn thành',
      nameEn: 'Completed',
      description: '{"color": "bg-emerald-100 text-emerald-700 border-emerald-200", "icon": "CheckCircle2"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'FAILED',
      order: 3,
      nameVi: 'Lỗi',
      nameEn: 'Failed',
      description: '{"color": "bg-rose-100 text-rose-700 border-rose-200", "icon": "AlertCircle"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'WAITING',
      order: 4,
      nameVi: 'Đang chờ',
      nameEn: 'Waiting',
      description: '{"color": "bg-amber-100 text-amber-700 border-amber-200", "icon": "Clock"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'TODO',
      order: 5,
      nameVi: 'Cần làm',
      nameEn: 'Todo',
      description: '{"color": "bg-slate-100 text-slate-700 border-slate-200", "icon": "FileText"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'IN_PROGRESS',
      order: 6,
      nameVi: 'Đang xử lý',
      nameEn: 'In Progress',
      description: '{"color": "bg-blue-100 text-blue-700 border-blue-200", "icon": "Activity"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'PENDING_APPROVAL',
      order: 7,
      nameVi: 'Chờ duyệt',
      nameEn: 'Pending Approval',
      description: '{"color": "bg-amber-100 text-amber-700 border-amber-200", "icon": "Clock"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'APPROVED',
      order: 8,
      nameVi: 'Đã duyệt',
      nameEn: 'Approved',
      description: '{"color": "bg-emerald-100 text-emerald-700 border-emerald-200", "icon": "CheckCircle2"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'REJECTED',
      order: 9,
      nameVi: 'Từ chối',
      nameEn: 'Rejected',
      description: '{"color": "bg-rose-100 text-rose-700 border-rose-200", "icon": "XCircle"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'RETURNED',
      order: 10,
      nameVi: 'Trả lại',
      nameEn: 'Returned',
      description: '{"color": "bg-orange-100 text-orange-700 border-orange-200", "icon": "PauseCircle"}'
    },
    {
      group: 'WORKFLOW_STATUS',
      code: 'DONE',
      order: 11,
      nameVi: 'Hoàn tất',
      nameEn: 'Done',
      description: '{"color": "bg-emerald-100 text-emerald-700 border-emerald-200", "icon": "CheckCircle2"}'
    },

    // --- TASK ROLES ---
    {
      group: 'TASK_ROLE',
      code: 'ASSIGNEE',
      order: 1,
      nameVi: 'Người xử lý chính',
      nameEn: 'Assignee',
    },
    {
      group: 'TASK_ROLE',
      code: 'OWNER',
      order: 2,
      nameVi: 'Người giao việc',
      nameEn: 'Owner',
    },
    {
      group: 'TASK_ROLE',
      code: 'APPROVER',
      order: 3,
      nameVi: 'Người theo dõi/Chỉ đạo',
      nameEn: 'Approver',
    },
    {
      group: 'TASK_ROLE',
      code: 'COORDINATOR',
      order: 4,
      nameVi: 'Người phối hợp',
      nameEn: 'Coordinator',
    },

    // --- TASK STATUS ---
    {
      group: 'TASK_STATUS',
      code: 'UNASSIGNED',
      order: 1,
      nameVi: 'Chưa giao',
      nameEn: 'Unassigned',
    },
    {
      group: 'TASK_STATUS',
      code: 'PENDING',
      order: 2,
      nameVi: 'Chờ xử lý',
      nameEn: 'Pending',
    },
    {
      group: 'TASK_STATUS',
      code: 'PROCESSING',
      order: 3,
      nameVi: 'Đang xử lý',
      nameEn: 'Processing',
    },
    {
      group: 'TASK_STATUS',
      code: 'DONE',
      order: 4,
      nameVi: 'Hoàn thành',
      nameEn: 'Done',
    },
    {
      group: 'TASK_STATUS',
      code: 'REJECTED',
      order: 5,
      nameVi: 'Từ chối',
      nameEn: 'Rejected',
    },
    {
      group: 'TASK_STATUS',
      code: 'RETURNED',
      order: 6,
      nameVi: 'Trả lại (Yêu cầu làm lại)',
      nameEn: 'Returned',
    },
    {
      group: 'TASK_STATUS',
      code: 'CANCELED',
      order: 7,
      nameVi: 'Hủy bỏ',
      nameEn: 'Canceled',
    },
    {
      group: 'TASK_STATUS',
      code: 'OVERDUE',
      order: 8,
      nameVi: 'Quá hạn',
      nameEn: 'Overdue',
    },

    {
      group: 'SYSTEM_ACTION',
      code: 'LOGIN',
      order: 1,
      nameVi: 'Đăng nhập',
      nameEn: 'Login',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'LOGOUT',
      order: 2,
      nameVi: 'Đăng xuất',
      nameEn: 'Logout',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'CREATE',
      order: 3,
      nameVi: 'Tạo mới',
      nameEn: 'Create',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'UPDATE',
      order: 4,
      nameVi: 'Cập nhật',
      nameEn: 'Update',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'DELETE',
      order: 5,
      nameVi: 'Xóa',
      nameEn: 'Delete',
    },

    {
      group: 'MICROSERVICE',
      code: 'USER_SERVICE',
      order: 1,
      nameVi: 'Dịch vụ Người dùng',
      nameEn: 'User Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'HRM_SERVICE',
      order: 2,
      nameVi: 'Dịch vụ Nhân sự',
      nameEn: 'HRM Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'DOCUMENT_SERVICE',
      order: 3,
      nameVi: 'Dịch vụ Văn bản',
      nameEn: 'Document Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'POST_SERVICE',
      order: 4,
      nameVi: 'Dịch vụ Nội dung',
      nameEn: 'Content Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'WORKFLOW_SERVICE',
      order: 5,
      nameVi: 'Dịch vụ Quy trình',
      nameEn: 'Workflow Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'INTEGRATION_SERVICE',
      order: 6,
      nameVi: 'Dịch vụ Liên thông',
      nameEn: 'Integration Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'NOTIFICATION_SERVICE',
      order: 7,
      nameVi: 'Dịch vụ Thông báo',
      nameEn: 'Notification Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'API_GATEWAY',
      order: 8,
      nameVi: 'Dịch vụ API Gateway',
      nameEn: 'API Gateway Service',
    },

    // --- WORKFLOW TRIGGERS ---
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'MANUAL',
      order: 1,
      nameVi: 'Kích hoạt thủ công',
      nameEn: 'Manual trigger',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'TASK_ASSIGNMENT',
      order: 2,
      nameVi: 'Luồng Giao Việc (HRM)',
      nameEn: 'Task Assignment Workflow',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'TASK_CHAT',
      order: 3,
      nameVi: 'Luồng Chat/Thảo luận (HRM)',
      nameEn: 'Task Chat Workflow',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'TASK_TRACKING',
      order: 4,
      nameVi: 'Luồng Theo dõi KPI (HRM)',
      nameEn: 'Task KPI Tracking Workflow',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'POST_SUBMIT',
      order: 5,
      nameVi: 'Khi gửi duyệt bài viết (Posts)',
      nameEn: 'On Post Submit',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'DOC_RECEIVED',
      order: 6,
      nameVi: 'Khi nhận văn bản mới (Documents)',
      nameEn: 'On Document Received',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'USER_CREATED',
      order: 7,
      nameVi: 'Khi tạo tài khoản mới (Users)',
      nameEn: 'On User Created',
    },

    // --- AI & TRANSLATION ---
    {
      group: 'AI_PROVIDER_TYPE',
      code: 'OPENAI',
      order: 1,
      nameVi: 'OpenAI (GPT)',
      nameEn: 'OpenAI (GPT)',
    },
    {
      group: 'AI_PROVIDER_TYPE',
      code: 'GEMINI',
      order: 2,
      nameVi: 'Google Gemini',
      nameEn: 'Google Gemini',
    },
    {
      group: 'AI_PROVIDER_TYPE',
      code: 'CLAUDE',
      order: 3,
      nameVi: 'Anthropic Claude',
      nameEn: 'Anthropic Claude',
    },
    {
      group: 'TRANSLATION_SERVICE_TYPE',
      code: 'GOOGLE',
      order: 1,
      nameVi: 'Google Translate API',
      nameEn: 'Google Translate API',
    },
    {
      group: 'TRANSLATION_SERVICE_TYPE',
      code: 'DEEPL',
      order: 2,
      nameVi: 'DeepL Pro',
      nameEn: 'DeepL Pro',
    },
    {
      group: 'TRANSLATION_SERVICE_TYPE',
      code: 'AI_ROUTER',
      order: 3,
      nameVi: 'Dùng chung hệ thống AI Smart Router',
      nameEn: 'Use AI Smart Router',
    },

    // --- GEOGRAPHIC DATA ---
    {
      group: 'PROVINCE',
      code: '47',
      order: 1,
      nameVi: 'Tỉnh Đắk Lắk',
      nameEn: 'Dak Lak Province',
    },
    {
      group: 'PROVINCE',
      code: '01',
      order: 2,
      nameVi: 'Thành phố Hà Nội',
      nameEn: 'Hanoi City',
    },
    {
      group: 'PROVINCE',
      code: '79',
      order: 3,
      nameVi: 'Thành phố Hồ Chí Minh',
      nameEn: 'Ho Chi Minh City',
    },

    {
      group: 'GEO_AREA',
      code: '24001',
      order: 1,
      nameVi: 'Phường Buôn Ma Thuột',
      nameEn: 'Buon Ma Thuot GEO_AREA',
    },

    // --- DOCUMENTS ---
    {
      group: 'DOCUMENT_TYPE',
      code: 'QUYET_DINH',
      order: 1,
      nameVi: 'Quyết định',
      nameEn: 'Decision',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'NGHI_QUYET',
      order: 2,
      nameVi: 'Nghị quyết',
      nameEn: 'Resolution',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'CONG_VAN',
      order: 3,
      nameVi: 'Công văn',
      nameEn: 'Official Letter',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'TO_TRINH',
      order: 4,
      nameVi: 'Tờ trình',
      nameEn: 'Proposal',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'BAO_CAO',
      order: 5,
      nameVi: 'Báo cáo',
      nameEn: 'Report',
    },

    {
      group: 'URGENCY_LEVEL',
      code: 'THUONG',
      order: 1,
      nameVi: 'Thường',
      nameEn: 'Normal',
    },
    {
      group: 'URGENCY_LEVEL',
      code: 'KHAN',
      order: 2,
      nameVi: 'Khẩn',
      nameEn: 'Urgent',
    },
    {
      group: 'URGENCY_LEVEL',
      code: 'HOA_TOC',
      order: 3,
      nameVi: 'Hỏa tốc',
      nameEn: 'Express',
    },

    {
      group: 'SECURITY_LEVEL',
      code: 'THUONG',
      order: 1,
      nameVi: 'Thường',
      nameEn: 'Unclassified',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'MAT',
      order: 2,
      nameVi: 'Mật',
      nameEn: 'Confidential',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'TOI_MAT',
      order: 3,
      nameVi: 'Tối mật',
      nameEn: 'Secret',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'TUYET_MAT',
      order: 4,
      nameVi: 'Tuyệt mật',
      nameEn: 'Top Secret',
    },

    // --- UNIT OF MEASURE (NĐ 335/2025/NĐ-CP) ---
    {
      group: 'UNIT',
      code: 'UNIT_HO_SO',
      order: 1,
      nameVi: 'Hồ sơ',
      nameEn: 'Dossier',
    },
    {
      group: 'UNIT',
      code: 'UNIT_BAO_CAO',
      order: 2,
      nameVi: 'Báo cáo',
      nameEn: 'Report',
    },
    {
      group: 'UNIT',
      code: 'UNIT_VAN_BAN',
      order: 3,
      nameVi: 'Văn bản',
      nameEn: 'Document',
    },
    {
      group: 'UNIT',
      code: 'UNIT_GIO_CONG',
      order: 4,
      nameVi: 'Giờ công',
      nameEn: 'Man-hour',
    },
    {
      group: 'UNIT',
      code: 'UNIT_CHUYEN_DE',
      order: 5,
      nameVi: 'Chuyên đề',
      nameEn: 'Thematic',
    },
    {
      group: 'UNIT',
      code: 'UNIT_LUOT',
      order: 6,
      nameVi: 'Lượt',
      nameEn: 'Turn',
    },

    // --- CIVIL_SERVANT_RANK ---
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'SENIOR_SPECIALIST',
      order: 1,
      nameVi: 'Chuyên viên Cao cấp',
      nameEn: 'Senior Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'PRINCIPAL_SPECIALIST',
      order: 2,
      nameVi: 'Chuyên viên Chính',
      nameEn: 'Principal Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'SPECIALIST',
      order: 3,
      nameVi: 'Chuyên viên',
      nameEn: 'Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'OFFICER',
      order: 4,
      nameVi: 'Cán sự',
      nameEn: 'Officer',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'STAFF',
      order: 5,
      nameVi: 'Nhân viên',
      nameEn: 'Staff',
    },

    // --- PUBLIC_EMPLOYEE_RANK (VIÊN CHỨC THEO ĐỀ ÁN VTVL) ---
    // 1. NGÀNH Y TẾ (HEALTHCARE)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.01.01', order: 1, nameVi: 'Bác sĩ cao cấp (hạng I)', nameEn: 'Senior Doctor (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.01.02', order: 2, nameVi: 'Bác sĩ chính (hạng II)', nameEn: 'Principal Doctor (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.01.03', order: 3, nameVi: 'Bác sĩ (hạng III)', nameEn: 'Doctor (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.03.07', order: 4, nameVi: 'Y sĩ (hạng IV)', nameEn: 'Medical Assistant (Grade IV)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.05.11', order: 5, nameVi: 'Điều dưỡng hạng II', nameEn: 'Nurse Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.05.12', order: 6, nameVi: 'Điều dưỡng hạng III', nameEn: 'Nurse Grade III' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.05.13', order: 7, nameVi: 'Điều dưỡng hạng IV', nameEn: 'Nurse Grade IV' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.07.17', order: 8, nameVi: 'Dược sĩ cao cấp (hạng I)', nameEn: 'Senior Pharmacist (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.07.18', order: 9, nameVi: 'Dược sĩ chính (hạng II)', nameEn: 'Principal Pharmacist (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.08.07.19', order: 10, nameVi: 'Dược sĩ (hạng III)', nameEn: 'Pharmacist (Grade III)' },

    // 2. NGÀNH GIÁO DỤC VÀ ĐÀO TẠO (EDUCATION)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.01.01', order: 11, nameVi: 'Giảng viên cao cấp (hạng I)', nameEn: 'Senior Lecturer (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.01.02', order: 12, nameVi: 'Giảng viên chính (hạng II)', nameEn: 'Principal Lecturer (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.01.03', order: 13, nameVi: 'Giảng viên (hạng III)', nameEn: 'Lecturer (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.05.13', order: 14, nameVi: 'Giáo viên THPT hạng I', nameEn: 'High School Teacher Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.05.14', order: 15, nameVi: 'Giáo viên THPT hạng II', nameEn: 'High School Teacher Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.05.15', order: 16, nameVi: 'Giáo viên THPT hạng III', nameEn: 'High School Teacher Grade III' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.04.30', order: 17, nameVi: 'Giáo viên THCS hạng I', nameEn: 'Secondary School Teacher Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.04.31', order: 18, nameVi: 'Giáo viên THCS hạng II', nameEn: 'Secondary School Teacher Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.04.32', order: 19, nameVi: 'Giáo viên THCS hạng III', nameEn: 'Secondary School Teacher Grade III' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.03.27', order: 20, nameVi: 'Giáo viên Tiểu học hạng I', nameEn: 'Primary School Teacher Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.03.28', order: 21, nameVi: 'Giáo viên Tiểu học hạng II', nameEn: 'Primary School Teacher Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.03.29', order: 22, nameVi: 'Giáo viên Tiểu học hạng III', nameEn: 'Primary School Teacher Grade III' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.02.24', order: 23, nameVi: 'Giáo viên Mầm non hạng I', nameEn: 'Preschool Teacher Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.02.25', order: 24, nameVi: 'Giáo viên Mầm non hạng II', nameEn: 'Preschool Teacher Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.07.02.26', order: 25, nameVi: 'Giáo viên Mầm non hạng III', nameEn: 'Preschool Teacher Grade III' },

    // 3. NGÀNH KHOA HỌC VÀ CÔNG NGHỆ (SCIENCE & TECHNOLOGY)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.01.01', order: 26, nameVi: 'Nghiên cứu viên cao cấp (hạng I)', nameEn: 'Senior Researcher (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.01.02', order: 27, nameVi: 'Nghiên cứu viên chính (hạng II)', nameEn: 'Principal Researcher (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.01.03', order: 28, nameVi: 'Nghiên cứu viên (hạng III)', nameEn: 'Researcher (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.02.05', order: 29, nameVi: 'Kỹ sư cao cấp (hạng I)', nameEn: 'Senior Engineer (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.02.06', order: 30, nameVi: 'Kỹ sư chính (hạng II)', nameEn: 'Principal Engineer (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.02.07', order: 31, nameVi: 'Kỹ sư (hạng III)', nameEn: 'Engineer (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.05.02.08', order: 32, nameVi: 'Kỹ thuật viên (hạng IV)', nameEn: 'Technician (Grade IV)' },

    // 4. NGÀNH THÔNG TIN VÀ TRUYỀN THÔNG (INFO & COMMUNICATION)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.01.01', order: 33, nameVi: 'Biên tập viên hạng I', nameEn: 'Editor Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.01.02', order: 34, nameVi: 'Biên tập viên hạng II', nameEn: 'Editor Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.01.03', order: 35, nameVi: 'Biên tập viên hạng III', nameEn: 'Editor Grade III' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.02.04', order: 36, nameVi: 'Phóng viên hạng I', nameEn: 'Reporter Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.02.05', order: 37, nameVi: 'Phóng viên hạng II', nameEn: 'Reporter Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.02.06', order: 38, nameVi: 'Phóng viên hạng III', nameEn: 'Reporter Grade III' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.06.12', order: 39, nameVi: 'Đạo diễn truyền hình hạng I', nameEn: 'TV Director Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.06.13', order: 40, nameVi: 'Đạo diễn truyền hình hạng II', nameEn: 'TV Director Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.11.06.14', order: 41, nameVi: 'Đạo diễn truyền hình hạng III', nameEn: 'TV Director Grade III' },

    // 5. NGÀNH VĂN HÓA, THỂ THAO VÀ DU LỊCH (CULTURE, SPORTS & TOURISM)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.10.01.01', order: 42, nameVi: 'Huấn luyện viên cao cấp (hạng I)', nameEn: 'Senior Coach (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.10.01.02', order: 43, nameVi: 'Huấn luyện viên chính (hạng II)', nameEn: 'Principal Coach (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.10.01.03', order: 44, nameVi: 'Huấn luyện viên (hạng III)', nameEn: 'Coach (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.10.02.04', order: 45, nameVi: 'Thư viện viên hạng I', nameEn: 'Librarian Grade I' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.10.02.05', order: 46, nameVi: 'Thư viện viên hạng II', nameEn: 'Librarian Grade II' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.10.02.06', order: 47, nameVi: 'Thư viện viên hạng III', nameEn: 'Librarian Grade III' },

    // 6. NGÀNH LƯU TRỮ (ARCHIVES)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.09.02.01', order: 48, nameVi: 'Lưu trữ viên cao cấp (hạng I)', nameEn: 'Senior Archivist (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.09.02.02', order: 49, nameVi: 'Lưu trữ viên chính (hạng II)', nameEn: 'Principal Archivist (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: 'V.09.02.03', order: 50, nameVi: 'Lưu trữ viên (hạng III)', nameEn: 'Archivist (Grade III)' },

    // 7. VIÊN CHỨC DÙNG CHUNG / HÀNH CHÍNH (ADMINISTRATIVE/COMMON)
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '01.001', order: 51, nameVi: 'Chuyên viên cao cấp (hạng I)', nameEn: 'Senior Specialist (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '01.002', order: 52, nameVi: 'Chuyên viên chính (hạng II)', nameEn: 'Principal Specialist (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '01.003', order: 53, nameVi: 'Chuyên viên (hạng III)', nameEn: 'Specialist (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '01.004', order: 54, nameVi: 'Cán sự (hạng IV)', nameEn: 'Administrative Staff (Grade IV)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '01.005', order: 55, nameVi: 'Nhân viên (hạng V)', nameEn: 'Staff (Grade V)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '06.029', order: 56, nameVi: 'Kế toán viên cao cấp (hạng I)', nameEn: 'Senior Accountant (Grade I)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '06.030', order: 57, nameVi: 'Kế toán viên chính (hạng II)', nameEn: 'Principal Accountant (Grade II)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '06.031', order: 58, nameVi: 'Kế toán viên (hạng III)', nameEn: 'Accountant (Grade III)' },
    { group: 'PUBLIC_EMPLOYEE_RANK', code: '06.032', order: 59, nameVi: 'Kế toán viên trung cấp (hạng IV)', nameEn: 'Intermediate Accountant (Grade IV)' },

    // =========================
    // ĐIỀU HÀNH - HÀNH CHÍNH
    // =========================

    // =========================
    // VĂN PHÒNG UBND
    // =========================

    { group: 'DOMAIN', code: 'VAN_PHONG_UBND', nameVi: 'Văn phòng UBND' },
    {
      code: 'CHI_DAO_DIEU_HANH',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Chỉ đạo điều hành',
    },
    {
      group: 'DOMAIN',
      code: 'MOT_CUA',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Một cửa',
    },
    {
      code: 'KIEM_SOAT_TTHC',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Kiểm soát TTHC',
    },

    // =========================
    // SỞ NỘI VỤ
    // =========================

    { group: 'DOMAIN', code: 'SO_NOI_VU', nameVi: 'Sở Nội vụ' },
    {
      code: 'TO_CHUC_BO_MAY',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Tổ chức bộ máy',
    },
    {
      code: 'CAN_BO_CONG_CHUC',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Cán bộ công chức',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_CHUC',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Viên chức',
    },
    {
      code: 'DIA_GIOI_HANH_CHINH',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Địa giới hành chính',
    },
    {
      group: 'DOMAIN',
      code: 'TON_GIAO',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Tôn giáo',
    },
    {
      code: 'THI_DUA_KHEN_THUONG',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Thi đua khen thưởng',
    },

    // =========================
    // SỞ TÀI CHÍNH
    // =========================

    { group: 'DOMAIN', code: 'SO_TAI_CHINH', nameVi: 'Sở Tài chính' },
    {
      group: 'DOMAIN',
      code: 'NGAN_SACH',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Ngân sách',
    },
    {
      code: 'TAI_SAN_CONG',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Tài sản công',
    },
    {
      group: 'DOMAIN',
      code: 'DAU_TU_CONG',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Đầu tư công',
    },
    {
      code: 'DOANH_NGHIEP',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Doanh nghiệp',
    },
    {
      code: 'HOP_TAC_XA',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Kinh tế tập thể - HTX',
    },

    // =========================
    // SỞ XÂY DỰNG
    // =========================

    { group: 'DOMAIN', code: 'SO_XAY_DUNG', nameVi: 'Sở Xây dựng' },
    {
      code: 'QUY_HOACH',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Quy hoạch xây dựng',
    },
    {
      group: 'DOMAIN',
      code: 'NHA_O',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Nhà ở',
    },
    {
      code: 'CAP_PHEP_XAY_DUNG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Cấp phép xây dựng',
    },
    {
      code: 'VAT_LIEU_XAY_DUNG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Vật liệu xây dựng',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_THONG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Giao thông',
    },
    {
      code: 'HA_TANG_DO_THI',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Hạ tầng đô thị',
    },

    // =========================
    // SỞ NÔNG NGHIỆP & MÔI TRƯỜNG
    // =========================

    {
      group: 'DOMAIN',
      code: 'SO_NN_MT',
      nameVi: 'Sở Nông nghiệp và Môi trường',
    },
    {
      group: 'DOMAIN',
      code: 'TRONG_TROT',
      parentCode: 'SO_NN_MT',
      nameVi: 'Trồng trọt',
    },
    {
      group: 'DOMAIN',
      code: 'CHAN_NUOI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Chăn nuôi',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_LOI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Thủy lợi',
    },
    {
      group: 'DOMAIN',
      code: 'LAM_NGHIEP',
      parentCode: 'SO_NN_MT',
      nameVi: 'Lâm nghiệp',
    },
    {
      group: 'DOMAIN',
      code: 'DAT_DAI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Đất đai',
    },
    {
      group: 'DOMAIN',
      code: 'MOI_TRUONG',
      parentCode: 'SO_NN_MT',
      nameVi: 'Môi trường',
    },
    {
      code: 'KHI_TUONG_THUY_VAN',
      parentCode: 'SO_NN_MT',
      nameVi: 'Khí tượng thủy văn',
    },

    // =========================
    // SỞ KHOA HỌC & CÔNG NGHỆ
    // =========================

    { group: 'DOMAIN', code: 'H15.07', nameVi: 'Sở Khoa học và Công nghệ' },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO',
      parentCode: 'H15.07',
      nameVi: 'Chuyển đổi số',
    },
    {
      group: 'DOMAIN',
      code: 'DU_LIEU_SO',
      parentCode: 'H15.07',
      nameVi: 'Dữ liệu số',
    },
    {
      code: 'AN_TOAN_THONG_TIN',
      parentCode: 'H15.07',
      nameVi: 'An toàn thông tin',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THONG',
      parentCode: 'H15.07',
      nameVi: 'Viễn thông',
    },
    {
      group: 'DOMAIN',
      code: 'KINH_TE_SO',
      parentCode: 'H15.07',
      nameVi: 'Kinh tế số',
    },

    // =========================
    // SỞ GIÁO DỤC
    // =========================

    { group: 'DOMAIN', code: 'SO_GIAO_DUC', nameVi: 'Sở Giáo dục và Đào tạo' },
    {
      group: 'DOMAIN',
      code: 'MAM_NON',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Mầm non',
    },
    {
      group: 'DOMAIN',
      code: 'TIEU_HOC',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Tiểu học',
    },
    {
      group: 'DOMAIN',
      code: 'THCS',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'THCS',
    },
    {
      group: 'DOMAIN',
      code: 'THPT',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'THPT',
    },
    {
      code: 'GIAO_DUC_NGHE',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Giáo dục nghề nghiệp',
    },

    // =========================
    // SỞ Y TẾ
    // =========================

    { group: 'DOMAIN', code: 'SO_Y_TE', nameVi: 'Sở Y tế' },
    {
      group: 'DOMAIN',
      code: 'KHAM_CHUA_BENH',
      parentCode: 'SO_Y_TE',
      nameVi: 'Khám chữa bệnh',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_DU_PHONG',
      parentCode: 'SO_Y_TE',
      nameVi: 'Y tế dự phòng',
    },
    { group: 'DOMAIN', code: 'DUOC', parentCode: 'SO_Y_TE', nameVi: 'Dược' },
    {
      code: 'AN_TOAN_THUC_PHAM',
      parentCode: 'SO_Y_TE',
      nameVi: 'An toàn thực phẩm',
    },

    // =========================
    // CÔNG AN
    // =========================

    { group: 'DOMAIN', code: 'CONG_AN', nameVi: 'Công an' },
    {
      group: 'DOMAIN',
      code: 'AN_NINH',
      parentCode: 'CONG_AN',
      nameVi: 'An ninh',
    },
    {
      group: 'DOMAIN',
      code: 'TRAT_TU_XA_HOI',
      parentCode: 'CONG_AN',
      nameVi: 'Trật tự xã hội',
    },
    { group: 'DOMAIN', code: 'PCCC', parentCode: 'CONG_AN', nameVi: 'PCCC' },
    {
      group: 'DOMAIN',
      code: 'CU_TRU',
      parentCode: 'CONG_AN',
      nameVi: 'Cư trú',
    },

    // =========================
    // QUÂN SỰ
    // =========================

    { group: 'DOMAIN', code: 'QUAN_SU', nameVi: 'Quân sự' },
    {
      code: 'QUOC_PHONG_DIA_PHUONG',
      parentCode: 'QUAN_SU',
      nameVi: 'Quốc phòng địa phương',
    },
    {
      group: 'DOMAIN',
      code: 'DAN_QUAN_TU_VE',
      parentCode: 'QUAN_SU',
      nameVi: 'Dân quân tự vệ',
    },
    {
      code: 'NGHIA_VU_QUAN_SU',
      parentCode: 'QUAN_SU',
      nameVi: 'Nghĩa vụ quân sự',
    },

    {
      group: 'STORAGE_PERIOD',
      code: '5_YEARS',
      order: 1,
      nameVi: '05 năm',
      nameEn: '5 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: '10_YEARS',
      order: 2,
      nameVi: '10 năm',
      nameEn: '10 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: '20_YEARS',
      order: 3,
      nameVi: '20 năm',
      nameEn: '20 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: 'PERMANENT',
      order: 4,
      nameVi: 'Vĩnh viễn',
      nameEn: 'Permanent',
    },

    // --- HRM & PERSONAL ---
    { group: 'GENDER', code: 'NAM', order: 1, nameVi: 'Nam', nameEn: 'Male' },
    { group: 'GENDER', code: 'NU', order: 2, nameVi: 'Nữ', nameEn: 'Female' },
    {
      group: 'GENDER',
      code: 'KHAC',
      order: 3,
      nameVi: 'Khác',
      nameEn: 'Other',
    },

    {
      group: 'ETHNICITY',
      code: 'KINH',
      order: 1,
      nameVi: 'Kinh',
      nameEn: 'Kinh',
    },
    {
      group: 'ETHNICITY',
      code: 'EDE',
      order: 2,
      nameVi: 'Ê-đê',
      nameEn: 'Ede',
    },
    {
      group: 'ETHNICITY',
      code: 'M_NONG',
      order: 3,
      nameVi: "M'Nông",
      nameEn: "M'Nong",
    },

    {
      group: 'RELIGION',
      code: 'KHONG',
      order: 1,
      nameVi: 'Không',
      nameEn: 'None',
    },
    {
      group: 'RELIGION',
      code: 'PHAT_GIAO',
      order: 2,
      nameVi: 'Phật giáo',
      nameEn: 'Buddhism',
    },
    {
      group: 'RELIGION',
      code: 'CONG_GIAO',
      order: 3,
      nameVi: 'Công giáo',
      nameEn: 'Catholicism',
    },

    {
      group: 'IDENTITY_TYPE',
      code: 'CCCD',
      order: 1,
      nameVi: 'Căn cước công dân',
      nameEn: 'Citizen Identity Card',
    },
    {
      group: 'IDENTITY_TYPE',
      code: 'PASSPORT',
      order: 2,
      nameVi: 'Hộ chiếu',
      nameEn: 'Passport',
    },

    {
      group: 'POSITION',
      code: 'GIAM_DOC',
      order: 1,
      nameVi: 'Giám đốc',
      nameEn: 'Director',
    },
    {
      group: 'POSITION',
      code: 'PHO_GIAM_DOC',
      order: 2,
      nameVi: 'Phó Giám đốc',
      nameEn: 'Deputy Director',
    },
    {
      group: 'POSITION',
      code: 'TRUONG_PHONG',
      order: 3,
      nameVi: 'Trưởng phòng',
      nameEn: 'Head of Department',
    },
    {
      group: 'POSITION',
      code: 'PHO_TRUONG_PHONG',
      order: 4,
      nameVi: 'Phó Trưởng phòng',
      nameEn: 'Deputy Head of Department',
    },
    {
      group: 'POSITION',
      code: 'CHANH_VAN_PHONG',
      order: 5,
      nameVi: 'Chánh Văn phòng',
      nameEn: 'Chief of Office',
    },
    {
      group: 'POSITION',
      code: 'PHO_CHANH_VAN_PHONG',
      order: 6,
      nameVi: 'Phó Chánh Văn phòng',
      nameEn: 'Deputy Chief of Office',
    },
    {
      group: 'POSITION',
      code: 'CHANH_THANH_TRA',
      order: 7,
      nameVi: 'Chánh Thanh tra',
      nameEn: 'Chief Inspector',
    },
    {
      group: 'POSITION',
      code: 'PHO_CHANH_THANH_TRA',
      order: 8,
      nameVi: 'Phó Chánh Thanh tra',
      nameEn: 'Deputy Chief Inspector',
    },
    {
      group: 'POSITION',
      code: 'SPECIALIST',
      order: 9,
      nameVi: 'Chuyên viên',
      nameEn: 'Expert',
    },

    {
      group: 'ACADEMIC_RANK',
      code: 'TIEN_SI',
      order: 1,
      nameVi: 'Tiến sĩ',
      nameEn: 'Doctor of Philosophy',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'THAC_SI',
      order: 2,
      nameVi: 'Thạc sĩ',
      nameEn: 'Master of Science',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'GIAO_SU',
      order: 3,
      nameVi: 'Giáo sư',
      nameEn: 'Professor',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'PHO_GIAO_SU',
      order: 4,
      nameVi: 'Phó Giáo sư',
      nameEn: 'Associate Professor',
    },

    {
      group: 'POLITICAL_THEORY',
      code: 'CAO_CAP',
      order: 1,
      nameVi: 'Cao cấp',
      nameEn: 'Advanced',
    },
    {
      group: 'POLITICAL_THEORY',
      code: 'TRUNG_CAP',
      order: 2,
      nameVi: 'Trung cấp',
      nameEn: 'Intermediate',
    },
    {
      group: 'POLITICAL_THEORY',
      code: 'SO_CAP',
      order: 3,
      nameVi: 'Sơ cấp',
      nameEn: 'Elementary',
    },

    {
      group: 'IT_SKILL',
      code: 'CO_BAN',
      order: 1,
      nameVi: 'Cơ bản',
      nameEn: 'Basic',
    },
    {
      group: 'IT_SKILL',
      code: 'NANG_CAO',
      order: 2,
      nameVi: 'Nâng cao',
      nameEn: 'Advanced',
    },

    {
      group: 'LANGUAGE_SKILL',
      code: 'ENGLISH_B1',
      order: 1,
      nameVi: 'Tiếng Anh B1',
      nameEn: 'English B1',
    },
    {
      group: 'LANGUAGE_SKILL',
      code: 'ENGLISH_B2',
      order: 2,
      nameVi: 'Tiếng Anh B2',
      nameEn: 'English B2',
    },

    // --- SYSTEM LANGUAGES ---
    {
      group: 'LANGUAGE',
      code: 'vi',
      order: 1,
      nameVi: 'Tiếng Việt',
      nameEn: 'Vietnamese',
    },
    {
      group: 'LANGUAGE',
      code: 'en',
      order: 2,
      nameVi: 'Tiếng Anh',
      nameEn: 'English',
    },

    {
      group: 'SYSTEM_ACTION',
      code: 'APPROVE',
      order: 6,
      nameVi: 'Phê duyệt',
      nameEn: 'Approve',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'REJECT',
      order: 7,
      nameVi: 'Từ chối',
      nameEn: 'Reject',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'PUBLISH',
      order: 8,
      nameVi: 'Xuất bản',
      nameEn: 'Publish',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'REQUEST_INFO',
      order: 9,
      nameVi: 'Yêu cầu bổ sung',
      nameEn: 'Request Info',
    },

    // --- OTHER ---
    {
      group: 'DOMAIN',
      code: 'KHCN',
      order: 1,
      nameVi: 'Khoa học công nghệ',
      nameEn: 'Science & Technology',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_KHOA_HOC',
      order: 2,
      nameVi: 'Quản lý khoa học',
      nameEn: 'Scientific Management',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_CONG_NGHE',
      order: 3,
      nameVi: 'Quản lý công nghệ',
      nameEn: 'Technology Management',
    },
    {
      group: 'DOMAIN',
      code: 'DOI_MOI_SANG_TAO',
      order: 4,
      nameVi: 'Đổi mới sáng tạo',
      nameEn: 'Innovation',
    },
    {
      group: 'DOMAIN',
      code: 'SO_HUU_TRI_TUE',
      order: 5,
      nameVi: 'Sở hữu trí tuệ',
      nameEn: 'Intellectual Property',
    },
    {
      group: 'DOMAIN',
      code: 'TIEU_CHUAN_DO_LUONG_CHAT_LUONG',
      order: 6,
      nameVi: 'Tiêu chuẩn đo lường chất lượng',
      nameEn: 'Standards Metrology & Quality',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_BUC_XA_HAT_NHAN',
      order: 7,
      nameVi: 'An toàn bức xạ hạt nhân',
      nameEn: 'Radiation & Nuclear Safety',
    },
    {
      group: 'DOMAIN',
      code: 'UNG_DUNG_KHCN',
      order: 8,
      nameVi: 'Ứng dụng khoa học công nghệ',
      nameEn: 'Science & Technology Application',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO',
      order: 9,
      nameVi: 'Chuyển đổi số',
      nameEn: 'Digital Transformation',
    },
    {
      group: 'DOMAIN',
      code: 'DU_LIEU_SO',
      order: 10,
      nameVi: 'Dữ liệu số',
      nameEn: 'Digital Data',
    },
    {
      group: 'DOMAIN',
      code: 'CHINH_QUYEN_SO',
      order: 11,
      nameVi: 'Chính quyền số',
      nameEn: 'Digital Government',
    },
    {
      group: 'DOMAIN',
      code: 'KINH_TE_SO',
      order: 12,
      nameVi: 'Kinh tế số',
      nameEn: 'Digital Economy',
    },
    {
      group: 'DOMAIN',
      code: 'XA_HOI_SO',
      order: 13,
      nameVi: 'Xã hội số',
      nameEn: 'Digital Society',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_THONG_TIN',
      order: 14,
      nameVi: 'An toàn thông tin',
      nameEn: 'Cyber Security',
    },
    {
      group: 'DOMAIN',
      code: 'CONG_NGHE_THONG_TIN',
      order: 15,
      nameVi: 'Công nghệ thông tin',
      nameEn: 'Information Technology',
    },

    {
      group: 'DOMAIN',
      code: 'GIAO_DUC',
      order: 16,
      nameVi: 'Giáo dục',
      nameEn: 'Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_MAM_NON',
      order: 17,
      nameVi: 'Giáo dục mầm non',
      nameEn: 'Preschool Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_TIEU_HOC',
      order: 18,
      nameVi: 'Giáo dục tiểu học',
      nameEn: 'Primary Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THCS',
      order: 19,
      nameVi: 'Giáo dục THCS',
      nameEn: 'Secondary Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THPT',
      order: 20,
      nameVi: 'Giáo dục THPT',
      nameEn: 'High School Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THUONG_XUYEN',
      order: 21,
      nameVi: 'Giáo dục thường xuyên',
      nameEn: 'Continuing Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_NGHE_NGHIEP',
      order: 22,
      nameVi: 'Giáo dục nghề nghiệp',
      nameEn: 'Vocational Education',
    },
    {
      group: 'DOMAIN',
      code: 'KHAO_THI_KIEM_DINH',
      order: 23,
      nameVi: 'Khảo thí kiểm định',
      nameEn: 'Testing & Accreditation',
    },
    {
      group: 'DOMAIN',
      code: 'HOC_SINH_SINH_VIEN',
      order: 24,
      nameVi: 'Học sinh sinh viên',
      nameEn: 'Students Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO_GIAO_DUC',
      order: 25,
      nameVi: 'Chuyển đổi số giáo dục',
      nameEn: 'Digital Education',
    },

    {
      group: 'DOMAIN',
      code: 'Y_TE',
      order: 26,
      nameVi: 'Y tế',
      nameEn: 'Healthcare',
    },
    {
      group: 'DOMAIN',
      code: 'KHAM_CHUA_BENH',
      order: 27,
      nameVi: 'Khám chữa bệnh',
      nameEn: 'Medical Examination & Treatment',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_DU_PHONG',
      order: 28,
      nameVi: 'Y tế dự phòng',
      nameEn: 'Preventive Medicine',
    },
    {
      group: 'DOMAIN',
      code: 'DUOC_PHAM',
      order: 29,
      nameVi: 'Dược phẩm',
      nameEn: 'Pharmaceuticals',
    },
    {
      group: 'DOMAIN',
      code: 'THIET_BI_Y_TE',
      order: 30,
      nameVi: 'Thiết bị y tế',
      nameEn: 'Medical Equipment',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_THUC_PHAM',
      order: 31,
      nameVi: 'An toàn thực phẩm',
      nameEn: 'Food Safety',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_HIEM_Y_TE',
      order: 32,
      nameVi: 'Bảo hiểm y tế',
      nameEn: 'Health Insurance',
    },
    {
      group: 'DOMAIN',
      code: 'DAN_SO',
      order: 33,
      nameVi: 'Dân số',
      nameEn: 'Population',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_CO_SO',
      order: 34,
      nameVi: 'Y tế cơ sở',
      nameEn: 'Primary Healthcare',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO_Y_TE',
      order: 35,
      nameVi: 'Chuyển đổi số y tế',
      nameEn: 'Digital Healthcare',
    },

    {
      group: 'DOMAIN',
      code: 'NONG_NGHIEP',
      order: 36,
      nameVi: 'Nông nghiệp & PTNT',
      nameEn: 'Agriculture & Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'TRONG_TROT',
      order: 37,
      nameVi: 'Trồng trọt',
      nameEn: 'Crop Production',
    },
    {
      group: 'DOMAIN',
      code: 'CHAN_NUOI',
      order: 38,
      nameVi: 'Chăn nuôi',
      nameEn: 'Livestock',
    },
    {
      group: 'DOMAIN',
      code: 'THU_Y',
      order: 39,
      nameVi: 'Thú y',
      nameEn: 'Veterinary',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_SAN',
      order: 40,
      nameVi: 'Thủy sản',
      nameEn: 'Fisheries',
    },
    {
      group: 'DOMAIN',
      code: 'LAM_NGHIEP',
      order: 41,
      nameVi: 'Lâm nghiệp',
      nameEn: 'Forestry',
    },
    {
      group: 'DOMAIN',
      code: 'KIEM_LAM',
      order: 42,
      nameVi: 'Kiểm lâm',
      nameEn: 'Forest Protection',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_LOI',
      order: 43,
      nameVi: 'Thủy lợi',
      nameEn: 'Irrigation',
    },
    {
      group: 'DOMAIN',
      code: 'PHAT_TRIEN_NONG_THON',
      order: 44,
      nameVi: 'Phát triển nông thôn',
      nameEn: 'Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'NONG_THON_MOI',
      order: 45,
      nameVi: 'Nông thôn mới',
      nameEn: 'New Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'PHONG_CHONG_THIEN_TAI',
      order: 46,
      nameVi: 'Phòng chống thiên tai',
      nameEn: 'Disaster Prevention',
    },
    {
      group: 'DOMAIN',
      code: 'CHAT_LUONG_NONG_LAM_SAN',
      order: 47,
      nameVi: 'Chất lượng nông lâm sản',
      nameEn: 'Agro-Forestry Quality',
    },
    {
      group: 'DOMAIN',
      code: 'KHUYEN_NONG',
      order: 48,
      nameVi: 'Khuyến nông',
      nameEn: 'Agricultural Extension',
    },

    {
      group: 'DOMAIN',
      code: 'CONG_THUONG',
      order: 49,
      nameVi: 'Công thương',
      nameEn: 'Industry & Trade',
    },
    {
      group: 'DOMAIN',
      code: 'CONG_NGHIEP',
      order: 50,
      nameVi: 'Công nghiệp',
      nameEn: 'Industry',
    },
    {
      group: 'DOMAIN',
      code: 'THUONG_MAI',
      order: 51,
      nameVi: 'Thương mại',
      nameEn: 'Trade',
    },
    {
      group: 'DOMAIN',
      code: 'XUC_TIEN_THUONG_MAI',
      order: 52,
      nameVi: 'Xúc tiến thương mại',
      nameEn: 'Trade Promotion',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_THI_TRUONG',
      order: 53,
      nameVi: 'Quản lý thị trường',
      nameEn: 'Market Surveillance',
    },
    {
      group: 'DOMAIN',
      code: 'XUAT_NHAP_KHAU',
      order: 54,
      nameVi: 'Xuất nhập khẩu',
      nameEn: 'Import Export',
    },
    {
      group: 'DOMAIN',
      code: 'NANG_LUONG',
      order: 55,
      nameVi: 'Năng lượng',
      nameEn: 'Energy',
    },
    {
      group: 'DOMAIN',
      code: 'DIEN_LUC',
      order: 56,
      nameVi: 'Điện lực',
      nameEn: 'Electricity',
    },
    {
      group: 'DOMAIN',
      code: 'THUONG_MAI_DIEN_TU',
      order: 57,
      nameVi: 'Thương mại điện tử',
      nameEn: 'E-Commerce',
    },
    {
      group: 'DOMAIN',
      code: 'CU_M_CONG_NGHIEP',
      order: 58,
      nameVi: 'Cụm công nghiệp',
      nameEn: 'Industrial Clusters',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_VE_NGUOI_TIEU_DUNG',
      order: 59,
      nameVi: 'Bảo vệ người tiêu dùng',
      nameEn: 'Consumer Protection',
    },

    {
      group: 'DOMAIN',
      code: 'NOI_VU',
      order: 60,
      nameVi: 'Nội vụ',
      nameEn: 'Home Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'TO_CHUC_BO_MAY',
      order: 61,
      nameVi: 'Tổ chức bộ máy',
      nameEn: 'Organizational Structure',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_CHE',
      order: 62,
      nameVi: 'Biên chế',
      nameEn: 'Staff Quota',
    },
    {
      group: 'DOMAIN',
      code: 'CAN_BO_CONG_CHUC',
      order: 63,
      nameVi: 'Cán bộ công chức viên chức',
      nameEn: 'Civil Servants Management',
    },
    {
      group: 'DOMAIN',
      code: 'CHINH_QUYEN_DIA_PHUONG',
      order: 64,
      nameVi: 'Chính quyền địa phương',
      nameEn: 'Local Government',
    },
    {
      group: 'DOMAIN',
      code: 'DIA_GIOI_HANH_CHINH',
      order: 65,
      nameVi: 'Địa giới hành chính',
      nameEn: 'Administrative Boundaries',
    },
    {
      group: 'DOMAIN',
      code: 'THI_DUA_KHEN_THUONG',
      order: 66,
      nameVi: 'Thi đua khen thưởng',
      nameEn: 'Emulation & Reward',
    },
    {
      group: 'DOMAIN',
      code: 'TON_GIAO',
      order: 67,
      nameVi: 'Tôn giáo',
      nameEn: 'Religious Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'VAN_THU_LUU_TRU',
      order: 68,
      nameVi: 'Văn thư lưu trữ',
      nameEn: 'Archives & Records',
    },
    {
      group: 'DOMAIN',
      code: 'CAI_CACH_HANH_CHINH',
      order: 69,
      nameVi: 'Cải cách hành chính',
      nameEn: 'Administrative Reform',
    },

    {
      group: 'DOMAIN',
      code: 'TAI_NGUYEN_MOI_TRUONG',
      order: 70,
      nameVi: 'Tài nguyên & Môi trường',
      nameEn: 'Natural Resources & Environment',
    },
    {
      group: 'DOMAIN',
      code: 'DAT_DAI',
      order: 71,
      nameVi: 'Đất đai',
      nameEn: 'Land Administration',
    },
    {
      group: 'DOMAIN',
      code: 'DO_DAC_BAN_DO',
      order: 72,
      nameVi: 'Đo đạc bản đồ',
      nameEn: 'Survey & Mapping',
    },
    {
      group: 'DOMAIN',
      code: 'TAI_NGUYEN_NUOC',
      order: 73,
      nameVi: 'Tài nguyên nước',
      nameEn: 'Water Resources',
    },
    {
      group: 'DOMAIN',
      code: 'KHOANG_SAN',
      order: 74,
      nameVi: 'Khoáng sản',
      nameEn: 'Minerals',
    },
    {
      group: 'DOMAIN',
      code: 'MOI_TRUONG',
      order: 75,
      nameVi: 'Môi trường',
      nameEn: 'Environment',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_DOI_KHI_HAU',
      order: 76,
      nameVi: 'Biến đổi khí hậu',
      nameEn: 'Climate Change',
    },
    {
      group: 'DOMAIN',
      code: 'KHI_TUONG_THUY_VAN',
      order: 77,
      nameVi: 'Khí tượng thủy văn',
      nameEn: 'Hydrometeorology',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THAM',
      order: 78,
      nameVi: 'Viễn thám',
      nameEn: 'Remote Sensing',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_HAI_DAO',
      order: 79,
      nameVi: 'Biển hải đảo',
      nameEn: 'Sea & Islands',
    },

    {
      group: 'DOMAIN',
      code: 'XAY_DUNG',
      order: 80,
      nameVi: 'Xây dựng',
      nameEn: 'Construction',
    },
    {
      group: 'DOMAIN',
      code: 'QUY_HOACH_XAY_DUNG',
      order: 81,
      nameVi: 'Quy hoạch xây dựng',
      nameEn: 'Construction Planning',
    },
    {
      group: 'DOMAIN',
      code: 'PHAT_TRIEN_DO_THI',
      order: 82,
      nameVi: 'Phát triển đô thị',
      nameEn: 'Urban Development',
    },
    {
      group: 'DOMAIN',
      code: 'HA_TANG_KY_THUAT',
      order: 83,
      nameVi: 'Hạ tầng kỹ thuật',
      nameEn: 'Technical Infrastructure',
    },
    {
      group: 'DOMAIN',
      code: 'NHA_O',
      order: 84,
      nameVi: 'Nhà ở',
      nameEn: 'Housing',
    },
    {
      group: 'DOMAIN',
      code: 'VAT_LIEU_XAY_DUNG',
      order: 85,
      nameVi: 'Vật liệu xây dựng',
      nameEn: 'Construction Materials',
    },
    {
      group: 'DOMAIN',
      code: 'GIAM_DINH_CHAT_LUONG_CONG_TRINH',
      order: 86,
      nameVi: 'Giám định chất lượng công trình',
      nameEn: 'Construction Quality Inspection',
    },
    {
      group: 'DOMAIN',
      code: 'CAP_PHEP_XAY_DUNG',
      order: 87,
      nameVi: 'Cấp phép xây dựng',
      nameEn: 'Construction Licensing',
    },

    {
      group: 'DOMAIN',
      code: 'THONG_TIN_TRUYEN_THONG',
      order: 88,
      nameVi: 'Thông tin & Truyền thông',
      nameEn: 'Information & Communications',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_CHI',
      order: 89,
      nameVi: 'Báo chí',
      nameEn: 'Press',
    },
    {
      group: 'DOMAIN',
      code: 'XUAT_BAN',
      order: 90,
      nameVi: 'Xuất bản',
      nameEn: 'Publishing',
    },
    {
      group: 'DOMAIN',
      code: 'THONG_TIN_DIEN_TU',
      order: 91,
      nameVi: 'Thông tin điện tử',
      nameEn: 'Electronic Information',
    },
    {
      group: 'DOMAIN',
      code: 'BUU_CHINH',
      order: 92,
      nameVi: 'Bưu chính',
      nameEn: 'Postal Services',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THONG',
      order: 93,
      nameVi: 'Viễn thông',
      nameEn: 'Telecommunications',
    },
    {
      group: 'DOMAIN',
      code: 'HA_TANG_SO',
      order: 94,
      nameVi: 'Hạ tầng số',
      nameEn: 'Digital Infrastructure',
    },
    {
      group: 'DOMAIN',
      code: 'TRUYEN_THONG_CO_SO',
      order: 95,
      nameVi: 'Truyền thông cơ sở',
      nameEn: 'Grassroots Communication',
    },
    {
      group: 'DOMAIN',
      code: 'THONG_TIN_DOI_NGOAI',
      order: 96,
      nameVi: 'Thông tin đối ngoại',
      nameEn: 'External Information Service',
    },

    {
      group: 'CONTENT_TYPE',
      code: 'ARTICLE',
      order: 1,
      nameVi: 'Bài viết',
      nameEn: 'Article',
    },
    {
      group: 'CONTENT_TYPE',
      code: 'NOTIF',
      order: 2,
      nameVi: 'Thông báo',
      nameEn: 'Notification',
    },
    {
      group: 'CONTENT_TYPE',
      code: 'POLICY',
      order: 3,
      nameVi: 'Văn bản chỉ đạo',
      nameEn: 'Policy Instruction',
    },

    {
      group: 'DEPARTMENT',
      code: 'VAN_PHONG',
      order: 1,
      nameVi: 'Văn phòng Sở',
      nameEn: 'Department Office',
    },
    {
      group: 'DEPARTMENT',
      code: 'PHONG_KE_HOACH',
      order: 2,
      nameVi: 'Phòng Kế hoạch - Tài chính',
      nameEn: 'Planning & Finance Division',
    },

    // --- WORKFLOW ---
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'MANUAL',
      order: 1,
      nameVi: 'Kích hoạt thủ công',
      nameEn: 'Manual Trigger',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'POST_SUBMIT',
      order: 2,
      nameVi: 'Khi gửi duyệt bài viết',
      nameEn: 'On Article Submitted',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'DOC_RECEIVED',
      order: 3,
      nameVi: 'Khi nhận văn bản mới',
      nameEn: 'On Document Received',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'USER_CREATED',
      order: 4,
      nameVi: 'Khi tạo tài khoản mới',
      nameEn: 'On User Account Created',
    },

    // --- BANNER POSITIONS ---
    {
      group: 'BANNER_POSITION',
      code: 'top',
      order: 1,
      nameVi: 'Đầu trang (Header)',
      nameEn: 'Top (Header)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_1',
      order: 2,
      nameVi: 'Giữa trang - Vị trí 1',
      nameEn: 'Middle - Position 1',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_2',
      order: 3,
      nameVi: 'Giữa trang - Vị trí 2',
      nameEn: 'Middle - Position 2',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_3',
      order: 4,
      nameVi: 'Giữa trang - Vị trí 3',
      nameEn: 'Middle - Position 3',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle',
      order: 5,
      nameVi: 'Thân trang (Sidebar)',
      nameEn: 'Sidebar (Middle)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'bottom',
      order: 6,
      nameVi: 'Cuối trang (Footer)',
      nameEn: 'Bottom (Footer)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'custom',
      order: 7,
      nameVi: 'Khẩu hiệu chính',
      nameEn: 'Custom Slogan',
    },

    // --- PORTAL APPEARANCE CONFIGURATIONS ---
    {
      group: 'font_family',
      code: "'Times New Roman', Times, serif",
      order: 1,
      nameVi: 'Serif Uy Nghiêm (Government)',
      nameEn: 'Government Serif',
    },
    {
      group: 'font_family',
      code: "'Inter', sans-serif",
      order: 2,
      nameVi: 'Sans-Serif Hiện Đại (Inter)',
      nameEn: 'Modern Sans-Serif',
    },
    {
      group: 'font_family',
      code: "'Outfit', 'Inter', sans-serif",
      order: 3,
      nameVi: 'Trẻ Trung (Outfit)',
      nameEn: 'Outfit Sans-Serif',
    },
    {
      group: 'font_family',
      code: "'Roboto Mono', monospace",
      order: 4,
      nameVi: 'Tối Giản Hướng Công Nghệ',
      nameEn: 'Monospace Minimal',
    },

    {
      group: 'border_radius',
      code: '0px',
      order: 1,
      nameVi: 'Không bo góc (0px)',
      nameEn: 'No border radius (0px)',
    },
    {
      group: 'border_radius',
      code: '4px',
      order: 2,
      nameVi: 'Bo góc nhỏ (4px)',
      nameEn: 'Small radius (4px)',
    },
    {
      group: 'border_radius',
      code: '8px',
      order: 3,
      nameVi: 'Bo góc trung bình (8px)',
      nameEn: 'Medium radius (8px)',
    },
    {
      group: 'border_radius',
      code: '12px',
      order: 4,
      nameVi: 'Bo góc tròn (12px)',
      nameEn: 'Round radius (12px)',
    },
    {
      group: 'border_radius',
      code: '16px',
      order: 5,
      nameVi: 'Bo góc lớn (16px)',
      nameEn: 'Large radius (16px)',
    },
    // ==========================================================
    // UNIT_TYPE_CATEGORY - Phan loai to chuc don vi hanh chinh
    // description: JSON { icon, color, description, typeCodes }
    // ==========================================================
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'CHINH_QUYEN',
      order: 1,
      nameVi: 'T\u1ed5 ch\u1ee9c ch\u00ednh quy\u1ec1n',
      nameEn: 'Government Organization',
      description: '{"icon":"Landmark","color":"blue","description":"UBND, H\u0110ND, S\u1edf, UBND huy\u1ec7n/x\u00e3","typeCodes":["TINH_UY","HUYEN_UY","XA_PHUONG","SO_NGANH","PHONG_HUYEN"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'DANG',
      order: 2,
      nameVi: 'T\u1ed5 ch\u1ee9c \u0111\u1ea3ng',
      nameEn: 'Party Organization',
      description: '{"icon":"Flag","color":"red","description":"T\u1ec9nh \u1ee7y, Huy\u1ec7n \u1ee7y, \u0110\u1ea3ng b\u1ed9, Chi b\u1ed9","typeCodes":["TINH_UY_DANG","HUYEN_UY_DANG","DANG_BO_CO_SO","CHI_BO","BAN_DANG_UY"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'THAM_MUU',
      order: 3,
      nameVi: 'Ph\u00f2ng ban tham m\u01b0u',
      nameEn: 'Advisory Department',
      description: '{"icon":"BookOpen","color":"violet","description":"V\u0103n ph\u00f2ng, Thanh tra, Ph\u00f2ng T\u1ed5 ch\u1ee9c c\u00e1n b\u1ed9","typeCodes":["VAN_PHONG","THANH_TRA","PHONG_TO_CHUC","PHONG_KE_HOACH","PHONG_PHAP_CHE","PHONG_THAM_MUU"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'CHUYEN_MON',
      order: 4,
      nameVi: 'Ph\u00f2ng ban chuy\u00ean m\u00f4n',
      nameEn: 'Specialized Department',
      description: '{"icon":"FlaskConical","color":"emerald","description":"Ph\u00f2ng nghi\u1ec7p v\u1ee5, chuy\u00ean ng\u00e0nh thu\u1ed9c S\u1edf","typeCodes":["PHONG_QUAN_LY","PHONG_NGHIEP_VU","CHI_CUC","PHONG_THUOC_CHI_CUC"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'SU_NGHIEP',
      order: 5,
      nameVi: '\u0110\u01a1n v\u1ecb s\u1ef1 nghi\u1ec7p c\u00f4ng l\u1eadp',
      nameEn: 'Public Service Unit',
      description: '{"icon":"GraduationCap","color":"amber","description":"Trung t\u00e2m, Tr\u01b0\u1eddng, B\u1ec7nh vi\u1ec7n, Ban qu\u1ea3n l\u00fd","typeCodes":["TRUNG_TAM","TRUONG_HOC","BENH_VIEN","BAN_QUAN_LY","QUY_NN","DON_VI_SN_KHAC"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'PHONG_THUOC_SN',
      order: 6,
      nameVi: 'Phòng ban thuộc đơn vị sự nghiệp',
      nameEn: 'Department under Public Service Unit',
      description: '{"icon":"Building","color":"slate","description":"Phòng Hành chính, Phòng chuyên môn thuộc Trung tâm","typeCodes":["PHONG_HC_TH","PHONG_CM_SN","PHONG_KT_DVTU","TO_DOI"]}'
    },
    // NEW DOMAINS
    { group: 'DOMAIN', code: 'QUAN_LY_KHOA_HOC', order: 101, nameVi: 'Quản lý Khoa học', nameEn: 'Science Management' },
    { group: 'DOMAIN', code: 'DOI_MOI_SANG_TAO', order: 102, nameVi: 'Đổi mới sáng tạo', nameEn: 'Innovation' },
    { group: 'DOMAIN', code: 'KHOI_NGHIEP_SANG_TAO', order: 103, nameVi: 'Khởi nghiệp sáng tạo', nameEn: 'Startup & Innovation' },
    { group: 'DOMAIN', code: 'TIEM_LUC_KHCN', order: 104, nameVi: 'Tiềm lực Khoa học Công nghệ', nameEn: 'Science & Tech Potential' },
    { group: 'DOMAIN', code: 'SO_HUU_TRI_TUE', order: 105, nameVi: 'Sở hữu trí tuệ', nameEn: 'Intellectual Property' },
    { group: 'DOMAIN', code: 'TIEU_CHUAN_DO_LUONG_CHAT_LUONG', order: 106, nameVi: 'Tiêu chuẩn - Đo lường - Chất lượng', nameEn: 'Standards, Metrology and Quality' },
    { group: 'DOMAIN', code: 'AN_TOAN_BUC_XA_HAT_NHAN', order: 107, nameVi: 'An toàn bức xạ & hạt nhân', nameEn: 'Radiation & Nuclear Safety' },
    { group: 'DOMAIN', code: 'TAN_SO_VO_TUYEN_DIEN', order: 108, nameVi: 'Tần số vô tuyến điện', nameEn: 'Radio Frequency' },
    { group: 'DOMAIN', code: 'CONG_NGHE_THONG_TIN', order: 109, nameVi: 'Công nghệ thông tin', nameEn: 'Information Technology' },

    // --- CATEGORY_GROUPS ---
    { group: 'CATEGORY_GROUPS', code: 'STATUS', order: 1, nameVi: 'Trạng thái hệ thống', nameEn: 'Trạng thái hệ thống' },
    { group: 'CATEGORY_GROUPS', code: 'TASK_ROLE', order: 2, nameVi: 'Vai trò công việc', nameEn: 'Vai trò công việc' },
    { group: 'CATEGORY_GROUPS', code: 'TASK_STATUS', order: 3, nameVi: 'Trạng thái công việc', nameEn: 'Trạng thái công việc' },
    { group: 'CATEGORY_GROUPS', code: 'SYSTEM_ACTION', order: 4, nameVi: 'Hành động hệ thống', nameEn: 'Hành động hệ thống' },
    { group: 'CATEGORY_GROUPS', code: 'MICROSERVICE', order: 5, nameVi: 'Dịch vụ hệ thống', nameEn: 'Dịch vụ hệ thống' },
    { group: 'CATEGORY_GROUPS', code: 'PROVINCE', order: 6, nameVi: 'Danh mục Tỉnh/Thành', nameEn: 'Danh mục Tỉnh/Thành' },
    { group: 'CATEGORY_GROUPS', code: 'DISTRICT', order: 7, nameVi: 'Danh mục Quận/Huyện', nameEn: 'Danh mục Quận/Huyện' },
    { group: 'CATEGORY_GROUPS', code: 'GEO_AREA', order: 8, nameVi: 'Khu vực địa lý', nameEn: 'Khu vực địa lý' },
    { group: 'CATEGORY_GROUPS', code: 'DOCUMENT_TYPE', order: 9, nameVi: 'Loại văn bản', nameEn: 'Loại văn bản' },
    { group: 'CATEGORY_GROUPS', code: 'URGENCY_LEVEL', order: 10, nameVi: 'Độ khẩn', nameEn: 'Độ khẩn' },
    { group: 'CATEGORY_GROUPS', code: 'SECURITY_LEVEL', order: 11, nameVi: 'Độ mật', nameEn: 'Độ mật' },
    { group: 'CATEGORY_GROUPS', code: 'DOCUMENT_DOMAIN', order: 12, nameVi: 'Lĩnh vực văn bản', nameEn: 'Lĩnh vực văn bản' },
    { group: 'CATEGORY_GROUPS', code: 'STORAGE_PERIOD', order: 13, nameVi: 'Thời hạn bảo quản', nameEn: 'Thời hạn bảo quản' },
    { group: 'CATEGORY_GROUPS', code: 'GENDER', order: 14, nameVi: 'Giới tính', nameEn: 'Giới tính' },
    { group: 'CATEGORY_GROUPS', code: 'ETHNICITY', order: 15, nameVi: 'Dân tộc', nameEn: 'Dân tộc' },
    { group: 'CATEGORY_GROUPS', code: 'RELIGION', order: 16, nameVi: 'Tôn giáo', nameEn: 'Tôn giáo' },
    { group: 'CATEGORY_GROUPS', code: 'IDENTITY_TYPE', order: 17, nameVi: 'Giấy tờ định danh', nameEn: 'Giấy tờ định danh' },
    { group: 'CATEGORY_GROUPS', code: 'POSITION', order: 18, nameVi: 'Chức vụ', nameEn: 'Chức vụ' },
    { group: 'CATEGORY_GROUPS', code: 'CIVIL_SERVANT_RANK', order: 19, nameVi: 'Ngạch công chức', nameEn: 'Ngạch công chức' },
    { group: 'CATEGORY_GROUPS', code: 'PUBLIC_EMPLOYEE_RANK', order: 20, nameVi: 'Ngạch viên chức', nameEn: 'Ngạch viên chức' },
    { group: 'CATEGORY_GROUPS', code: 'UNIT', order: 21, nameVi: 'Đơn vị tính', nameEn: 'Đơn vị tính' },
    { group: 'CATEGORY_GROUPS', code: 'ACADEMIC_RANK', order: 22, nameVi: 'Học hàm/Học vị', nameEn: 'Học hàm/Học vị' },
    { group: 'CATEGORY_GROUPS', code: 'POLITICAL_THEORY', order: 23, nameVi: 'Lý luận chính trị', nameEn: 'Lý luận chính trị' },
    { group: 'CATEGORY_GROUPS', code: 'IT_SKILL', order: 24, nameVi: 'Trình độ tin học', nameEn: 'Trình độ tin học' },
    { group: 'CATEGORY_GROUPS', code: 'LANGUAGE_SKILL', order: 25, nameVi: 'Trình độ ngoại ngữ', nameEn: 'Trình độ ngoại ngữ' },
    { group: 'CATEGORY_GROUPS', code: 'LANGUAGE', order: 26, nameVi: 'Ngôn ngữ hệ thống', nameEn: 'Ngôn ngữ hệ thống' },
    { group: 'CATEGORY_GROUPS', code: 'DOMAIN', order: 27, nameVi: 'Lĩnh vực nghiệp vụ', nameEn: 'Lĩnh vực nghiệp vụ' },
    { group: 'CATEGORY_GROUPS', code: 'CONTENT_TYPE', order: 28, nameVi: 'Loại nội dung', nameEn: 'Loại nội dung' },
    { group: 'CATEGORY_GROUPS', code: 'DEPARTMENT', order: 29, nameVi: 'Phòng ban', nameEn: 'Phòng ban' },
    { group: 'CATEGORY_GROUPS', code: 'WORKFLOW_TRIGGER', order: 30, nameVi: 'Kích hoạt quy trình', nameEn: 'Kích hoạt quy trình' },
    { group: 'CATEGORY_GROUPS', code: 'BANNER_POSITION', order: 31, nameVi: 'Vị trí hiển thị Banner', nameEn: 'Vị trí hiển thị Banner' },
    { group: 'CATEGORY_GROUPS', code: 'font_family', order: 32, nameVi: 'Phông chữ giao diện (Portal)', nameEn: 'Phông chữ giao diện (Portal)' },
    { group: 'CATEGORY_GROUPS', code: 'border_radius', order: 33, nameVi: 'Độ bo góc khối (Portal)', nameEn: 'Độ bo góc khối (Portal)' },
    { group: 'CATEGORY_GROUPS', code: 'AI_PROVIDER_TYPE', order: 34, nameVi: 'Nhà cung cấp AI (LLM)', nameEn: 'Nhà cung cấp AI (LLM)' },
    { group: 'CATEGORY_GROUPS', code: 'TRANSLATION_SERVICE_TYPE', order: 35, nameVi: 'Dịch vụ Dịch thuật', nameEn: 'Dịch vụ Dịch thuật' },
    { group: 'CATEGORY_GROUPS', code: 'UNIT_TYPE_CATEGORY', order: 36, nameVi: 'Phân loại tổ chức đơn vị', nameEn: 'Phân loại tổ chức đơn vị' },
    { group: 'CATEGORY_GROUPS', code: 'CATEGORY_GROUPS', order: 37, nameVi: 'Nhóm danh mục dùng chung', nameEn: 'Nhóm danh mục dùng chung' },
  ];


  // ==========================================================
  // 3.2 CATEGORY GROUPS — Phải seed TRƯỚC categories (FK constraint: group_code)
  // ==========================================================
  const groupLabels = [
    { code: 'STATUS', name: 'Trạng thái hệ thống', order: 1 },
    { code: 'TASK_ROLE', name: 'Vai trò công việc', order: 2 },
    { code: 'TASK_STATUS', name: 'Trạng thái công việc', order: 3 },
    { code: 'SYSTEM_ACTION', name: 'Hành động hệ thống', order: 4 },
    { code: 'MICROSERVICE', name: 'Dịch vụ hệ thống', order: 5 },
    { code: 'PROVINCE', name: 'Danh mục Tỉnh/Thành', order: 6 },
    { code: 'DISTRICT', name: 'Danh mục Quận/Huyện', order: 7 },
    { code: 'GEO_AREA', name: 'Khu vực địa lý', order: 8 },
    { code: 'DOCUMENT_TYPE', name: 'Loại văn bản', order: 9 },
    { code: 'URGENCY_LEVEL', name: 'Độ khẩn', order: 10 },
    { code: 'SECURITY_LEVEL', name: 'Độ mật', order: 11 },
    { code: 'DOCUMENT_DOMAIN', name: 'Lĩnh vực văn bản', order: 12 },
    { code: 'STORAGE_PERIOD', name: 'Thời hạn bảo quản', order: 13 },
    { code: 'GENDER', name: 'Giới tính', order: 14 },
    { code: 'ETHNICITY', name: 'Dân tộc', order: 15 },
    { code: 'RELIGION', name: 'Tôn giáo', order: 16 },
    { code: 'IDENTITY_TYPE', name: 'Giấy tờ định danh', order: 17 },
    { code: 'POSITION', name: 'Chức vụ', order: 18 },
    { code: 'CIVIL_SERVANT_RANK', name: 'Ngạch công chức', order: 19 },
    { code: 'PUBLIC_EMPLOYEE_RANK', name: 'Ngạch viên chức', order: 20 },
    { code: 'UNIT', name: 'Đơn vị tính', order: 21 },
    { code: 'ACADEMIC_RANK', name: 'Học hàm/Học vị', order: 22 },
    { code: 'POLITICAL_THEORY', name: 'Lý luận chính trị', order: 23 },
    { code: 'IT_SKILL', name: 'Trình độ tin học', order: 24 },
    { code: 'LANGUAGE_SKILL', name: 'Trình độ ngoại ngữ', order: 25 },
    { code: 'LANGUAGE', name: 'Ngôn ngữ hệ thống', order: 26 },
    { code: 'DOMAIN', name: 'Lĩnh vực nghiệp vụ', order: 27 },
    { code: 'CONTENT_TYPE', name: 'Loại nội dung', order: 28 },
    { code: 'DEPARTMENT', name: 'Phòng ban', order: 29 },
    { code: 'WORKFLOW_TRIGGER', name: 'Kích hoạt quy trình', order: 30 },
    { code: 'BANNER_POSITION', name: 'Vị trí hiển thị Banner', order: 31 },
    { code: 'font_family', name: 'Phông chữ giao diện (Portal)', order: 32 },
    { code: 'border_radius', name: 'Độ bo góc khối (Portal)', order: 33 },
    { code: 'AI_PROVIDER_TYPE', name: 'Nhà cung cấp AI (LLM)', order: 34 },
    { code: 'TRANSLATION_SERVICE_TYPE', name: 'Dịch vụ Dịch thuật', order: 35 },
    { code: 'UNIT_TYPE_CATEGORY', name: 'Phân loại tổ chức đơn vị', order: 36 },
    { code: 'CATEGORY_GROUPS', name: 'Nhóm danh mục dùng chung', order: 37 },
    { code: 'WORKFLOW_STATUS', name: 'Trạng thái quy trình', order: 38 },
  ];

  console.log('📦 Seeding Category Groups FIRST (FK dependency)...');
  for (const g of groupLabels) {
    await prisma.categoryGroup.upsert({
      where: { code: g.code },
      update: { name: g.name, order: g.order },
      create: { code: g.code, name: g.name, order: g.order },
    });
  }
  console.log('✅ Category Groups seeded');

  console.log(
    `📦 Seeding ${categoriesData.length} categories with dual translations...`,
  );
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE sys_categories DROP COLUMN name, DROP COLUMN description;',
    );
    console.log('✅ Dropped unused legacy columns from sys_categories');
  } catch (e) {
    // Ignore if already dropped
  }
  let currentGroup = '';
  for (const cat of categoriesData) {
    if (cat.group) currentGroup = cat.group;
    cat.group = currentGroup;
    const category = await prisma.category.upsert({
      where: { groupCode_code: { groupCode: cat.group, code: cat.code } },
      update: { order: cat.order },
      create: {
        groupCode: cat.group,
        code: cat.code,
        order: cat.order,
      },
    });

    // Seed default Vietnamese translation
    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_langCode: { categoryId: category.id, langCode: 'vi' },
      },
      update: { name: cat.nameVi, description: (cat as any).description },
      create: {
        categoryId: category.id,
        langCode: 'vi',
        name: cat.nameVi,
        description: (cat as any).description
      },
    });

    // Seed English translation
    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_langCode: { categoryId: category.id, langCode: 'en' },
      },
      update: { name: cat.nameEn || cat.nameVi, description: (cat as any).description },
      create: {
        categoryId: category.id,
        langCode: 'en',
        name: cat.nameEn || cat.nameVi,
        description: (cat as any).description
      },
    });
  }
  console.log('✅ Categories and dual Vietnamese/English translations seeded');

  
}
