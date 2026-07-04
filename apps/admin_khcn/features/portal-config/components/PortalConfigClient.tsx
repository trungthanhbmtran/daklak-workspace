"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Languages, Columns, Building, Phone } from "lucide-react";
import { PortalIdentitySection } from "./sections/PortalIdentitySection";
import { PortalContactSection } from "./sections/PortalContactSection";
import { PortalPreviewSimulator } from "./sections/PortalPreviewSimulator";
import { PortalLayoutShortcuts } from "./sections/PortalLayoutShortcuts";
import { useLanguages } from "./hooks/useLanguages";

export function PortalConfigClient() {
  const [activeConfigTab, setActiveConfigTab] = useState<string>("identity");
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const rawLanguages = useLanguages();

  const activeLangs = rawLanguages.length > 0 ? rawLanguages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-y-auto custom-scrollbar">
      <div className="p-6 max-w-7xl mx-auto space-y-8 select-none animate-fade-in">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/20">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-linear-to-br from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                Cấu hình chung đơn vị & Portal
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Quản lý thông tin nhận diện cơ quan, bản quyền, đường dây nóng, trang giới thiệu, cơ cấu tổ chức và sơ đồ ranh giới rập khuôn đa ngôn ngữ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN: EDITOR FORM */}
          <div className="lg:col-span-2 space-y-6">
            {/* EDITOR VIEW MODE CONTROLLER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Ngôn ngữ soạn thảo:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-auto">
                  <TabsList className="bg-slate-200/60 p-0.5 flex gap-0.5 rounded-lg border border-slate-200/50">
                    {activeLangs.map((lang: any) => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        disabled={isCompareMode}
                        className="px-3 py-1.5 font-extrabold uppercase text-[10px] rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm disabled:opacity-50"
                      >
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <Button
                  type="button"
                  variant={isCompareMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsCompareMode(!isCompareMode)}
                  className={`rounded-lg text-xs font-bold uppercase py-1.5 px-3 flex items-center gap-1.5 transition-all ${isCompareMode
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                    : "border-slate-250 text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  {isCompareMode ? "Tắt dịch song song" : "Dịch song song (VI / EN)"}
                </Button>
              </div>
            </div>

            {/* CONFIGURATION SECTIONS TABS */}
            <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
              {[
                { id: "identity", label: "Cấu hình đơn vị", icon: Building },
                { id: "contact", label: "Thông tin liên hệ", icon: Phone }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeConfigTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveConfigTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 select-none ${isActive
                      ? "border-indigo-600 text-indigo-600 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350"
                      }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            {activeConfigTab === "identity" && (
              <PortalIdentitySection
                activeLangTab={activeLangTab}
                isCompareMode={isCompareMode}
                languages={activeLangs}
              />
            )}
            {activeConfigTab === "contact" && (
              <PortalContactSection
                activeLangTab={activeLangTab}
                isCompareMode={isCompareMode}
                languages={activeLangs}
              />
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <PortalLayoutShortcuts />
            <PortalPreviewSimulator
              activeLangTab={activeLangTab}
              setActiveLangTab={setActiveLangTab}
              languages={activeLangs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
