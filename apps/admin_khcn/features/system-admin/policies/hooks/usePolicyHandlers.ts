/* eslint-disable @typescript-eslint/no-explicit-any */
import { Policy } from "../types";

/**
 * Hook quản lý các handler thao tác policy cho một resource cụ thể.
 * Tách logic ra khỏi component để dễ test và tái sử dụng.
 */
export function usePolicyHandlers(form: any, resourceCode: string) {
  const handleTogglePolicy = (actionCode: string, checked: boolean, resourceId: number) => {
    const latest = [...(form.getValues("policies") as Policy[])];
    if (checked) {
      const alreadyExists = latest.some(
        (p) => p.resourceCode === resourceCode && p.action === actionCode
      );
      if (!alreadyExists) {
        latest.push({
          resourceId,
          resourceCode,
          action: actionCode,
          effect: "ALLOW",
          conditions: { expression: "" },
        });
      }
    } else {
      const idx = latest.findIndex(
        (p) => p.resourceCode === resourceCode && p.action === actionCode
      );
      if (idx > -1) latest.splice(idx, 1);
    }
    form.setValue("policies", latest, { shouldDirty: true });
  };

  const handleChangeEffect = (actionCode: string, val: string) => {
    const latest = [...(form.getValues("policies") as Policy[])];
    const idx = latest.findIndex(
      (p) => p.resourceCode === resourceCode && p.action === actionCode
    );
    if (idx > -1) {
      latest[idx] = { ...latest[idx], effect: val as "ALLOW" | "DENY" };
      form.setValue("policies", latest, { shouldDirty: true });
    }
  };

  const handleChangeExpression = (actionCode: string, expression: string) => {
    const latest = [...(form.getValues("policies") as Policy[])];
    const idx = latest.findIndex(
      (p) => p.resourceCode === resourceCode && p.action === actionCode
    );
    if (idx > -1) {
      latest[idx] = { ...latest[idx], conditions: { expression } };
      form.setValue("policies", latest, { shouldDirty: true });
    }
  };

  return { handleTogglePolicy, handleChangeEffect, handleChangeExpression };
}
