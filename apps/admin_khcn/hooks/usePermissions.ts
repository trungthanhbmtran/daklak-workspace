/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useUser } from "./useUser";

export interface PermissionsState {
  user: any;
  isLoading: boolean;
  isError: boolean;
  permissions: string[];
  roles: string[];
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  hasPermission: (required: string) => boolean;
  hasAnyPermission: (requiredList: string[]) => boolean;
  hasAllPermissions: (requiredList: string[]) => boolean;
  can: (actionOrPermission: string, resourceOrAction?: string) => boolean;
  hasRole: (role: string) => boolean;
}

/**
 * Global PBAC Permissions Hook for DakLak Workspace Platform.
 * Centralizes permission normalization, wildcard resolution, and role-based checks.
 */
export function usePermissions(): PermissionsState {
  const { user, isLoading, isError } = useUser();

  return useMemo(() => {
    const rawPerms = (user?.permissionsFlatten || []) as string[];
    const permissions = Array.isArray(rawPerms) ? rawPerms : [];

    const rawRoles = (user?.roles || user?.roleNames || []) as any[];
    const roles: string[] = Array.isArray(rawRoles)
      ? rawRoles
          .map((r) => (typeof r === "string" ? r : r?.name || r?.code || ""))
          .filter(Boolean)
      : [];

    const isGlobalAdmin = Boolean(
      user?.isAdmin ||
        user?.username === "admin" ||
        user?.employeeCode === "ADMIN001" ||
        permissions.includes("*") ||
        permissions.includes("*:*") ||
        permissions.includes("SYSTEM:*") ||
        permissions.includes("ADMIN") ||
        roles.some((r) => {
          const lower = r.toLowerCase();
          return (
            lower.includes("quản trị viên hệ thống") ||
            lower.includes("quản trị hệ thống") ||
            lower.includes("super admin") ||
            lower === "admin" ||
            lower === "administrator" ||
            lower.includes("quản trị viên đơn vị")
          );
        })
    );

    const RESOURCE_ALIASES: Record<string, string[]> = {
      TASK: ["HRM_TASKS", "HRM_TASK", "TASKS"],
      HRM_TASKS: ["TASK", "HRM_TASK", "TASKS"],
      HRM_TASK: ["TASK", "HRM_TASKS", "TASKS"],
      HRM_EMPLOYEE: ["EMPLOYEE", "HRM_EMPLOYEES", "EMPLOYEES"],
      EMPLOYEE: ["HRM_EMPLOYEE", "HRM_EMPLOYEES", "EMPLOYEES"],
      KPI: ["HRM_KPI", "KPIS"],
      HRM_KPI: ["KPI", "KPIS"],
      PLAN: ["HRM_PLAN", "WORK_PLAN", "PLANS"],
      HRM_PLAN: ["PLAN", "WORK_PLAN", "PLANS"],
      REPORT: ["HRM_REPORT", "REPORTS"],
      HRM_REPORT: ["REPORT", "REPORTS"],
    };

    const checkSinglePerm = (req: string): boolean => {
      const reqUpper = req.toUpperCase().trim();

      // 1. Exact match
      if (permissions.some((p) => p.toUpperCase() === reqUpper)) return true;

      // 2. Wildcard prefix check with colon (e.g., "TASK:CREATE" -> check "TASK:*" or "TASK.*")
      const colonParts = reqUpper.split(":");
      if (colonParts.length === 2) {
        const [resource] = colonParts;
        if (
          permissions.some((p) => {
            const pu = p.toUpperCase();
            return (
              pu === `${resource}:*` ||
              pu === `${resource}.*` ||
              pu === `${resource}:ALL` ||
              pu === `${resource}.ALL`
            );
          })
        ) {
          return true;
        }
      }

      // 3. Wildcard prefix check with dot (e.g., "TASK.CREATE" -> check "TASK.*" or "TASK:*")
      const dotParts = reqUpper.split(".");
      if (dotParts.length === 2) {
        const [resource] = dotParts;
        if (
          permissions.some((p) => {
            const pu = p.toUpperCase();
            return (
              pu === `${resource}.*` ||
              pu === `${resource}:*` ||
              pu === `${resource}.ALL` ||
              pu === `${resource}:ALL`
            );
          })
        ) {
          return true;
        }
      }

      return false;
    };

    const hasPermission = (required: string): boolean => {
      if (!required) return false;
      if (isGlobalAdmin) return true;
      if (permissions.length === 0) return false;

      if (checkSinglePerm(required)) return true;

      // Check with known resource aliases
      const sep = required.includes(":") ? ":" : required.includes(".") ? "." : null;
      if (sep) {
        const [res, act] = required.split(sep);
        const resUpper = res.toUpperCase().trim();
        const aliases = RESOURCE_ALIASES[resUpper] || [];
        for (const alias of aliases) {
          if (checkSinglePerm(`${alias}${sep}${act}`)) return true;
        }
      }

      return false;
    };

    const hasAnyPermission = (requiredList: string[]): boolean => {
      if (!requiredList || requiredList.length === 0) return true;
      if (isGlobalAdmin) return true;
      return requiredList.some((req) => hasPermission(req));
    };

    const hasAllPermissions = (requiredList: string[]): boolean => {
      if (!requiredList || requiredList.length === 0) return true;
      if (isGlobalAdmin) return true;
      return requiredList.every((req) => hasPermission(req));
    };

    const can = (actionOrPermission: string, resourceOrAction?: string): boolean => {
      if (!actionOrPermission) return false;
      if (resourceOrAction) {
        const knownResources = [
          "TASK",
          "HRM_EMPLOYEE",
          "KPI",
          "PLAN",
          "REPORT",
          "DOC_TEMPLATE",
          "ORGANIZATION",
          "SYSTEM",
        ];
        const firstUpper = actionOrPermission.toUpperCase();
        const secondUpper = resourceOrAction.toUpperCase();
        if (knownResources.includes(firstUpper)) {
          return hasPermission(`${firstUpper}:${secondUpper}`);
        }
        if (knownResources.includes(secondUpper)) {
          return hasPermission(`${secondUpper}:${firstUpper}`);
        }
        return hasPermission(`${firstUpper}:${secondUpper}`);
      }
      return hasPermission(actionOrPermission);
    };

    const hasRole = (roleQuery: string): boolean => {
      if (isGlobalAdmin) return true;
      if (!roleQuery) return false;
      const q = roleQuery.toLowerCase().trim();
      return roles.some((r) => {
        const lower = r.toLowerCase().trim();
        return lower === q || lower.includes(q);
      });
    };

    return {
      user,
      isLoading,
      isError,
      permissions,
      roles,
      isAdmin: isGlobalAdmin,
      isGlobalAdmin,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      can,
      hasRole,
    };
  }, [user, isLoading, isError]);
}
