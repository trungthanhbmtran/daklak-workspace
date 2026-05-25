"use client";

import { ThemeProvider } from "./theme/ThemeProvider";
import { ThemeStageSelector } from "./theme/ThemeStageSelector";
import { ThemeTemplateSelector } from "./theme/ThemeTemplateSelector";
import { ThemeSelector } from "./theme/ThemeSelector";
import { ThemePreview } from "./theme/ThemePreview";
import { ThemeSaveButton } from "./theme/ThemeSaveButton";

export function AppearanceClient() {
    return (
        <ThemeProvider>
            <div className="p-6 md:p-8 max-w-4xl space-y-6 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 min-h-full glassmorphism">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Giao diện (Theme)</h2>
                    <p className="text-sm text-slate-500 mt-2 font-light">
                        Chọn mẫu giao diện và cấu hình riêng của bạn. Xem trước mẫu ngay phía dưới.
                    </p>
                </div>
                {/* Template Selector */}
                <ThemeTemplateSelector />
                {/* Stage Selector */}
                <ThemeStageSelector />
                {/* Theme selector (light/dark/system) */}
                <ThemeSelector />
                {/* Preview */}
                <ThemePreview />
                {/* Save */}
                <ThemeSaveButton />
            </div>
        </ThemeProvider>
    );
}
