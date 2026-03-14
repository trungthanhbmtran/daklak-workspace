export const resourceKeys = {
  all: ["resources"] as const,
  matrix: () => [...resourceKeys.all, "matrix"] as const,
};
