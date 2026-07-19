"use client";

import React from "react";
import { useThemeConfig } from "./ThemeProvider";
import { Text } from "@/components/ui/typography";


interface ColorOption {
  id: string;
  name: string;
  colorClass: string; // Class để hiển thị hình tròn màu
}

const colorTemplates: ColorOption[] = [
  { id: "blue", name: "Xanh đại dương", colorClass: "bg-blue-600" },
  { id: "emerald", name: "Xanh ngọc lục bảo", colorClass: "bg-emerald-600" },
  { id: "violet", name: "Tím oải hương", colorClass: "bg-violet-600" },
  { id: "amber", name: "Vàng hổ phách", colorClass: "bg-amber-600" },
];

export function ThemeTemplateSelector() {
  const { template, setTemplate } = useThemeConfig();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
        Màu sắc chủ đạo (Brand Color)
      </label>
      <div className="grid grid-cols-2 gap-3">
        {colorTemplates.map((item) => {
          const isSelected = template === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTemplate(item.id)}
              className={`flex items-center gap-3 p-3 text-sm font-medium border rounded-lg transition-all text-left ${isSelected
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
            >
              {/* Vòng tròn màu sắc đại diện */}
              <Text as="span" className={`w-4 h-4 rounded-full shrink-0 ${item.colorClass} shadow-sm`} />
              <Text as="span" className="truncate">{item.name}</Text>
            </button>
          );
        })}
      </div>
    </div>
  );
}