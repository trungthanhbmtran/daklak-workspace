/**
 * Quản lý cấu hình Gán Báo Cáo vào Dashboard của từng Dịch vụ
 * Hỗ trợ lưu trữ persistent và đồng bộ thời gian thực giữa các phân hệ
 */

export interface DashboardReportAssignment {
  reportIdOrCode: string | number;
  columns?: 1 | 2;
  chartHeight?: number;
  showDetailLink?: boolean;
  allowToggleType?: boolean;
  assignedAt?: string;
}

export interface DashboardTarget {
  key: string;
  name: string;
  description: string;
  href: string;
  defaultReport: string;
}

export const DASHBOARD_TARGETS: DashboardTarget[] = [
  {
    key: "documents",
    name: "Dashboard Quản lý Văn bản",
    description: "Sổ văn bản đến, đi, lưu chuyển và xử lý văn bản hành chính",
    href: "/services/documents",
    defaultReport: "REP_DOC_STATS",
  },
  {
    key: "tasks",
    name: "Dashboard Công việc & Nhiệm vụ / HRM",
    description: "Tiến độ giao việc, đánh giá cán bộ và theo dõi công tác",
    href: "/services/hrm/work-plans/tasks/dashboard",
    defaultReport: "REP_PERSONAL_WORKBENCH",
  },
  {
    key: "posts",
    name: "Dashboard Tin bài & Cổng Thông tin",
    description: "Xuất bản tin tức, bài viết, chuyên mục và tương tác bạn đọc",
    href: "/services/posts",
    defaultReport: "REP_POST_STATS",
  },
  {
    key: "admin",
    name: "Dashboard Quản trị Hệ thống",
    description: "Điều hành cơ cấu tổ chức, định biên VTVL, người dùng và phân quyền PBAC",
    href: "/services/admin",
    defaultReport: "REP_BTCTU_SOP_KPI",
  },
  {
    key: "hub",
    name: "Cổng Ứng dụng Nội bộ (Hub Tổng quan)",
    description: "Bức tranh tổng quan điều hành toàn cơ quan khi đăng nhập",
    href: "/hub",
    defaultReport: "REP_BTCTU_SOP_KPI",
  },
];

const STORAGE_KEY = "daklak_dashboard_report_assignments";

/**
 * Lấy cấu hình mặc định ban đầu
 */
function getDefaultAssignments(): Record<string, DashboardReportAssignment[]> {
  const result: Record<string, DashboardReportAssignment[]> = {};
  for (const target of DASHBOARD_TARGETS) {
    result[target.key] = [
      {
        reportIdOrCode: target.defaultReport,
        columns: 2,
        chartHeight: 240,
        showDetailLink: true,
        allowToggleType: true,
        assignedAt: new Date().toISOString(),
      },
    ];
  }
  return result;
}

/**
 * Lấy toàn bộ danh sách gán của các dashboard
 */
export function getAllDashboardAssignments(): Record<string, DashboardReportAssignment[]> {
  if (typeof window === "undefined") {
    return getDefaultAssignments();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultAssignments();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : getDefaultAssignments();
  } catch {
    return getDefaultAssignments();
  }
}

/**
 * Lấy danh sách các báo cáo được gán cho một dashboard cụ thể
 */
export function getAssignedReportsForDashboard(dashboardKey: string): DashboardReportAssignment[] {
  const all = getAllDashboardAssignments();
  const list = all[dashboardKey];
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  const target = DASHBOARD_TARGETS.find((t) => t.key === dashboardKey);
  if (target) {
    return [
      {
        reportIdOrCode: target.defaultReport,
        columns: 2,
        chartHeight: 240,
        showDetailLink: true,
        allowToggleType: true,
      },
    ];
  }
  return [];
}

/**
 * Kiểm tra xem báo cáo đã được gán vào dashboard này chưa
 */
export function isReportAssignedToDashboard(
  dashboardKey: string,
  reportIdOrCode: string | number
): boolean {
  const reports = getAssignedReportsForDashboard(dashboardKey);
  const targetStr = String(reportIdOrCode).trim();
  return reports.some((r) => String(r.reportIdOrCode).trim() === targetStr);
}

/**
 * Gán hoặc Hủy gán báo cáo cho một dashboard
 */
export function toggleReportAssignment(
  dashboardKey: string,
  reportIdOrCode: string | number,
  options?: Partial<DashboardReportAssignment>
): boolean {
  if (typeof window === "undefined") return false;

  const all = getAllDashboardAssignments();
  const currentList = Array.isArray(all[dashboardKey]) ? [...all[dashboardKey]] : [];
  const targetStr = String(reportIdOrCode).trim();

  const existingIndex = currentList.findIndex(
    (r) => String(r.reportIdOrCode).trim() === targetStr
  );

  let isNowAssigned = false;

  if (existingIndex >= 0) {
    // Đã có -> Hủy gán
    currentList.splice(existingIndex, 1);
    isNowAssigned = false;
  } else {
    // Chưa có -> Thêm gán mới
    currentList.push({
      reportIdOrCode,
      columns: options?.columns || 2,
      chartHeight: options?.chartHeight || 240,
      showDetailLink: options?.showDetailLink ?? true,
      allowToggleType: options?.allowToggleType ?? true,
      assignedAt: new Date().toISOString(),
    });
    isNowAssigned = true;
  }

  all[dashboardKey] = currentList;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(
      new CustomEvent("daklak-dashboard-assignments-updated", {
        detail: { dashboardKey, reportIdOrCode, isNowAssigned },
      })
    );
  } catch {
    // Fallback if quota exceeded
  }

  return isNowAssigned;
}

/**
 * Cập nhật tùy chọn hiển thị cho báo cáo đã gán
 */
export function updateReportAssignmentOptions(
  dashboardKey: string,
  reportIdOrCode: string | number,
  options: Partial<DashboardReportAssignment>
) {
  if (typeof window === "undefined") return;

  const all = getAllDashboardAssignments();
  const currentList = Array.isArray(all[dashboardKey]) ? [...all[dashboardKey]] : [];
  const targetStr = String(reportIdOrCode).trim();

  const item = currentList.find((r) => String(r.reportIdOrCode).trim() === targetStr);
  if (item) {
    Object.assign(item, options);
    all[dashboardKey] = currentList;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(
        new CustomEvent("daklak-dashboard-assignments-updated", {
          detail: { dashboardKey, reportIdOrCode },
        })
      );
    } catch {
      // Fallback
    }
  }
}
