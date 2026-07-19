"use client";

import React from "react";
import Image from "next/image";
import { usePreviewSimulator } from "../hooks/usePreviewSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Calendar } from "lucide-react";

export const PortalPreviewSimulator = ({ activeLangTab, setActiveLangTab, languages }: any) => {
  const sim = usePreviewSimulator(activeLangTab);

  const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];
  const activeLogo = sim.themeLogo || sim.logoUrl;

  const resolveLogoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/api/v1/admin/media/download/${url}`;
  };

  return (
    <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
            Mô phỏng hiển thị Portal
          </CardTitle>
        </div>
        <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-auto">
          <TabsList className="bg-muted p-0.5 flex gap-0.5 rounded-lg border border-border">
            {activeLangs.map((lang: any) => (
              <TabsTrigger
                key={lang.code}
                value={lang.code}
                className="px-2 py-1 font-extrabold uppercase text-[9px] rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                {lang.code.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-4 space-y-4 text-left">
        {/* Header simulator */}
        <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-3 shadow-inner space-y-2">
          <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest leading-none block border-b pb-1 border-amber-100/50">Mô phỏng Đỉnh Trang (Header)</span>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center p-1 shadow-sm shrink-0 relative overflow-hidden">
              {activeLogo ? (
                <Image src={resolveLogoUrl(activeLogo)} alt="Logo" fill unoptimized className="object-contain p-1" />
              ) : (
                <span className="text-[8px] font-black text-slate-400">LOGO</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-serif font-black tracking-widest text-[#0056b3] uppercase leading-none">
                {sim.simTitle}
              </span>
              <h2 className="text-[11px] font-serif font-black text-[#cc0000] uppercase tracking-wide leading-tight mt-0.5 truncate">
                {sim.simName}
              </h2>
              <span className="text-blue-800 text-[6px] font-serif font-bold tracking-wider leading-none uppercase mt-0.5">
                {sim.simIdentifier}
              </span>
            </div>
          </div>
        </div>

        {/* Reception simulation */}
        <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3 shadow-inner space-y-2">
          <span className="text-[8px] font-black text-indigo-800 uppercase tracking-widest leading-none block border-b pb-1 border-indigo-150">Lịch Tiếp Công Dân (Widget)</span>
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider">LỊCH TIẾP CÔNG DÂN</span>
              <span className="text-[10px] font-semibold text-slate-700 mt-0.5 whitespace-pre-wrap leading-relaxed">
                {sim.simSchedule}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Portal Service Title Simulation */}
        <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 shadow-inner space-y-2">
          <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest leading-none block border-b pb-1 border-emerald-150">Dịch vụ công trực tuyến (Footer Portal Widget)</span>
          <div className="space-y-0.5">
            <h4 className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide leading-tight">
              {sim.simFooterPortalTitle}
            </h4>
            <p className="text-[8px] font-medium text-slate-600 leading-normal">
              {sim.simFooterPortalSubtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Contact Labels Simulation */}
        <div className="bg-sky-50/20 border border-sky-100 rounded-lg p-3 shadow-inner space-y-1.5">
          <span className="text-[8px] font-black text-sky-800 uppercase tracking-widest leading-none block border-b pb-1 border-sky-150">Góp ý & Bản đồ (Contact Page Labels)</span>
          <p className="text-[8px] font-bold text-sky-900 uppercase tracking-wide leading-tight">
            Form: {sim.simContactFormTitle}
          </p>
          <p className="text-[8px] font-medium text-slate-500 leading-tight">
            Map: {sim.simContactMapTitle}
          </p>
          <p className="text-[7.5px] italic text-slate-400 leading-normal border-t pt-1 border-slate-100">
            Thành công: "{sim.simContactFormSuccessDesc}"
          </p>
        </div>

        {/* License/Footer simulator */}
        <div className="bg-slate-900 text-slate-300 rounded-lg p-3 space-y-1.5 text-[8px] shadow-md">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block border-b pb-1 border-slate-800">Mô phỏng Chân Trang (Footer)</span>
          <p className="font-extrabold text-white text-[9px] uppercase">{sim.simName}</p>
          <p className="text-[#fef08a] font-bold text-[8px] uppercase tracking-wide">{sim.simIdentifier}</p>
          <p className="text-slate-400 leading-normal">
            {sim.simLicense}. Chịu trách nhiệm nội dung: {sim.simResponsible}.
          </p>
          <div className="text-slate-400 space-y-0.5 pt-1 border-t border-slate-800 font-medium">
            <p>{sim.simAddress}</p>
            <p>
              <span className="text-amber-300 font-mono font-bold">{sim.simHotline}</span>
              {sim.simFax && ` | `}
              <span className="font-mono">{sim.simFax}</span>
            </p>
            <p className="text-sky-300">{sim.simEmail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
