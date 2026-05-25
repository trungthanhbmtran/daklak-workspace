"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

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
  theme: string;
  template: string;
  stage: string;
  typography: TypographySettings;
  layout: LayoutSettings;
  customCss: string;
}

interface ThemeContextProps extends ThemeConfig {
  setThemeMode: (mode: string) => void;
  setTemplate: (template: string) => void;
  previewDevice: "desktop" | "tablet" | "mobile";
  setPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void;
  setStage: (stage: string) => void;
  // Thay đổi kiểu định nghĩa setter để các page con cập nhật thuộc tính lẻ cực kỳ dễ dàng
  setTypography: (settings: Partial<TypographySettings>) => void;
  setLayout: (settings: Partial<LayoutSettings>) => void;
  setCustomCss: (css: string) => void;
  saveTheme: () => Promise<void>;
  loadSavedTheme: (stage: string) => void;
  isDirty: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

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

  const [template, setTemplateState] = useState<string>(defaultThemeConfig.template);
  const [typography, setTypography] = useState<TypographySettings>(defaultThemeConfig.typography);
  const [layout, setLayout] = useState<LayoutSettings>(defaultThemeConfig.layout);
  const [customCss, setCustomCss] = useState<string>(defaultThemeConfig.customCss);

  const [isDirty, setIsDirty] = useState<boolean>(false);

  // 2. TỰ ĐỘNG LOAD CONFIG KHI THAY ĐỔI STAGE (Bảo vệ lỗi SSR bằng typeof window)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(`themeConfig:${stage}`);
    if (stored) {
      try {
        const cfg: ThemeConfig = JSON.parse(stored);
        if (cfg.theme) setTheme(cfg.theme);
        if (cfg.template) setTemplateState(cfg.template);
        if (cfg.typography) setTypography(cfg.typography);
        if (cfg.layout) setLayout(cfg.layout);
        if (cfg.customCss) setCustomCss(cfg.customCss);
        setIsDirty(false);
      } catch (_) { }
    } else {
      // Nếu stage chưa có config, trả về mặc định
      setTemplateState(defaultThemeConfig.template);
      setTypography(defaultThemeConfig.typography);
      setLayout(defaultThemeConfig.layout);
      setCustomCss(defaultThemeConfig.customCss);
      setIsDirty(false);
    }
  }, [stage, setTheme]);

  // 3. CÁC HÀM SETTER ĐỒNG BỘ TRẠNG THÁI CHƯA LƯU & TỰ ĐỘNG MERGE STATE
  const setThemeMode = (mode: string) => {
    if (theme === mode) return;
    const prev = theme;
    if (prev && typeof window !== "undefined") {
      localStorage.setItem(`previousTheme:${stage}`, prev);
    }
    setTheme(mode);
    setIsDirty(true);
  };

  const setTemplate = (tpl: string) => {
    if (template === tpl) return;
    setTemplateState(tpl);
    setIsDirty(true);
  };

  // Hàm tối ưu: Cho phép cập nhật lẻ tẻ kiểu setTypography({ size: 16 }) mà không làm mất font heading/body
  const handleSetTypography = (newSettings: Partial<TypographySettings>) => {
    setTypography((prev) => {
      const updated = { ...prev, ...newSettings };
      // Kiểm tra xem thực sự có thay đổi so với state cũ hay không mới bật flag dirty
      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        setIsDirty(true);
      }
      return updated;
    });
  };

  // Hàm tối ưu: Cho phép cập nhật lẻ tẻ kiểu setLayout({ isCompact: true }) mà không làm vỡ radius/width
  const handleSetLayout = (newSettings: Partial<LayoutSettings>) => {
    setLayout((prev) => {
      const updated = { ...prev, ...newSettings };
      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        setIsDirty(true);
      }
      return updated;
    });
  };

  const handleSetCustomCss = (css: string) => {
    if (customCss === css) return;
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

    if (typeof window !== "undefined") {
      localStorage.setItem(`themeConfig:${stage}`, JSON.stringify(cfg));
    }

    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setIsDirty(false);
    } catch (_) {
      // Mạng lỗi nhưng local đã lưu thành công thì vẫn cho là an toàn
      setIsDirty(false);
    }
  };

  // 5. LOAD CẤU HÌNH TỪ STAGE KHÁC
  const loadSavedTheme = (targetStage: string) => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(`themeConfig:${targetStage}`);
    setStage(targetStage); // Chuyển môi trường làm việc kể cả khi chưa có dữ liệu cấu hình cũ

    if (stored) {
      try {
        const cfg: ThemeConfig = JSON.parse(stored);
        if (cfg.theme) setTheme(cfg.theme);
        setTemplateState(cfg.template ?? defaultThemeConfig.template);
        setTypography(cfg.typography ?? defaultThemeConfig.typography);
        setLayout(cfg.layout ?? defaultThemeConfig.layout);
        setCustomCss(cfg.customCss ?? defaultThemeConfig.customCss);
        setIsDirty(false);
      } catch (_) { }
    } else {
      // Môi trường mới tinh, nạp cấu hình trắng
      setTemplateState(defaultThemeConfig.template);
      setTypography(defaultThemeConfig.typography);
      setLayout(defaultThemeConfig.layout);
      setCustomCss(defaultThemeConfig.customCss);
      setIsDirty(false);
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