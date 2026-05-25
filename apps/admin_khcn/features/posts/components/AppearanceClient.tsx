"use client";

import { ThemeProvider } from "./theme/ThemeProvider";
import { ThemeSelector } from "./theme/ThemeSelector";
import { ThemePreview } from "./theme/ThemePreview";
import { ThemeSaveButton } from "./theme/ThemeSaveButton";

export function AppearanceClient() {
    return (
        <ThemeProvider>
            <div className="p-6 md:p-8 max-w-4xl space-y-6 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 min-h-full">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Giao diện (Theme)</h2>
                    <p className="text-sm text-slate-500 mt-2 font-light">
                        Tùy chỉnh chế độ hiển thị màu sắc theo sở thích hoặc theo hệ thống của bạn.
                    </p>
                </div>
                <ThemePreview />
                <ThemeSaveButton />
            </div>
        </ThemeProvider>
    );
}
