export const roleKeys = {
    all: ["roles"] as const,
    lists: () => [...roleKeys.all, "list"] as const,
    permissions: () => ["permissions", "list"] as const, // Cache cho danh sách quyền
  };
