export const CATEGORY_KEYS = {
    all: ['categories'] as const,
    // Nếu sau này bạn gọi API theo từng group thì dùng hàm dưới đây để cache riêng:
    byGroup: (group: string) => [...CATEGORY_KEYS.all, group] as const,
  };
