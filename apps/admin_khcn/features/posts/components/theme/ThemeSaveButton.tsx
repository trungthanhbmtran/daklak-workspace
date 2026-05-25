"use client";

import { useThemeConfig } from "./ThemeProvider";
import { Check } from "lucide-react";

export function ThemeSaveButton() {
  const { saveTheme, stage } = useThemeConfig();

  const handleSave = async () => {
    await saveTheme();
    // Simple visual feedback; could use toast library if available
    alert(`Theme for stage "${stage}" saved successfully.`);
  };

  return (
    <button
      onClick={handleSave}
      className="mt-4 flex items-center gap-2 rounded-xl border-2 border-[var(--gov-trust-blue,#2563eb)] bg-blue-50/30 dark:bg-blue-900/20 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-100/40"
    >
      <Check className="w-4 h-4" />
      Lưu cấu hình theme
    </button>
  );
}
