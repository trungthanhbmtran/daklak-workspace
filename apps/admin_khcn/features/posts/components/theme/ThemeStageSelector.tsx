// "use client"

import { useThemeConfig } from "./ThemeProvider";

export function ThemeStageSelector() {
  const { stage, setStage } = useThemeConfig();

  // Example stage list; replace with dynamic source if needed
  const stages = ["default", "stage1", "stage2"];

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Chọn giai đoạn cấu hình
      </label>
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-slate-50 dark:bg-slate-900 p-2 text-sm"
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
