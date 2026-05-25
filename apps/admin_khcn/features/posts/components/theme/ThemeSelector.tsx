"use client";

import { useThemeConfig } from "./ThemeProvider";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export function ThemeSelector() {
  const { theme, stage, setThemeMode, setStage } = useThemeConfig();

  const stages = ["default", "stage1", "stage2"]; // demo stages; replace with dynamic source if needed

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStage(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Light */}
      <button
        onClick={() => setThemeMode('light')}
        className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
          theme === 'light'
            ? 'border-[var(--gov-trust-blue,#2563eb)] bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        }`}
      >
        {theme === 'light' && (
          <div className="absolute top-3 right-3 text-[var(--gov-trust-blue,#2563eb)]">
            <Check className="w-5 h-5" />
          </div>
        )}
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner mb-4">
          <Sun className="w-8 h-8 text-amber-500" />
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-200">Sáng</span>
      </button>

      {/* Dark */}
      <button
        onClick={() => setThemeMode('dark')}
        className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
          theme === 'dark'
            ? 'border-[var(--gov-trust-blue,#2563eb)] bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        }`}
      >
        {theme === 'dark' && (
          <div className="absolute top-3 right-3 text-[var(--gov-trust-blue,#2563eb)]">
            <Check className="w-5 h-5" />
          </div>
        )}
        <div className="p-4 rounded-full bg-slate-800 shadow-inner mb-4">
          <Moon className="w-8 h-8 text-blue-400" />
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-200">Tối</span>
      </button>

      {/* System */}
      <button
        onClick={() => setThemeMode('system')}
        className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
          theme === 'system'
            ? 'border-[var(--gov-trust-blue,#2563eb)] bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
        }`}
      >
        {theme === 'system' && (
          <div className="absolute top-3 right-3 text-[var(--gov-trust-blue,#2563eb)]">
            <Check className="w-5 h-5" />
          </div>
        )}
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner mb-4">
          <Monitor className="w-8 h-8 text-slate-600 dark:text-slate-300" />
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-200">Hệ thống</span>
      </button>

      {/* Stage selector */}
      <select
        value={stage}
        onChange={handleStageChange}
        className="col-span-3 mt-4 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-slate-50 dark:bg-slate-900 p-2 text-sm"
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
