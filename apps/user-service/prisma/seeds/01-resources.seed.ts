import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedResources(prisma: PrismaClient) {
  
  const resourcesData = [
    // System & Admin
    { code: 'SYSTEM', name: 'Hệ thống', serviceCode: 'USER_SERVICE' },
    { code: 'USER', name: 'Quản lý Người dùng', serviceCode: 'USER_SERVICE' },
    { code: 'ROLE', name: 'Quản lý Vai trò', serviceCode: 'USER_SERVICE' },
    { code: 'RESOURCE', name: 'Quản lý Tài nguyên', serviceCode: 'USER_SERVICE' },
    { code: 'MENU', name: 'Quản lý Menu', serviceCode: 'USER_SERVICE' },
    { code: 'ORGANIZATION', name: 'Cây tổ chức', serviceCode: 'USER_SERVICE' },
    { code: 'CATEGORY', name: 'Danh mục hệ thống', serviceCode: 'USER_SERVICE' },
    { code: 'NOTIFICATION', name: 'Thông báo hệ thống', serviceCode: 'NOTIFICATION_SERVICE' },
    { code: 'API_GATEWAY', name: 'Quản lý API Gateway', serviceCode: 'API_GATEWAY' },

    // Document Management
    { code: 'DOCUMENT', name: 'Quản lý Văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_INCOMING', name: 'Văn bản đến', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_OUTGOING', name: 'Văn bản đi', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_INTERNAL', name: 'Văn bản nội bộ', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_DRAFT', name: 'Dự thảo văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_TEMPLATE', name: 'Biểu mẫu văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_PUBLISH', name: 'Phát hành văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_PROCESSING', name: 'Xử lý văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_TRANSPARENCY', name: 'Công khai văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_CONSULTATION', name: 'Lấy ý kiến văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_MINUTES', name: 'Biên bản cuộc họp', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_CATEGORIES', name: 'Danh mục văn bản', serviceCode: 'DOCUMENT_SERVICE' },

    // HRM
    { code: 'HRM_EMPLOYEE', name: 'Quản lý Nhân sự', serviceCode: 'HRM_SERVICE' },

    // CMS
    { code: 'POST', name: 'Quản lý Bài viết', serviceCode: 'CONTENT_SERVICE' },
    { code: 'POST_CATEGORY', name: 'Quản lý Chuyên mục', serviceCode: 'CONTENT_SERVICE' },
    { code: 'BANNER', name: 'Quản lý Banner & Quảng cáo', serviceCode: 'CONTENT_SERVICE' },
    { code: 'PORTAL_MENU', name: 'Quản lý Portal Menu', serviceCode: 'CONTENT_SERVICE' },
    { code: 'CITIZEN_INTERACTION', name: 'Tương tác công dân', serviceCode: 'CONTENT_SERVICE' },

    // Integration & Workflow
    { code: 'INTEGRATION', name: 'Liên thông hệ thống', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'TASK', name: 'Công việc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'PROJECT', name: 'Dự án', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'PLAN', name: 'Kế hoạch công tác', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'WORKFLOW', name: 'Quy trình công việc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'OBJECTIVE', name: 'Mục tiêu', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'KPI', name: 'KPI', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'REPORT', name: 'Báo cáo', serviceCode: 'REPORT_SERVICE' },
  ];

  const resources: Record<string, { id: number; code: string; name: string; serviceCode?: string | null }> = {};
  for (const res of resourcesData) {
    const created = await prisma.resource.upsert({
      where: { code: res.code },
      update: { name: res.name, serviceCode: res.serviceCode },
      create: {
        code: res.code,
        name: res.name,
        serviceCode: res.serviceCode,
      },
    });
    resources[res.code] = created;
  }

  
}
