"use client";

import { usePermissions } from "@/hooks/usePermissions";

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
  canChatTask: (task?: any) => boolean;
  canAssignTask: (task?: any) => boolean;
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
  // Quy tắc: mọi nhánh quyền chỉ dựa trên permission strings từ Backend (permissionsFlatten),
  // KHÔNG string-match tên vai trò, KHÔNG tự tính theo quan hệ supervisor/assigner (ledger #21).
  const { user, isLoading, isAdmin, permissions: perms, roles, hasPermission } = usePermissions();

  const canCreateEmployee = hasPermission("HRM_EMPLOYEE:CREATE") || hasPermission("HRM_EMPLOYEE:MANAGE");
  const canEditEmployee = hasPermission("HRM_EMPLOYEE:UPDATE") || hasPermission("HRM_EMPLOYEE:MANAGE");
  const canDeleteEmployee = hasPermission("HRM_EMPLOYEE:DELETE") || hasPermission("HRM_EMPLOYEE:MANAGE");
  const canViewEmployee = hasPermission("HRM_EMPLOYEE:VIEW") || hasPermission("HRM_EMPLOYEE:READ");

  const canCreateTask = hasPermission("TASK:CREATE") || hasPermission("TASK:ASSIGN") || hasPermission("TASK:MANAGE");
  const canManageTask = hasPermission("TASK:MANAGE") || hasPermission("HRM_TASKS:MANAGE");

  /**
   * Check chat permission on a task following Server-Driven First pattern:
   * 1. Global Admin / Task Manager bypass
   * 2. Server-Driven: check task.allowedActions
   * 3. Contextual Fallback: check participant / assignee / assigner / supervisor
   */
  const canChatTask = (task?: any): boolean => {
    if (!task) return false;
    if (canManageTask) return true;

    // 1. Server-Driven: if backend computed allowedActions, honor it authoritative
    if (Array.isArray(task.allowedActions)) {
      return task.allowedActions.includes("CHAT");
    }

    // 2. Closed task guard
    const isClosed = ["COMPLETED", "DONE", "CANCELLED", "CLOSED"].includes(task.status?.toUpperCase());
    if (isClosed) return false;

    // 3. Fallback based on task relationships
    const myCode = user?.employeeCode;
    if (!myCode) return false;

    const isAssignee = task.assigneeCode === myCode;
    const isAssigner = task.assignerCode === myCode || task.creatorEmployeeCode === myCode;
    const isSupervisor = task.supervisorCode === myCode;
    const isParticipant =
      (Array.isArray(task.participants) && task.participants.some((p: any) => p.employeeCode === myCode)) ||
      (Array.isArray(task.coassigneeCodes) && task.coassigneeCodes.includes(myCode));

    return isAssignee || isAssigner || isSupervisor || isParticipant;
  };

  /**
   * Check assign / reassign permission on a task
   */
  const canAssignTask = (task?: any): boolean => {
    if (canManageTask || hasPermission("TASK:ASSIGN")) return true;
    if (!task) return false;

    if (Array.isArray(task.allowedActions)) {
      return task.allowedActions.includes("ASSIGN") || task.allowedActions.includes("REASSIGN");
    }

    const myCode = user?.employeeCode;
    return Boolean(myCode && (task.creatorEmployeeCode === myCode || task.assignerCode === myCode));
  };

  /**
   * Server-driven (ledger #21): allowedActions do backend tính sẵn trên task DTO.
   * Bằng chứng backend: hrm-service task-shared.service.computeAllowedActions trả actions
   * (workflow engine + native inject) đính vào detail (tasks.service.ts:86) và list (batch :362).
   * Client CHỈ đọc kết quả; khi task thiếu allowedActions → default-deny (false).
   */
  const canEvaluateTask = (task?: any): boolean => {
    if (!task) return false;

    // 1. Server-driven: allowedActions là nguồn Authoritative cho task cụ thể này.
    if (Array.isArray(task.allowedActions)) {
      return (
        task.allowedActions.includes("EVALUATE_APPROVE") ||
        task.allowedActions.includes("APPROVE") ||
        task.allowedActions.includes("EVALUATE")
      );
    }

    // 2. Default-deny: task không mang allowedActions từ backend → không enable UI.
    // TODO(backend-gap): backend cần đảm bảo allowedActions luôn trả trên task detail/list DTO
    // để UI enable nút thẩm định đúng; backend tự enforce quyền khi RPC chạy.
    return false;
  };

  const canEditTask = (task?: any): boolean => {
    if (hasPermission("TASK:UPDATE") || canManageTask) return true;
    if (!task) return false;

    if (Array.isArray(task.allowedActions)) {
      return task.allowedActions.includes("EDIT") || task.allowedActions.includes("UPDATE");
    }

    const myCode = user?.employeeCode;
    return Boolean(myCode && (task.assignerCode === myCode || task.supervisorCode === myCode));
  };

  const canApproveIncidental = (task?: any): boolean => {
    if (hasPermission("TASK:APPROVE") || canManageTask) return true;
    if (!task) return false;

    if (Array.isArray(task.allowedActions)) {
      return task.allowedActions.includes("APPROVE_INCIDENTAL");
    }

    const myCode = user?.employeeCode;
    return Boolean(myCode && task.supervisorCode === myCode);
  };

  const canCreateSubtask = (task?: any): boolean => {
    if (hasPermission("TASK:CREATE") || hasPermission("TASK:ASSIGN") || canManageTask) return true;
    if (!task) return false;

    if (Array.isArray(task.allowedActions)) {
      return task.allowedActions.includes("CREATE_SUBTASK") || task.allowedActions.includes("ADD_SUBTASK");
    }

    const myCode = user?.employeeCode;
    return Boolean(myCode && (task.assigneeCode === myCode || task.assignerCode === myCode));
  };

  const canCreateStep = (task?: any): boolean => {
    if (hasPermission("TASK:CREATE") || hasPermission("TASK:UPDATE") || canManageTask) return true;
    if (!task) return false;

    if (Array.isArray(task.allowedActions)) {
      return task.allowedActions.includes("CREATE_STEP");
    }

    const myCode = user?.employeeCode;
    return Boolean(myCode && (task.assigneeCode === myCode || task.assignerCode === myCode));
  };

  const canManageKpi =
    hasPermission("KPI:UPDATE") ||
    hasPermission("KPI:CREATE") ||
    hasPermission("KPI:MANAGE") ||
    hasPermission("PLAN:MANAGE");

  const canManageEvaluationForms =
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
    canChatTask,
    canAssignTask,
    canEvaluateTask,
    canEditTask,
    canApproveIncidental,
    canCreateSubtask,
    canCreateStep,
    canManageKpi,
    canManageEvaluationForms,
  };
}
