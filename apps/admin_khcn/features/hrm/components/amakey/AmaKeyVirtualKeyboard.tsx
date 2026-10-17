"use client";

import React, { useState } from "react";
import {
  Keyboard,
  X,
  Delete,
  Space,
  ArrowUp,
  HelpCircle,
  Move,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAmaKey } from "./amakey-context";
import { EDE_SPECIAL_CHARS, VIETNAMESE_VOWELS } from "./amakey-engine";

export function AmaKeyVirtualKeyboard() {
  const {
    isVirtualKeyboardOpen,
    setIsVirtualKeyboardOpen,
    insertText,
    deleteBackwards,
    mode,
    setMode,
    toggleGuide,
  } = useAmaKey();

  const [isUpper, setIsUpper] = useState(false);
  const [activeTab, setActiveTab] = useState<"ede" | "vowel">("ede");

  if (!isVirtualKeyboardOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
            <Keyboard className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">
                Bàn Phím Ảo AmaKey (Tiếng Êđê & Tiếng Việt)
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                Đắk Lắk HRM
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              Nhấp trực tiếp vào ký tự để chèn vào trường đang nhập liệu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleGuide}
            className="h-7 px-2 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            title="Xem bảng hướng dẫn quy tắc gõ Telex & VNI Êđê"
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Quy tắc gõ</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVirtualKeyboardOpen(false)}
            className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Đóng bàn phím ảo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs chuyển nhóm ký tự */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("ede")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === "ede"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ký tự đặc trưng Ê Đê ({EDE_SPECIAL_CHARS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vowel")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === "vowel"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Nguyên âm có dấu Tiếng Việt
          </button>
        </div>

        {/* Nút Shift / Caps lock */}
        <Button
          type="button"
          variant={isUpper ? "default" : "outline"}
          size="sm"
          onClick={() => setIsUpper(!isUpper)}
          className={`h-7 px-2.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
            isUpper
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="Bật/Tắt chữ hoa (Shift/Caps)"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span>{isUpper ? "IN HOA" : "Chữ thường"}</span>
        </Button>
      </div>

      {/* Lưới các phím ký tự */}
      {activeTab === "ede" ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {EDE_SPECIAL_CHARS.map((char) => {
            const displayChar = isUpper ? char.upper : char.lower;
            return (
              <button
                key={char.lower}
                type="button"
                onClick={() => insertText(displayChar)}
                className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-sm active:scale-95 transition-all text-center min-h-[52px]"
                title={`${char.name} | Telex: ${char.telex} | VNI: ${char.vni}`}
              >
                <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 leading-none">
                  {displayChar}
                </span>
                <span className="text-[9px] text-slate-400 group-hover:text-indigo-500 font-mono mt-1">
                  {char.telex.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {VIETNAMESE_VOWELS.map((char) => {
            const displayChar = isUpper ? char.upper : char.lower;
            return (
              <button
                key={char.lower}
                type="button"
                onClick={() => insertText(displayChar)}
                className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-sm active:scale-95 transition-all text-center min-h-[52px]"
                title={`Telex: ${char.telex} | VNI: ${char.vni}`}
              >
                <span className="text-lg font-bold text-slate-800 group-hover:text-blue-700 leading-none">
                  {displayChar}
                </span>
                <span className="text-[9px] text-slate-400 group-hover:text-blue-500 font-mono mt-1">
                  {char.telex}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Thanh phím chức năng phụ: Space, Backspace, Dấu nối Êđê */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 flex-wrap sm:flex-nowrap">
        {/* Phím dấu nháy đơn tiếng Êđê (rất hay dùng như H'Biê, M'Nông, Čư M'gar) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertText("'")}
          className="h-8 px-3 text-xs font-mono font-bold text-slate-700 bg-amber-50/70 border-amber-200 hover:bg-amber-100 rounded-xl"
          title="Dấu nháy đơn tiếng Êđê (như H'Biê, M'Nông, Čư M'gar)"
        >
          H' (Nháy ')
        </Button>

        {/* Phím Space */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertText(" ")}
          className="flex-1 h-8 text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-1.5"
        >
          <Space className="h-3.5 w-3.5" />
          <span>Dấu cách (Space)</span>
        </Button>

        {/* Phím Backspace */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={deleteBackwards}
          className="h-8 px-3 text-xs font-medium text-red-600 bg-red-50/50 border-red-200 hover:bg-red-100 rounded-xl flex items-center gap-1.5"
          title="Xóa lùi ký tự vừa nhập"
        >
          <Delete className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Xóa lùi</span>
        </Button>
      </div>

      {/* Dải mẹo gõ nhanh Telex Êđê */}
      <div className="mt-2.5 px-2 py-1.5 bg-slate-50 rounded-lg text-[10px] text-slate-500 flex items-center justify-between flex-wrap gap-1">
        <span>
          <strong className="text-slate-700">Mẹo Telex Êđê:</strong> bb=ƀ, cc=č, dd=đ, nn=ñ, ex=ĕ, eex=ê̆, ix=ĭ, ox=ŏ, oox=ô̆, owx=ơ̆, ux=ŭ, uwx=ư̆
        </span>
        <button
          type="button"
          onClick={toggleGuide}
          className="text-indigo-600 hover:underline font-semibold"
        >
          Chi tiết quy tắc →
        </button>
      </div>
    </div>
  );
}
