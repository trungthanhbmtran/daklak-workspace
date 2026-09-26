export const policyKeys = {
    all: ["policys"] as const,
    lists: () => [...policyKeys.all, "list"] as const,
    permissions: () => ["permissions", "list"] as const, // Cache cho danh sách quyền
  };
