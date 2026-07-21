"use client";

import React from "react";
import { useThemeConfig } from "./ThemeProvider";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";


export function ThemeSelector() {
  const { theme, setThemeMode } = useThemeConfig();

  const options = [
    {
      id: "light", name: "Chế độ Sáng", icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: "dark", name: "Chế độ Tối", icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    },
    {
      id: "system", name: "Hệ thống", icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const isSelected = theme === opt.id;
        return (
          <Button
            key={opt.id}
            type="button"
            onClick={() => setThemeMode(opt.id)}
            className={`flex flex-col items-center justify-center p-3 text-xs font-medium border rounded-xl gap-2 transition-all ${isSelected
              ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/10 dark:bg-blue-600"
              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
              }`}
          >
            {opt.icon}
            <Text as="span">{opt.name}</Text>
          </Button>
        );
      })}
    </div>
  );
}