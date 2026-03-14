export const menuKeys = {
    all: ["menus"] as const,
    lists: () => [...menuKeys.all, "list"] as const,
    details: () => [...menuKeys.all, "detail"] as const,
    detail: (id: number) => [...menuKeys.details(), id] as const,
  };
