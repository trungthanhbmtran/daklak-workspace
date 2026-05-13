"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Layout,
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  Eye,
  Info,
  CheckCircle2,
  Settings2
} from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { PageBuilder } from "../portal-config/PageBuilder";

export default function PortalPageBuilderPage() {
  const [useCustomAboutLayout, setUseCustomAboutLayout] = useState(false);
  const [customAboutLayout, setCustomAboutLayout] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [languages, setLanguages] = useState<any[]>([]);

  // 1. Fetch registered active languages from Category module
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res: any = await apiClient.get("/categories");
        const all = Array.isArray(res?.data) ? res.data : [];
        const langs = all.filter((c: any) => c.group === "LANGUAGE" && c.active === 1);
        setLanguages(langs.length > 0 ? langs : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      } catch (error) {
        console.error("Error fetching languages", error);
        setLanguages([{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      }
    };
    fetchLanguages();
  }, []);

  const activeLangs = languages.length > 0 
    ? languages 
    : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  // 2. Fetch existing portal configurations
  const { data: dbCategories, isLoading, refetch } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get("/portal-configs");
        return Array.isArray(res?.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching portal configs", error);
        return [];
      }
    }
  });

  // 3. Load existing layout configurations from DB
  useEffect(() => {
    if (dbCategories && dbCategories.length > 0) {
      const useCustomAboutLayoutCat: any = dbCategories.find((c: any) => c.code === "use_custom_about_layout");
      const customAboutLayoutCat: any = dbCategories.find((c: any) => c.code === "custom_about_layout");

      if (useCustomAboutLayoutCat) {
        setUseCustomAboutLayout(useCustomAboutLayoutCat.name === "true");
      } else {
        setUseCustomAboutLayout(false);
      }

      if (customAboutLayoutCat && customAboutLayoutCat.description) {
        try {
          setCustomAboutLayout(JSON.parse(customAboutLayoutCat.description));
        } catch (e) {
          console.error("Failed to parse custom page layout", e);
          setCustomAboutLayout([]);
        }
      } else {
        setCustomAboutLayout([]);
      }
    }
  }, [dbCategories]);

  // 4. Save Page Builder structure and Active Status
  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const configItems = [
        {
          code: "use_custom_about_layout",
          name: useCustomAboutLayout ? "true" : "false",
          description: "Sử dụng thiết kế trang giới thiệu trực quan"
        },
        {
          code: "custom_about_layout",
          name: "Cấu trúc layout trang giới thiệu thiết kế trực quan",
          description: JSON.stringify(customAboutLayout)
        }
      ];

      for (const item of configItems) {
        const existing = dbCategories?.find((c: any) => c.code === item.code);

        if (existing) {
          await apiClient.put(`/portal-configs/${existing.id}`, {
            code: item.code,
            name: item.name,
            description: item.description,
          });
        } else {
          await apiClient.post("/portal-configs", {
            code: item.code,
            name: item.name,
            description: item.description,
          });
        }
      }

      toast.success("Xuất bản cấu trúc trang thiết kế thành công!");
      refetch();
    } catch (error) {
      console.error("Failed to save custom page layout", error);
      toast.error("Không thể lưu cấu trúc trang. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 select-none">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải cấu trúc trang trực quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in select-none">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-md border-l-4 border-indigo-500 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse shrink-0" />
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide">Trình Thiết Kế Trang Trực Quan</h1>
          </div>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Tự do xây dựng cấu trúc hàng, phân bổ số lượng cột và sắp xếp các thẻ Widget dữ liệu động cho Trang giới thiệu (About Page) của Cổng thông tin Chính phủ.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-700/80 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold gap-1.5 h-10"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            Làm mới
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold tracking-wider px-5 rounded-xl text-xs gap-1.5 shadow-md shadow-indigo-500/20 h-10 uppercase shrink-0"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Save className="w-4 h-4 shrink-0" />
            )}
            Xuất bản trang
          </Button>
        </div>
      </div>

      {/* ACTIVATION TOGGLE CARD */}
      <Card className="border border-slate-150 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/40 border-b py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Trạng thái hoạt động trên Cổng thông tin (Citizen Portal)
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setUseCustomAboutLayout(!useCustomAboutLayout)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  useCustomAboutLayout ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useCustomAboutLayout ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-[10px] font-black uppercase ${useCustomAboutLayout ? "text-emerald-600" : "text-slate-500"}`}>
                {useCustomAboutLayout ? "ĐANG BẬT" : "ĐANG TẮT"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/10 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-2.5">
            <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="font-semibold">
              {useCustomAboutLayout 
                ? "Bố cục thiết kế trực quan đang được KÍCH HOẠT. Trang giới thiệu ngoài Cổng thông tin sẽ hiển thị đúng theo cấu trúc Hàng, Cột và các Widget mà bạn xây dựng bên dưới."
                : "Bố cục thiết kế trực quan đang bị TẮT. Trang giới thiệu ngoài Cổng thông tin sẽ hiển thị theo biểu mẫu chuẩn mặc định ban đầu của hệ thống."
              }
            </p>
          </div>
          {useCustomAboutLayout && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150 px-3 py-1.5 rounded-xl shrink-0 font-extrabold uppercase text-[9px] tracking-wide animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Live on Citizen Portal
            </div>
          )}
        </CardContent>
      </Card>

      {/* THE PAGE BUILDER CANVAS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Settings2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Vùng thiết kế & Cấu hình Widget
          </h2>
        </div>

        <PageBuilder
          layout={customAboutLayout}
          onChange={setCustomAboutLayout}
          languages={activeLangs}
        />
      </div>

    </div>
  );
}
