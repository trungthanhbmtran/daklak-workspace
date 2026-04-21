/**
 * Microservices config - mapping từ gateway_service
 * URL: user_service, project_stc/hrm-service, document_service...
 */
// Dùng 127.0.0.1 thay vì localhost để tránh resolve sang ::1 (IPv6) gây ECONNREFUSED
const getUserUrl = () => process.env.USER_SERVICE_ADDR || process.env.AUTH_SERVICE_URL || 'user-service:50051';
/** project_stc/hrm-service (gRPC, mặc định 127.0.0.1:50052) */
const getHrmUrl = () => process.env.HRM_SERVICE_ADDR || process.env.DEPARTMENT_SERVICE_URL || 'hrm-service:50052';
const getDocumentUrl = () => process.env.DOCUMENT_SERVICE_URL || 'document-service:50056';
const getPostUrl = () => process.env.POST_SERVICE_URL || 'posts-service:50055';
const getMediaUrl = () => process.env.MEDIA_SERVICE_URL || 'media-service:50059';
const getTranslateUrl = () => process.env.TRANSLATE_SERVICE_URL || 'translate-service:50053';
const getWorkflowUrl = () => process.env.WORKFLOW_SERVICE_URL || 'workflow-service:50060';

export const MICROSERVICES = {
  // Workflow (workflow-service)
  WORKFLOW: {
    PACKAGE: 'workflow',
    SYMBOL: 'WORKFLOW_PACKAGE',
    PROTO: 'workflow/workflow.proto',
    URL: getWorkflowUrl(),
    SERVICE: 'WorkflowService',
  },
  // Auth (user_service)
  AUTH: {
    PACKAGE: 'auth',
    SYMBOL: 'AUTH_PACKAGE',
    PROTO: 'users/auth.proto',
    URL: getUserUrl(),
    SERVICE: 'AuthencationService',
  },
  // User (user_service)
  USER: {
    PACKAGE: 'user',
    SYMBOL: 'USER_PACKAGE',
    PROTO: 'users/user.proto',
    URL: getUserUrl(),
    SERVICE: 'UserService',
  },
  PBAC: {
    PACKAGE: 'pbac',
    SYMBOL: 'PBAC_PACKAGE',
    PROTO: 'users/pbac.proto',
    URL: getUserUrl(),
    SERVICE: 'PbacService',
  },
  SYS_CATEGORY: {
    PACKAGE: 'category',
    SYMBOL: 'SYS_CATEGORY_PACKAGE',
    PROTO: 'users/categories.proto',
    URL: getUserUrl(),
    SERVICE: 'CategoryService',
  },
  TRANSLATE: {
    PACKAGE: 'translation',
    SYMBOL: 'TRANSLATE_PACKAGE',
    PROTO: 'translate/translation.proto',
    URL: getTranslateUrl(),
    SERVICE: 'TranslationService',
  },
  MENU: {
    PACKAGE: 'menu',
    SYMBOL: 'MENU_PACKAGE',
    PROTO: 'users/menus.proto',
    URL: getUserUrl(),
    SERVICE: 'MenuService',
  },
  ORGANIZATION: {
    PACKAGE: 'organization',
    SYMBOL: 'ORGANIZATION_PACKAGE',
    PROTO: 'users/organization.proto',
    URL: getUserUrl(),
    SERVICE: 'OrganizationService',
  },
  // HRM: chỉ nhân viên (employee) qua project_stc/hrm-service; đơn vị/chức danh/định biên qua user-service (ORGANIZATION)
  EMPLOYEE: {
    PACKAGE: 'employee',
    SYMBOL: 'EMPLOYEE_PACKAGE',
    PROTO: 'hrm/employee.proto',
    URL: getHrmUrl(),
    SERVICE: 'EmployeeHandlers',
  },
  // Document
  DOCUMENT_CATEGORY: {
    PACKAGE: 'category',
    SYMBOL: 'DOCUMENT_CATEGORY_PACKAGE',
    PROTO: 'document/category.proto',
    URL: getDocumentUrl(),
    SERVICE: 'CategoryService',
  },
  // Posts (posts_service)
  POST: {
    PACKAGE: 'post',
    SYMBOL: 'POST_PACKAGE',
    PROTO: 'posts/post.proto',
    URL: getPostUrl(),
    SERVICE: 'PostService',
  },
  POSTS_CATEGORY: {
    PACKAGE: 'category',
    SYMBOL: 'POSTS_CATEGORY_PACKAGE',
    PROTO: 'posts/category.proto',
    URL: getPostUrl(),
    SERVICE: 'CategoryService',
  },
  POSTS_TAG: {
    PACKAGE: 'tag',
    SYMBOL: 'POSTS_TAG_PACKAGE',
    PROTO: 'posts/tag.proto',
    URL: getPostUrl(),
    SERVICE: 'TagService',
  },
  BANNER: {
    PACKAGE: 'banner',
    SYMBOL: 'BANNER_PACKAGE',
    PROTO: 'posts/banner.proto',
    URL: getPostUrl(),
    SERVICE: 'BannerService',
  },
  MEDIA: {
    PACKAGE: 'media',
    SYMBOL: 'MEDIA_PACKAGE',
    PROTO: 'media/media.proto', // Corrected path in shared/protos
    URL: getMediaUrl(),
    SERVICE: 'MediaService',
  },
};
