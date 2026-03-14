import { useCallback } from "react";
import { MenuItem } from "../types";

export function useFormLogic(menus: MenuItem[]) {
  const getParentPathPrefix = useCallback((parentId: number | null | undefined): string => {
    if (!parentId) return "/";
    const parent = menus.find(m => m.id === parentId);
    if (!parent) return "/";
    let p = parent.path || "";
    if (p !== "" && !p.endsWith("/")) p += "/";
    return p === "" ? "/" : p;
  }, [menus]);

  return { getParentPathPrefix };
}
