"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
}

export interface ThemeTypography {
  fontFamily: string;
}

export interface ThemeLayout {
  headerStyle: "standard" | "centered" | "minimal";
  footerStyle: "standard" | "simple" | "corporate";
  homepageLayout: "grid" | "classic" | "magazine";
}

export interface ThemeBranding {
  logo: string;
  favicon: string;
  borderRadius: string;
}

export interface ThemeAppearanceConfig {
  theme: "government" | "news" | "education" | "minimal";
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  branding: ThemeBranding;
}

const DEFAULT_THEME_CONFIG: ThemeAppearanceConfig = {
  theme: "government",
  colors: {
    primary: "#cc0000",
    primaryHover: "#a80000",
    secondary: "#fdfbf7",
    background: "#faf9f6"
  },
  typography: {
    fontFamily: "'Times New Roman', Times, serif"
  },
  layout: {
    headerStyle: "standard",
    footerStyle: "standard",
    homepageLayout: "grid"
  },
  branding: {
    logo: "",
    favicon: "",
    borderRadius: "6px"
  }
};

interface AppearanceContextType {
  config: ThemeAppearanceConfig;
  isLoading: boolean;
}

const AppearanceContext = React.createContext<AppearanceContextType>({
  config: DEFAULT_THEME_CONFIG,
  isLoading: true
});

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { data: portalConfigs, isLoading } = useQuery({
    queryKey: ["public-portal-configs"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/portal-configs");
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      } catch (e) {
        console.error("Failed to fetch public portal configs", e);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000
  });

  const config = React.useMemo<ThemeAppearanceConfig>(() => {
    if (portalConfigs && portalConfigs.length > 0) {
      const found = portalConfigs.find((c: any) => c.code === "theme_appearance");
      if (found && found.description) {
        try {
          const parsed = JSON.parse(found.description);
          if (parsed && typeof parsed === "object") {
            return {
              ...DEFAULT_THEME_CONFIG,
              ...parsed,
              colors: { ...DEFAULT_THEME_CONFIG.colors, ...parsed.colors },
              typography: { ...DEFAULT_THEME_CONFIG.typography, ...parsed.typography },
              layout: { ...DEFAULT_THEME_CONFIG.layout, ...parsed.layout },
              branding: { ...DEFAULT_THEME_CONFIG.branding, ...parsed.branding }
            };
          }
        } catch (e) {
          console.error("Failed to parse appearance config", e);
        }
      }
    }
    return DEFAULT_THEME_CONFIG;
  }, [portalConfigs]);

  // Inject styles to :root on change
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const styleId = "dynamic-portal-theme-style";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const cssContent = `
      :root {
        --primary-color: ${config.colors.primary};
        --primary-hover-color: ${config.colors.primaryHover};
        --secondary-color: ${config.colors.secondary};
        --background-color: ${config.colors.background};
        --font-family: ${config.typography.fontFamily};
        --border-radius: ${config.branding.borderRadius};
      }
    `;
    styleElement.innerHTML = cssContent;

    // Apply font-family and background globally
    document.documentElement.style.fontFamily = config.typography.fontFamily;
    
    // Inject favicon dynamically if specified
    if (config.branding.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "shortcut icon";
        document.head.appendChild(link);
      }
      link.href = config.branding.favicon;
    }
  }, [config]);

  return (
    <AppearanceContext.Provider value={{ config, isLoading }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return React.useContext(AppearanceContext);
}
