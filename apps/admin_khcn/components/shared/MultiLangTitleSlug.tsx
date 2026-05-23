import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import apiClient from "@/lib/axiosInstance";
import { convertToSlug } from "@/lib/slug";

export interface MultiLangValue {
    title: string;
    slug: string;
}

interface LanguageItem {
    id: string;
    code: string;
    name: string;
}

interface MultiLangTitleSlugProps {
    value: Record<string, MultiLangValue>;
    onChange: (value: Record<string, MultiLangValue>) => void;
    disabledSlug?: boolean;
}

const DEFAULT_LANGUAGES: LanguageItem[] = [
    {
        id: "vi",
        code: "vi",
        name: "Tiếng Việt",
    },
];

export function MultiLangTitleSlug({
    value,
    onChange,
    disabledSlug = false,
}: MultiLangTitleSlugProps) {
    const [activeTab, setActiveTab] = useState("vi");

    /**
     * Fetch languages
     */
    const { data: languages = DEFAULT_LANGUAGES } = useQuery({
        queryKey: ["system-languages"],
        staleTime: 1000 * 60 * 5,
        queryFn: async (): Promise<LanguageItem[]> => {
            try {
                const res = await apiClient.get("/categories");

                if (!Array.isArray(res?.data)) {
                    return DEFAULT_LANGUAGES;
                }

                return res.data
                    .filter(
                        (item: any) =>
                            item.group === "LANGUAGE" && item.active === 1
                    )
                    .sort((a: LanguageItem, b: LanguageItem) => {
                        if (a.code === "vi") return -1;
                        if (b.code === "vi") return 1;
                        return 0;
                    });
            } catch {
                return DEFAULT_LANGUAGES;
            }
        },
    });

    /**
     * Generate tab columns
     */
    const tabColumns = useMemo(
        () => ({
            gridTemplateColumns: `repeat(${languages.length}, minmax(0, 1fr))`,
        }),
        [languages.length]
    );

    /**
     * Update field helper
     */
    const updateLanguageValue = useCallback(
        (
            langCode: string,
            field: keyof MultiLangValue,
            fieldValue: string
        ) => {
            const current = value?.[langCode] || {
                title: "",
                slug: "",
            };

            const updated: MultiLangValue = {
                ...current,
                [field]: fieldValue,
            };

            /**
             * Auto slug when title changes
             */
            if (field === "title") {
                updated.slug = convertToSlug(fieldValue);
            }

            /**
             * Normalize slug
             */
            if (field === "slug") {
                updated.slug = convertToSlug(fieldValue);
            }

            onChange({
                ...value,
                [langCode]: updated,
            });
        },
        [onChange, value]
    );

    return (
        <div className="w-full">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                {/* Tabs */}
                <TabsList
                    className="grid w-full mb-6 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 p-1"
                    style={tabColumns}
                >
                    {languages.map((lang) => (
                        <TabsTrigger
                            key={lang.code}
                            value={lang.code}
                            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            <span>{lang.name}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Content */}
                {languages.map((lang) => {
                    const currentValue = value?.[lang.code] || {
                        title: "",
                        slug: "",
                    };

                    return (
                        <TabsContent
                            key={lang.code}
                            value={lang.code}
                            className="mt-0 space-y-5"
                        >
                            {/* TITLE */}
                            <div className="space-y-2">
                                <Label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    Tiêu đề ({lang.name})
                                </Label>

                                <Input
                                    value={currentValue.title}
                                    placeholder={`Nhập tiêu đề ${lang.name}...`}
                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50 text-sm font-semibold transition-all focus:ring-4 focus:ring-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-900/20"
                                    onChange={(e) =>
                                        updateLanguageValue(
                                            lang.code,
                                            "title",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* SLUG */}
                            <div className="space-y-2">
                                <Label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    URL Slug ({lang.code})
                                </Label>

                                <div className="relative">
                                    <Input
                                        disabled={disabledSlug}
                                        value={currentValue.slug}
                                        placeholder="vi-du-duong-dan"
                                        className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-14 text-xs font-black tracking-widest transition-all focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-900/20"
                                        onChange={(e) =>
                                            updateLanguageValue(
                                                lang.code,
                                                "slug",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 select-none text-[10px] font-black text-slate-300 dark:text-slate-600">
                                        URL:
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}