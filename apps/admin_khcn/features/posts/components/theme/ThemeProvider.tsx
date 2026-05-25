"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

// 1. ĐỊNH NGHĨA STRUCT DATA ĐẦY ĐỦ CHO THEME SYSTEM
export interface TypographySettings {
  heading: string;
  body: string;
  size: number;
}

export interface LayoutSettings {
  radius: "Sharp" | "Subtle" | "Medium" | "Full";
  width: "1024" | "1280" | "1536" | "full";
  isCompact: boolean;
}

export interface ThemeConfig {
  theme: string;           // 'light' | 'dark' | 'system'
  template: string;        // 'blue' | 'emerald' | 'violet' | 'amber' v.v.
  stage: string;           // custom stage identifier (ví dụ: 'production', 'draft')
  typography: TypographySettings;
  layout: LayoutSettings;
  customCss: string;       // Mã CSS nâng cao do admin viết
}


interface ThemeContextProps extends ThemeConfig {
  setThemeMode: (mode: string) => void;
  setTemplate: (template: string) => void;
  previewDevice: "desktop" | "tablet" | "mobile";
  setPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void;
  setStage: (stage: string) => void;
  setTypography: React.Dispatch<React.SetStateAction<TypographySettings>>;
  setLayout: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  setCustomCss: (css: string) => void;
  saveTheme: () => Promise<void>;
  loadSavedTheme: (stage: string) => void;
  isDirty: boolean;        // Trạng thái kiểm tra xem người dùng có thay đổi gì mà chưa lưu không
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// GIÁ TRỊ KHỞI TẠO MẶC ĐỊNH (DEFAULT SETTINGS)
const defaultThemeConfig: Omit<ThemeConfig, "stage" | "theme"> = {
  template: "blue",
  typography: { heading: "inter", body: "inter", size: 14 },
  layout: { radius: "Medium", width: "1280", isCompact: false },
  customCss: "/* Thêm CSS tùy biến tại đây */"
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const [stage, setStage] = useState<string>("default");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // State quản lý các cấu hình mở rộng
  const [template, setTemplateState] = useState<string>(defaultThemeConfig.template);
  const [typography, setTypography] = useState<TypographySettings>(defaultThemeConfig.typography);
  const [layout, setLayout] = useState<LayoutSettings>(defaultThemeConfig.layout);
  const [customCss, setCustomCss] = useState<string>(defaultThemeConfig.customCss);

  // Quản lý trạng thái "Chưa lưu dữ liệu" (Dirty State)
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // 2. TỰ ĐỘNG LOAD CONFIG KHI THAY ĐỔI STAGE
  useEffect(() => {
    const stored = localStorage.getItem(`themeConfig:${stage}`);
    if (stored) {
      try {
        const cfg: ThemeConfig = JSON.parse(stored);
        setTheme(cfg.theme);
        setTemplateState(cfg.template ?? defaultThemeConfig.template);
        setTypography(cfg.typography ?? defaultThemeConfig.typography);
        setLayout(cfg.layout ?? defaultThemeConfig.layout);
        setCustomCss(cfg.customCss ?? defaultThemeConfig.customCss);
        setIsDirty(false); // Reset trạng thái dirty sau khi load từ gốc thành công
      } catch (_) { }
    }
  }, [stage, setTheme]);

  // 3. CÁC HÀM SETTER ĐỒNG BỘ TRẠNG THÁI CHƯA LƯU (DIRTY CONTROL)
  const setThemeMode = (mode: string) => {
    const prev = theme;
    if (prev) localStorage.setItem(`previousTheme:${stage}`, prev);
    setTheme(mode);
    setIsDirty(true);
  };

  const setTemplate = (tpl: string) => {
    setTemplateState(tpl);
    setIsDirty(true);
  };

  const handleSetTypography: React.Dispatch<React.SetStateAction<TypographySettings>> = (value) => {
    setTypography(value);
    setIsDirty(true);
  };

  const handleSetLayout: React.Dispatch<React.SetStateAction<LayoutSettings>> = (value) => {
    setLayout(value);
    setIsDirty(true);
  };

  const handleSetCustomCss = (css: string) => {
    setCustomCss(css);
    setIsDirty(true);
  };

  // 4. LƯU TOÀN BỘ CẤU HÌNH XUỐNG LOCALSTORAGE & API DATABASE
  const saveTheme = async () => {
    const cfg: ThemeConfig = {
      theme: theme ?? "system",
      template,
      stage,
      typography,
      layout,
      customCss
    };

    localStorage.setItem(`themeConfig:${stage}`, JSON.stringify(cfg));

    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setIsDirty(false); // Lưu thành công, tắt cảnh báo chưa lưu
    } catch (_) {
      // Fallback thành công trên LocalStorage vẫn giữ flag hoặc thông báo tùy ý
      setIsDirty(false);
    }
  };

  // 5. LOAD CẤU HÌNH TỪ STAGE KHÁC (VD: Sao chép từ Live sang Draft)
  const loadSavedTheme = (targetStage: string) => {
    const stored = localStorage.getItem(`themeConfig:${targetStage}`);
    if (stored) {
      try {
        const cfg: ThemeConfig = JSON.parse(stored);
        setStage(targetStage);
        setTheme(cfg.theme);
        setTemplateState(cfg.template);
        setTypography(cfg.typography);
        setLayout(cfg.layout);
        setCustomCss(cfg.customCss);
        setIsDirty(false);
      } catch (_) { }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: theme ?? "system",
        template,
        stage,
        typography,
        layout,
        customCss,
        isDirty,
        previewDevice,
        setThemeMode,
        setPreviewDevice,
        setTemplate,
        setStage,
        setTypography: handleSetTypography,
        setLayout: handleSetLayout,
        setCustomCss: handleSetCustomCss,
        saveTheme,
        loadSavedTheme,
      }}
    >
      {/* Inject Custom CSS trực tiếp vào DOM để Preview áp dụng được ngay lập tức */}
      <style id="cms-custom-theme-styles">{customCss}</style>

      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeConfig = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeConfig must be used within ThemeProvider");
  return ctx;
};