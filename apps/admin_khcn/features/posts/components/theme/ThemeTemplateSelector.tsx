"use client";

import React from "react";
import { useThemeConfig } from "./ThemeProvider";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";


interface ColorOption {
  id: string;
  name: string;
  colorClass: string; // Class để hiển thị hình tròn màu
}

const colorTemplates: ColorOption[] = [
  { id: "blue", name: "Xanh đại dương", colorClass: "bg-primary" },
  { id: "emerald", name: "Xanh ngọc lục bảo", colorClass: "bg-emerald-600" },
  { id: "violet", name: "Tím oải hương", colorClass: "bg-violet-600" },
  { id: "amber", name: "Vàng hổ phách", colorClass: "bg-amber-600" },
];

export function ThemeTemplateSelector() {
  const { template, setTemplate } = useThemeConfig();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">
        Màu sắc chủ đạo (Brand Color)
      </label>
      <div className="grid grid-cols-2 gap-3">
        {colorTemplates.map((item) => {
          const isSelected = template === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              onClick={() => setTemplate(item.id)}
              className={`flex items-center gap-3 p-3 text-sm font-medium border rounded-lg transition-all text-left ${isSelected
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500"
                : "border-border hover:bg-muted/40 text-foreground"
                }`}
            >
              {/* Vòng tròn màu sắc đại diện */}
              <Text as="span" className={`w-4 h-4 rounded-full shrink-0 ${item.colorClass} shadow-sm`} />
              <Text as="span" className="truncate">{item.name}</Text>
            </Button>
          );
        })}
      </div>
    </div>
  );
}