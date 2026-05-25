"use client";

// Simple ThemeService using localStorage as fallback
export const ThemeService = {
  save: async (stage: string, theme: string) => {
    const key = `themeConfig:${stage}`;
    const data = { theme, stage };
    localStorage.setItem(key, JSON.stringify(data));
    // Placeholder for future API call
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      // ignore errors, localStorage already saved
    }
  },
  load: (stage: string) => {
    const key = `themeConfig:${stage}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  listStages: () => {
    const prefix = 'themeConfig:';
    const stages: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        stages.push(k.slice(prefix.length));
      }
    }
    return stages;
  },
};
