/* eslint-disable @typescript-eslint/no-explicit-any */
import { Policy } from "../types";

/**
 * Hook quản lý các handler thao tác policy cho một resource cụ thể.
 * Tách logic ra khỏi component để dễ test và tái sử dụng.
 */
export function usePolicyHandlers(form: any, resourceCode: string) {
  const isPolicyMatch = (p: Policy, actionCode: string, resourceId?: number, resCode?: string) => {
    const code = resCode || resourceCode;
    const matchCode = code && p.resourceCode ? p.resourceCode === code : false;
    const matchId = resourceId && p.resourceId ? p.resourceId === resourceId : false;
    return (matchCode || matchId) && p.action === actionCode;
  };

  const handleTogglePolicy = (
    actionCode: string,
    checked: boolean,
    resourceId: number,
    resCode?: string
  ) => {
    const code = resCode || resourceCode;
    const current = form.getValues("policies");
    const latest: Policy[] = Array.isArray(current) ? [...current] : [];

    if (checked) {
      const alreadyExists = latest.some((p) => isPolicyMatch(p, actionCode, resourceId, code));
      if (!alreadyExists) {
        latest.push({
          resourceId,
          resourceCode: code,
          action: actionCode,
          effect: "ALLOW",
          conditions: { expression: "" },
        });
      }
    } else {
      const idx = latest.findIndex((p) => isPolicyMatch(p, actionCode, resourceId, code));
      if (idx > -1) latest.splice(idx, 1);
    }
    form.setValue("policies", latest, { shouldDirty: true, shouldTouch: true });
  };

  const handleChangeEffect = (
    actionCode: string,
    val: string,
    resourceId?: number,
    resCode?: string
  ) => {
    const code = resCode || resourceCode;
    const current = form.getValues("policies");
    const latest: Policy[] = Array.isArray(current) ? [...current] : [];
    const idx = latest.findIndex((p) => isPolicyMatch(p, actionCode, resourceId, code));
    if (idx > -1) {
      latest[idx] = { ...latest[idx], effect: val as "ALLOW" | "DENY" };
      form.setValue("policies", latest, { shouldDirty: true, shouldTouch: true });
    }
  };

  const handleChangeExpression = (
    actionCode: string,
    expression: string,
    resourceId?: number,
    resCode?: string
  ) => {
    const code = resCode || resourceCode;
    const current = form.getValues("policies");
    const latest: Policy[] = Array.isArray(current) ? [...current] : [];
    const idx = latest.findIndex((p) => isPolicyMatch(p, actionCode, resourceId, code));
    if (idx > -1) {
      latest[idx] = { ...latest[idx], conditions: { expression } };
      form.setValue("policies", latest, { shouldDirty: true, shouldTouch: true });
    }
  };

  return { handleTogglePolicy, handleChangeEffect, handleChangeExpression };
}
