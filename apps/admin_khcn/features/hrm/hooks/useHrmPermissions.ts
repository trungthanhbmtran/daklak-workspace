"use client";

import { useUser } from "@/hooks/useUser";

export interface HrmUserPermissions {
  user: any;
  isLoading: boolean;
  isAdmin: boolean;
  perms: string[];
  roles: string[];
  hasPermission: (required: string) => boolean;

  // HRM Employee Actions
  canCreateEmployee: boolean;
  canEditEmployee: boolean;
  canDeleteEmployee: boolean;
  canViewEmployee: boolean;

  // Task & Work Plans Actions
  canCreateTask: boolean;
  canManageTask: boolean;
  canEvaluateTask: (task?: any) => boolean;
  canEditTask: (task?: any) => boolean;
  canApproveIncidental: (task?: any) => boolean;
  canCreateSubtask: (task?: any) => boolean;
  canCreateStep: (task?: any) => boolean;

  // KPI & Form Templates Actions
  canManageKpi: boolean;
  canManageEvaluationForms: boolean;
}

export function useHrmPermissions(): HrmUserPermissions {
  const { user, isLoading } = useUser();

  const perms = ((user?.permissionsFlatten || []) as string[]);
  const rawRoles = ((user?.roles || user?.roleNames || []) as any[]);
  const roles = rawRoles.map((r) => (typeof r === "string" ? r : r?.name || "")).filter(Boolean);

  const isAdmin = Boolean(
    user?.isAdmin ||
    perms.includes("*") ||
    perms.includes("*:*") ||
    perms.includes("SYSTEM:*") ||
    perms.includes("HRM_EMPLOYEE:*") ||
    roles.some((r: string) =>
      r.toLowerCase().includes("quản trị viên hệ thống") ||
      r.toLowerCase().includes("quản trị hệ thống") ||
      r.toLowerCase().includes("admin") ||
      r.toLowerCase().includes("quản trị viên đơn vị")
    )
  );

  const hasPermission = (required: string): boolean => {
    if (isAdmin) return true;
    if (perms.includes(required)) return true;
    const [res] = required.split(":");
    if (res && perms.includes(`${res}:*`)) return true;
    return false;
  };

  const isLeader =
    isAdmin ||
    roles.some((r: string) =>
      r.toLowerCase().includes("lãnh đạo") ||
      r.toLowerCase().includes("trưởng phòng") ||
      r.toLowerCase().includes("phó phòng") ||
      r.toLowerCase().includes("giám đốc")
    );

  const canCreateEmployee = isAdmin || hasPermission("HRM_EMPLOYEE:CREATE") || hasPermission("HRM_EMPLOYEE:MANAGE");
  const canEditEmployee = isAdmin || hasPermission("HRM_EMPLOYEE:UPDATE") || hasPermission("HRM_EMPLOYEE:MANAGE");
  const canDeleteEmployee = isAdmin || hasPermission("HRM_EMPLOYEE:DELETE") || hasPermission("HRM_EMPLOYEE:MANAGE");
  const canViewEmployee = isAdmin || hasPermission("HRM_EMPLOYEE:VIEW") || hasPermission("HRM_EMPLOYEE:READ");

  const canCreateTask = isAdmin || isLeader || hasPermission("TASK:CREATE") || hasPermission("TASK:ASSIGN") || hasPermission("TASK:MANAGE");
  const canManageTask = isAdmin || hasPermission("TASK:MANAGE");

  const canEvaluateTask = (task?: any): boolean => {
    if (isAdmin || hasPermission("TASK:EVALUATE") || hasPermission("TASK:MANAGE") || hasPermission("KPI:EVALUATE")) return true;
    if (!task) return false;
    const myCode = user?.employeeCode;
    if (myCode && (task.supervisorCode === myCode || task.assignerCode === myCode)) return true;
    if (task.allowedActions?.includes("EVALUATE_APPROVE") || task.allowedActions?.includes("APPROVE") || task.allowedActions?.includes("EVALUATE")) return true;
    return false;
  };

  const canEditTask = (task?: any): boolean => {
    if (isAdmin || hasPermission("TASK:UPDATE") || hasPermission("TASK:MANAGE")) return true;
    if (!task) return false;
    const myCode = user?.employeeCode;
    if (myCode && (task.assignerCode === myCode || task.supervisorCode === myCode)) return true;
    if (task.allowedActions?.includes("EDIT") || task.allowedActions?.includes("UPDATE")) return true;
    return false;
  };

  const canApproveIncidental = (task?: any): boolean => {
    if (isAdmin || hasPermission("TASK:APPROVE") || hasPermission("TASK:MANAGE")) return true;
    if (!task) return false;
    const myCode = user?.employeeCode;
    if (myCode && task.supervisorCode === myCode) return true;
    if (task.allowedActions?.includes("APPROVE_INCIDENTAL")) return true;
    return false;
  };

  const canCreateSubtask = (task?: any): boolean => {
    if (isAdmin || hasPermission("TASK:CREATE") || hasPermission("TASK:ASSIGN") || hasPermission("TASK:MANAGE")) return true;
    if (!task) return false;
    const myCode = user?.employeeCode;
    if (myCode && (task.assigneeCode === myCode || task.assignerCode === myCode)) return true;
    if (task.allowedActions?.includes("CREATE_SUBTASK")) return true;
    return false;
  };

  const canCreateStep = (task?: any): boolean => {
    if (isAdmin || hasPermission("TASK:CREATE") || hasPermission("TASK:UPDATE") || hasPermission("TASK:MANAGE")) return true;
    if (!task) return false;
    const myCode = user?.employeeCode;
    if (myCode && (task.assigneeCode === myCode || task.assignerCode === myCode)) return true;
    if (task.allowedActions?.includes("CREATE_STEP")) return true;
    return false;
  };

  const canManageKpi =
    isAdmin ||
    isLeader ||
    hasPermission("KPI:UPDATE") ||
    hasPermission("KPI:CREATE") ||
    hasPermission("KPI:MANAGE") ||
    hasPermission("PLAN:MANAGE");

  const canManageEvaluationForms =
    isAdmin ||
    isLeader ||
    hasPermission("KPI:CREATE") ||
    hasPermission("KPI:UPDATE") ||
    hasPermission("PLAN:CREATE") ||
    hasPermission("PLAN:UPDATE") ||
    hasPermission("DOC_TEMPLATE:CREATE") ||
    hasPermission("DOC_TEMPLATE:UPDATE");

  return {
    user,
    isLoading,
    isAdmin,
    perms,
    roles,
    hasPermission,
    canCreateEmployee,
    canEditEmployee,
    canDeleteEmployee,
    canViewEmployee,
    canCreateTask,
    canManageTask,
    canEvaluateTask,
    canEditTask,
    canApproveIncidental,
    canCreateSubtask,
    canCreateStep,
    canManageKpi,
    canManageEvaluationForms,
  };
}
