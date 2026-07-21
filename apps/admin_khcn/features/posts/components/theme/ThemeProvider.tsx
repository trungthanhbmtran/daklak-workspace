/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";
import axios from "axios";
import { portalConfigApi } from "@/features/portal-config/api";

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

export interface BrandingSettings {
  logo: string;
  favicon: string;
}

export interface ThemeConfig {
  theme: string;
  template: string;
  stage: string;
  typography: TypographySettings;
  layout: LayoutSettings;
  branding: BrandingSettings;
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
  setBranding: (settings: Partial<BrandingSettings>) => void;
  saveTheme: () => Promise<void>;
  loadSavedTheme: (stage: string) => void;
  isDirty: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const defaultThemeConfig: Omit<ThemeConfig, "stage" | "theme"> = {
  template: "blue",
  typography: { heading: "inter", body: "inter", size: 14 },
  layout: { radius: "Medium", width: "1280", isCompact: false },
  branding: { logo: "", favicon: "" },
  customCss: "/* Thêm CSS tùy biến tại đây */"
};

// ====================================================================
// MAPPING ThemeConfig (admin) ↔ ThemeAppearanceConfig (portal DB)
// ====================================================================

const TEMPLATE_COLORS: Record<string, { primary: string; primaryHover: string; secondary: string; background: string }> = {
  blue: { primary: "#1d4ed8", primaryHover: "#1e40af", secondary: "#eff6ff", background: "#f8fafc" },
  emerald: { primary: "#059669", primaryHover: "#047857", secondary: "#ecfdf5", background: "#f8fafb" },
  violet: { primary: "#7c3aed", primaryHover: "#6d28d9", secondary: "#f5f3ff", background: "#faf9ff" },
  amber: { primary: "#d97706", primaryHover: "#b45309", secondary: "#fffbeb", background: "#fffdf5" },
};

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', 'Segoe UI', sans-serif",
  playfair: "'Playfair Display', 'Georgia', serif",
  merriweather: "'Merriweather', 'Times New Roman', serif",
  Geist: "'Geist Mono', monospace",
};

const RADIUS_MAP: Record<string, string> = {
  Sharp: "0px",
  Subtle: "4px",
  Medium: "8px",
  Full: "24px",
};

/** Admin ThemeConfig → portal ThemeAppearanceConfig (stored as JSON in description field) */
function mapConfigToAppearance(cfg: ThemeConfig) {
  const colors = TEMPLATE_COLORS[cfg.template] || TEMPLATE_COLORS["blue"];
  const fontFamily = FONT_MAP[cfg.typography?.heading] || FONT_MAP[cfg.typography?.body] || "'Inter', sans-serif";
  const borderRadius = RADIUS_MAP[cfg.layout?.radius] || "8px";

  return {
    theme: "government",
    colorMode: cfg.theme || "light",
    template: cfg.template,
    colors,
    typography: { fontFamily, fontSize: cfg.typography?.size || 14 },
    layout: {
      headerStyle: "standard",
      footerStyle: "standard",
      homepageLayout: "grid",
      width: cfg.layout?.width || "1280",
      isCompact: cfg.layout?.isCompact || false,
    },
    branding: { logo: cfg.branding?.logo || "", favicon: cfg.branding?.favicon || "", borderRadius },
    customCss: cfg.customCss || "",
    stage: cfg.stage || "default",
    savedAt: new Date().toISOString(),
  };
}

/** Portal ThemeAppearanceConfig (từ DB description) → Admin ThemeConfig */
function mapAppearanceToConfig(data: any): Partial<ThemeConfig> {
  const result: Partial<ThemeConfig> = {};
  if (data.colorMode) result.theme = data.colorMode;
  if (data.template) result.template = data.template;
  if (data.typography?.fontSize) {
    result.typography = { ...(defaultThemeConfig.typography), size: data.typography.fontSize };
  }
  if (data.layout) {
    result.layout = {
      ...(defaultThemeConfig.layout),
      ...(data.layout.isCompact !== undefined ? { isCompact: data.layout.isCompact } : {}),
      ...(data.layout.width ? { width: data.layout.width } : {}),
    };
  }
  if (data.branding) {
    result.branding = {
      ...(defaultThemeConfig.branding),
      ...(data.branding.logo ? { logo: data.branding.logo } : {}),
      ...(data.branding.favicon ? { favicon: data.branding.favicon } : {}),
    };
  }
  if (data.customCss) result.customCss = data.customCss;
  return result;
}

