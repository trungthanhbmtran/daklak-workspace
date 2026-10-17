"use client";

import React, { useState } from "react";
import {
  Keyboard,
  Globe,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Check,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAmaKey } from "./amakey-context";
import { AmaKeyMode } from "./amakey-engine";

const MODE_CONFIGS: Record<
  AmaKeyMode,
  { label: string; short: string; color: string; desc: string }
> = {
  telexEde: {
    label: "Telex Tiếng Êđê",
    short: "ÊĐÊ TELEX",
    color: "bg-amber-500 hover:bg-amber-600 text-white",
    desc: "Gõ bb=ƀ, cc=č, nn=ñ, ex=ĕ, eex=ê̆...",
  },
  vniEde: {
    label: "VNI Tiếng Êđê",
    short: "ÊĐÊ VNI",
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    desc: "Gõ b9=ƀ, c9=č, n9=ñ, e8=ĕ, e68=ê̆...",
  },
  telexVi: {
    label: "Telex Tiếng Việt",
    short: "VIỆT TELEX",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
    desc: "Gõ aa=â, ee=ê, s=sắc, f=huyền...",
  },
  vniVi: {
    label: "VNI Tiếng Việt",
    short: "VIỆT VNI",
    color: "bg-purple-600 hover:bg-purple-700 text-white",
    desc: "Gõ 1=sắc, 2=huyền, 6=â, 7=ơ...",
  },
  off: {
    label: "Tắt Bộ Gõ (Nhập trực tiếp)",
    short: "TẮT",
    color: "bg-slate-400 hover:bg-slate-500 text-white",
    desc: "Không biến đổi phím",
  },
};

export function AmaKeyFloatingBar() {
  const {
    mode,
    setMode,
    isVirtualKeyboardOpen,
    toggleVirtualKeyboard,
    toggleGuide,
  } = useAmaKey();

  const [isMinimized, setIsMinimized] = useState(false);
  const currentConfig = MODE_CONFIGS[mode];

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-lg backdrop-blur-md border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
        title="Mở thanh điều khiển bộ gõ AmaKey (Alt + K)"
      >
        <Keyboard className="h-3.5 w-3.5 text-amber-400" />
        <span>AmaKey</span>
        <span
          className={`h-2 w-2 rounded-full ${
            mode !== "off" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 text-slate-700 transition-all">
      {/* Dropdown chọn kiểu gõ */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className={`h-8 px-2.5 text-[11px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${currentConfig.color}`}
            title="Nhấp để thay đổi kiểu gõ (Phím tắt: Alt + K)"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>{currentConfig.short}</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-xl shadow-xl">
          <DropdownMenuLabel className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-indigo-600" />
              Bộ Gõ AmaKey Đắk Lắk
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              Alt + K
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {(Object.keys(MODE_CONFIGS) as AmaKeyMode[]).map((m) => {
            const conf = MODE_CONFIGS[m];
            const isSelected = mode === m;
            return (
              <DropdownMenuItem
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-start justify-between p-2 rounded-lg cursor-pointer ${
                  isSelected ? "bg-slate-100 font-bold" : ""
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        m === "telexEde"
                          ? "bg-amber-500"
                          : m === "vniEde"
                          ? "bg-emerald-500"
                          : m === "telexVi"
                          ? "bg-blue-500"
                          : m === "vniVi"
                          ? "bg-purple-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {conf.label}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{conf.desc}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nút bật/tắt Bàn phím ảo */}
      <Button
        variant={isVirtualKeyboardOpen ? "default" : "outline"}
        size="sm"
        onClick={toggleVirtualKeyboard}
        className={`h-8 px-2.5 text-[11px] font-semibold rounded-xl flex items-center gap-1 transition-colors ${
          isVirtualKeyboardOpen
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
        }`}
        title="Bật/Tắt bàn phím ảo trực quan trên màn hình (Alt + Shift + K)"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Phím ảo</span>
      </Button>

      {/* Nút mở Bảng tra cứu quy tắc gõ */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleGuide}
        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
        title="Bảng tra cứu quy tắc gõ Telex & VNI Êđê"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Nút thu nhỏ widget */}
      <button
        type="button"
        onClick={() => setIsMinimized(true)}
        className="h-8 w-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs ml-0.5"
        title="Thu nhỏ thanh AmaKey"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
