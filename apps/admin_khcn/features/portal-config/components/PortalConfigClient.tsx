/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-background rounded-xl border border-border shadow-sm">
      <div className="p-6 max-w-7xl mx-auto space-y-8 select-none animate-fade-in">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-md shadow-primary/20">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Cấu hình chung đơn vị & Portal
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Quản lý thông tin nhận diện cơ quan, bản quyền, đường dây nóng, trang giới thiệu, cơ cấu tổ chức và sơ đồ ranh giới rập khuôn đa ngôn ngữ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN: EDITOR FORM */}
          <div className="lg:col-span-2 space-y-6">
            {/* EDITOR VIEW MODE CONTROLLER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 border border-border p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Ngôn ngữ soạn thảo:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-auto">
                  <TabsList className="bg-muted p-0.5 flex gap-0.5 rounded-lg border border-border">
                    {activeLangs.map((lang: any) => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        disabled={isCompareMode}
                        className="px-3 py-1.5 font-extrabold uppercase text-[10px] rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm disabled:opacity-50"
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
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  {isCompareMode ? "Tắt dịch song song" : "Dịch song song (VI / EN)"}
                </Button>
              </div>
            </div>

            {/* CONFIGURATION SECTIONS TABS */}
            <div className="flex border-b border-border gap-1.5 overflow-x-auto pb-px">
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
                      ? "border-primary text-primary font-extrabold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
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
