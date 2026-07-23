"use client";

import React from "react";
import { useThemeConfig } from "./ThemeProvider";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";


interface StageOption {
  id: string;
  name: string;
  description: string;
  badgeClass: string;
}

const stages: StageOption[] = [
  {
    id: "default",
    name: "Môi trường Nháp (Draft)",
    description: "Lưu tạm cấu hình để thiết kế và thử nghiệm.",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
  },
  {
    id: "production",
    name: "Môi trường Live (Production)",
    description: "Giao diện chính thức áp dụng cho người dùng bên ngoài.",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
  },
];

export function ThemeStageSelector() {
  const { stage, loadSavedTheme } = useThemeConfig();

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <label className="block text-xs font-medium text-muted-foreground">
        Môi trường áp dụng cấu hình (Stage)
      </label>
      <div className="space-y-2">
        {stages.map((item) => {
          const isSelected = stage === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              variant="outline"
              onClick={() => loadSavedTheme(item.id)}
              className={`w-full flex flex-col p-3 text-left border rounded-lg transition-all gap-1 ${isSelected
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500"
                : "border-border hover:bg-muted/40"
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <Text as="span" className="font-semibold text-foreground">
                  {item.name}
                </Text>
                {isSelected && (
                  <Text as="span" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeClass}`}>
                    Đang mở
                  </Text>
                )}
              </div>
              <Text className="text-muted-foreground font-light">
                {item.description}
              </Text>
            </Button>
          );
        })}
      </div>
    </div>
  );
}