// ====================================================================

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const [stage, setStage] = useState<string>("default");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const [template, setTemplateState] = useState<string>(defaultThemeConfig.template);
  const [typography, setTypography] = useState<TypographySettings>(defaultThemeConfig.typography);
  const [layout, setLayout] = useState<LayoutSettings>(defaultThemeConfig.layout);
  const [branding, setBranding] = useState<BrandingSettings>(defaultThemeConfig.branding);
  const [customCss, setCustomCss] = useState<string>(defaultThemeConfig.customCss);

  const [isDirty, setIsDirty] = useState<boolean>(false);

  // 2. LOAD CONFIG KHI THAY ĐỔI STAGE
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
        if (cfg.branding) setBranding(cfg.branding);
        if (cfg.customCss) setCustomCss(cfg.customCss);
        setIsDirty(false);
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (_) { }
    } else {
      setTemplateState(defaultThemeConfig.template);
      setTypography(defaultThemeConfig.typography);
      setLayout(defaultThemeConfig.layout);
      setBranding(defaultThemeConfig.branding);
      setCustomCss(defaultThemeConfig.customCss);
      setIsDirty(false);
    }
  }, [stage, setTheme]);

  // 2b. LOAD TỪ DB KHI KHỞI ĐỘNG (nếu chưa có local cache) — qua API gateway
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localKey = `themeConfig:${stage}`;
    if (localStorage.getItem(localKey)) return;

    // Gọi public endpoint qua axios trực tiếp (base path khác với admin apiClient)
    axios
      .get("/api/v1/public/portal-configs", { withCredentials: true })
      .then((res: any) => {
        const body = res.data; // axios response.data
        const configs = Array.isArray(body?.data) ? body.data : [];
        const found = configs.find((c: any) => c.code === "theme_appearance");
        if (!found?.description) return;

        try {
          const parsed = JSON.parse(found.description);
          const mapped = mapAppearanceToConfig(parsed);
          if (mapped.theme) setTheme(mapped.theme);
          if (mapped.template) setTemplateState(mapped.template);
          if (mapped.typography) setTypography(mapped.typography);
          if (mapped.layout) setLayout(mapped.layout);
          if (mapped.branding) setBranding(mapped.branding);
          if (mapped.customCss) setCustomCss(mapped.customCss);
          setIsDirty(false);
        // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (_) { }
      })
      .catch(() => { /* network error, dùng default */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSetBranding = (newSettings: Partial<BrandingSettings>) => {
    setBranding((prev) => {
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

  // 4. LƯU TOÀN BỘ CẤU HÌNH XUỐNG LOCALSTORAGE & API DATABASE (qua apiClient)
  const saveTheme = async () => {
    const cfg: ThemeConfig = {
      theme: theme ?? "system",
      template,
      stage,
      typography,
      layout,
      branding,
      customCss
    };

    // Lưu vào localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`themeConfig:${stage}`, JSON.stringify(cfg));
    }

    // Lưu lên DB qua portalConfigApi → gateway → posts-service
    try {
      const appearanceConfig = mapConfigToAppearance(cfg);
      await portalConfigApi.upsert({
        code: "theme_appearance",
        name: "Cấu hình giao diện Portal",
        description: JSON.stringify(appearanceConfig),
      });
      setIsDirty(false);
    } catch (err) {
      console.error("[ThemeProvider] saveTheme API error:", err);
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
        setBranding(cfg.branding ?? defaultThemeConfig.branding);
        setCustomCss(cfg.customCss ?? defaultThemeConfig.customCss);
        setIsDirty(false);
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (_) { }
    } else {
      // Môi trường mới tinh, nạp cấu hình trắng
      setTemplateState(defaultThemeConfig.template);
      setTypography(defaultThemeConfig.typography);
      setLayout(defaultThemeConfig.layout);
      setBranding(defaultThemeConfig.branding);
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
        branding,
        customCss,
        isDirty,
        previewDevice,
        setThemeMode,
        setPreviewDevice,
        setTemplate,
        setStage,
        setTypography: handleSetTypography,
        setLayout: handleSetLayout,
        setBranding: handleSetBranding,
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