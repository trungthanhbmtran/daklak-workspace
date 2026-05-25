"use client";

import { useThemeConfig } from "./ThemeProvider";

export function ThemePreview() {
  const { theme } = useThemeConfig();

  const previewStyle = {
    background:
      theme === "dark"
        ? "linear-gradient(135deg, #2d2d2d, #1a1a1a)"
        : theme === "light"
          ? "linear-gradient(135deg, #f0f4ff, #e0e7ff)"
          : "linear-gradient(135deg, #e0f7fa, #b2ebf2)",
    color: theme === "dark" ? "#e0e7ff" : "#1e293b",
  } as React.CSSProperties;

  return (
    <div className="mt-6 rounded-xl border-2 border-[var(--gov-trust-blue,#2563eb)] p-6 shadow-lg" style={previewStyle}>
      <h3 className="mb-2 text-lg font-semibold">Preview Theme: {theme}</h3>
      <p className="text-sm">This area reflects the current theme colors. Adjust the selector above to see changes.</p>
    </div>
  );
}
