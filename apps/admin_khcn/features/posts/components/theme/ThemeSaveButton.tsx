"use client";

import React, { useState } from "react";
import { useThemeConfig } from "./ThemeProvider";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";


export function ThemeSaveButton() {
  const { saveTheme, isDirty } = useThemeConfig();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Giả lập delay mạng một chút để tạo cảm giác uy tín, xử lý dữ liệu lớn của hệ thống CMS
    await new Promise((resolve) => setTimeout(resolve, 600));
    await saveTheme();
    setIsSaving(false);
  };

  return (
    <Button
      type="button"
      onClick={handleSave}
      disabled={isSaving || !isDirty}
      className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 ${isDirty
        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow"
        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
        }`}
    >
      {isSaving ? (
        <>
          {/* SVG Loading icon spinner */}
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <Text as="span">Đang lưu...</Text>
        </>
      ) : (
        <Text as="span">Áp dụng cấu hình</Text>
      )}
    </Button>
  );
}