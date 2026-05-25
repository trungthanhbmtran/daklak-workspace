"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

interface ThemeConfig {
  theme: string; // 'light' | 'dark' | 'system'
  stage: string; // custom stage identifier
}

interface ThemeContextProps extends ThemeConfig {
  setThemeMode: (mode: string) => void;
  setStage: (stage: string) => void;
  saveTheme: () => Promise<void>;
  loadSavedTheme: (stage: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const [stage, setStage] = useState<string>("default");

  // Load persisted theme for current stage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`themeConfig:${stage}`);
    if (stored) {
      try {
        const cfg: ThemeConfig = JSON.parse(stored);
        setTheme(cfg.theme);
      } catch (_) {}
    }
  }, [stage, setTheme]);

  const setThemeMode = (mode: string) => {
    // keep previous theme before switching
    const prev = theme;
    if (prev) {
      localStorage.setItem(`previousTheme:${stage}`, prev);
    }
    setTheme(mode);
  };

  const saveTheme = async () => {
    const cfg: ThemeConfig = { theme: theme ?? "system", stage };
    localStorage.setItem(`themeConfig:${stage}`, JSON.stringify(cfg));
    // Optional API persistence – stubbed for now
    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
    } catch (_) {
      // ignore – fallback to localStorage only
    }
  };

  const loadSavedTheme = (targetStage: string) => {
    const stored = localStorage.getItem(`themeConfig:${targetStage}`);
    if (stored) {
      try {
        const cfg: ThemeConfig = JSON.parse(stored);
        setStage(targetStage);
        setTheme(cfg.theme);
      } catch (_) {}
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: theme ?? "system",
        stage,
        setThemeMode,
        setStage,
        saveTheme,
        loadSavedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeConfig = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeConfig must be used within ThemeProvider");
  return ctx;
};
