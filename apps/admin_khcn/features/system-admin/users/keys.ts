export const USER_KEYS = {
  all: ["users"] as const,
  list: () => [...USER_KEYS.all, "list"] as const,
  detail: (id: number) => [...USER_KEYS.all, "detail", id] as const,
};
