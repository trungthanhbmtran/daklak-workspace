// "use client";

import { useThemeConfig } from "./ThemeProvider";

export function ThemeTemplateSelector() {
  const { setThemeMode, theme } = useThemeConfig();

  const templates = [
    { value: "light", label: "Sáng (Light)" },
    { value: "dark", label: "Tối (Dark)" },
    { value: "system", label: "Hệ thống (System)" },
  ];

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Chọn mẫu giao diện
      </label>
      <select
        value={theme}
        onChange={(e) => setThemeMode(e.target.value)}
        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-slate-50 dark:bg-slate-900 p-2 text-sm"
      >
        {templates.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
