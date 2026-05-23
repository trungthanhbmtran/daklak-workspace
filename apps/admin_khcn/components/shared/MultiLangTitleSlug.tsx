import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { convertToSlug } from "@/lib/slug";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";

export interface MultiLangValue {
  title: string;
  slug: string;
}

interface MultiLangTitleSlugProps {
  value: Record<string, MultiLangValue>;
  onChange: (value: Record<string, MultiLangValue>) => void;
  // Chế độ 1 Slug dùng chung (như PortalPageBuilder), thay vì mỗi ngôn ngữ 1 slug
  singleSlugMode?: boolean;
  onSingleSlugChange?: (slug: string) => void;
  singleSlugValue?: string;
  // Disable slug field (e.g. for Edit mode)
  disabledSlug?: boolean;
}

export function MultiLangTitleSlug({
  value = {},
  onChange,
  singleSlugMode = false,
  onSingleSlugChange,
  singleSlugValue = "",
  disabledSlug = false,
}: MultiLangTitleSlugProps) {
  const { data: languages = [] } = useQuery({
    queryKey: ["system-languages-for-slug"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/categories");
        if (res?.data && Array.isArray(res.data)) {
          const langs = res.data.filter((c: any) => c.group === "LANGUAGE" && c.active === 1);
          if (langs.length > 0) {
            return langs.sort((a: any, b: any) => {
              if (a.code === 'vi') return -1;
              if (b.code === 'vi') return 1;
              return 0;
            });
          }
        }
        return [{ id: 'vi', code: 'vi', name: 'Tiếng Việt' }];
      } catch (e) {
        return [{ id: 'vi', code: 'vi', name: 'Tiếng Việt' }];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const [activeTab, setActiveTab] = useState<string>("vi");

  useEffect(() => {
    if (languages.length > 0 && !languages.find((l: any) => l.code === activeTab)) {
      setActiveTab(languages[0].code);
    }
  }, [languages, activeTab]);

  const handleTitleChange = (langCode: string, newTitle: string) => {
    const prevLangValue = value[langCode] || { title: "", slug: "" };
    
    let newSlug = prevLangValue.slug;
    
    // Tự động sinh slug nếu rỗng
    if (!prevLangValue.slug) {
      newSlug = convertToSlug(newTitle);
    }
    
    if (singleSlugMode && langCode === "vi" && !singleSlugValue && onSingleSlugChange) {
      onSingleSlugChange(convertToSlug(newTitle));
    }

    const newValue = {
      ...value,
      [langCode]: { ...prevLangValue, title: newTitle, slug: newSlug }
    };
    onChange(newValue);
  };

  const handleSlugChange = (langCode: string, newSlug: string) => {
    const prevLangValue = value[langCode] || { title: "", slug: "" };
    const newValue = {
      ...value,
      [langCode]: { ...prevLangValue, slug: convertToSlug(newSlug) }
    };
    onChange(newValue);
  };

  if (languages.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full mb-6 bg-slate-100/50 dark:bg-slate-800/50 p-1" style={{ gridTemplateColumns: `repeat(${languages.length}, minmax(0, 1fr))` }}>
          {languages.map((lang: any) => (
            <TabsTrigger 
              key={lang.code} 
              value={lang.code} 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
            >
              <Globe className="h-3.5 w-3.5" /> {lang.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((lang: any) => (
          <TabsContent key={lang.code} value={lang.code} className="space-y-6 mt-0">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                Tiêu đề ({lang.name}) <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder={`Nhập tiêu đề bằng ${lang.name}...`}
                className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all"
                value={value[lang.code]?.title || ""}
                onChange={(e) => handleTitleChange(lang.code, e.target.value)}
              />
            </div>

            {(!singleSlugMode || lang.code === "vi") && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                  Mã định danh (URL SLUG) {singleSlugMode ? "" : `(${lang.name})`}
                </Label>
                <div className="relative">
                  <Input
                    disabled={disabledSlug}
                    placeholder="vi-du-duong-dan-tinh"
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest pl-12 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    value={singleSlugMode ? singleSlugValue : (value[lang.code]?.slug || "")}
                    onChange={(e) => {
                      if (singleSlugMode && onSingleSlugChange) {
                        onSingleSlugChange(convertToSlug(e.target.value));
                      } else {
                        handleSlugChange(lang.code, e.target.value);
                      }
                    }}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 font-black text-[10px] select-none">
                    URL:
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
