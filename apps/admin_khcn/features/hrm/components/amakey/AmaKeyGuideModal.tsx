"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Keyboard,
  Globe,
  BookOpen,
  Sparkles,
  Command,
  CheckCircle2,
} from "lucide-react";
import { useAmaKey } from "./amakey-context";
import { EDE_SPECIAL_CHARS } from "./amakey-engine";

export function AmaKeyGuideModal() {
  const { isGuideOpen, setIsGuideOpen, setMode } = useAmaKey();

  return (
    <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold shrink-0">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                Hướng Dẫn Bộ Gõ AmaKey — Tiếng Êđê & Tiếng Việt
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Quy tắc gõ ký tự đặc trưng dân tộc thiểu số và văn bản hành chính tỉnh Đắk Lắk
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3 text-xs text-slate-700">
          {/* Giới thiệu */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Dành riêng cho công tác cán bộ & nhân sự tỉnh Đắk Lắk</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              AmaKey tích hợp trực tiếp trong hệ thống HRM, hỗ trợ chuyên viên và lãnh đạo nhập liệu chính xác họ tên, buôn làng, địa danh của đồng bào các dân tộc thiểu số Ê Đê, M&apos;Nông, Gia Rai mà không cần cài thêm phần mềm ngoài máy tính.
            </p>
          </div>

          {/* Phím tắt thao tác nhanh */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Command className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-slate-800">Phím tắt nhanh:</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap font-mono text-[11px]">
              <span className="bg-white px-2 py-0.5 border rounded shadow-2xs">
                <strong className="text-indigo-600">Alt + K</strong>: Chuyển đổi kiểu gõ
              </span>
              <span className="bg-white px-2 py-0.5 border rounded shadow-2xs">
                <strong className="text-indigo-600">Alt + Shift + K</strong>: Bật/Tắt phím ảo
              </span>
            </div>
          </div>

          {/* Bảng quy tắc gõ ký tự Ê Đê */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              Bảng quy tắc gõ các ký tự đặc trưng Tiếng Êđê (Rhade)
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5">Ký tự</th>
                    <th className="p-2.5">Tên gọi / Ý nghĩa</th>
                    <th className="p-2.5 font-mono">Cách gõ Telex</th>
                    <th className="p-2.5 font-mono">Cách gõ VNI</th>
                    <th className="p-2.5">Ví dụ từ thực tế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {EDE_SPECIAL_CHARS.map((char) => {
                    let example = "";
                    if (char.upper === "Ƀ") example = "Ƀuôn Ma Thuột, ƀrư̆";
                    else if (char.upper === "Č") example = "Čư M'gar, Čư Yang Sin";
                    else if (char.upper === "Đ") example = "Đắk Lắk, đao";
                    else if (char.upper === "Ĕ") example = "kơ̆k, ĕa";
                    else if (char.upper === "Ê̆") example = "kê̆, ê̆a";
                    else if (char.upper === "Ĭ") example = "ĭt, dĭ";
                    else if (char.upper === "Ñ") example = "M'Nông, ñu";
                    else if (char.upper === "Ŏ") example = "knơ̆ng, ŏng";
                    else if (char.upper === "Ô̆") example = "ô̆, mô̆ng";
                    else if (char.upper === "Ơ̆") example = "knơ̆ng, hnơ̆ng";
                    else if (char.upper === "Ŭ") example = "ŭ, hŭ";
                    else if (char.upper === "Ư̆") example = "ƀrư̆";

                    return (
                      <tr key={char.lower} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-bold text-sm text-indigo-900">
                          {char.upper} {char.lower}
                        </td>
                        <td className="p-2.5 text-slate-600">{char.name}</td>
                        <td className="p-2.5 font-mono font-bold text-amber-800 bg-amber-50/40">
                          {char.telex}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-800 bg-emerald-50/40">
                          {char.vni}
                        </td>
                        <td className="p-2.5 text-slate-500 italic">{example}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ví dụ thực tế hồ sơ cán bộ Đắk Lắk */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Ví dụ nhập họ tên cán bộ & địa bàn tỉnh Đắk Lắk
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">Họ tên cán bộ:</span>
                <ul className="space-y-1 text-[11px] text-slate-600">
                  <li>• <strong>Y Krô Čêč</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">Y Kroo Cceec</code>)</li>
                  <li>• <strong>H&apos;Biê Niê</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">H&apos;Bieee Nieee</code>)</li>
                  <li>• <strong>Ama Ƀuôn</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">Ama BBuoon</code>)</li>
                  <li>• <strong>H&apos;Čam Ksor</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">H&apos;Ccam Ksor</code>)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">Địa bàn buôn làng:</span>
                <ul className="space-y-1 text-[11px] text-slate-600">
                  <li>• <strong>Ƀuôn Ma Thuột</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">BBuoon Ma Thuootj</code>)</li>
                  <li>• <strong>Huyện Čư M&apos;gar</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">Huyenj Ccuw M&apos;gar</code>)</li>
                  <li>• <strong>Huyện Krông Ƀúk</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">Huyenj Kroong BBuks</code>)</li>
                  <li>• <strong>Huyện Ea H&apos;leo</strong> (gõ Telex: <code className="bg-white px-1 py-0.5 rounded border">Ea H&apos;leo</code>)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Chuyển nhanh kiểu gõ:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMode("telexEde");
                setIsGuideOpen(false);
              }}
              className="h-7 text-xs bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            >
              Bật Telex Êđê
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMode("vniEde");
                setIsGuideOpen(false);
              }}
              className="h-7 text-xs bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            >
              Bật VNI Êđê
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsGuideOpen(false)}
            className="h-7 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Đã hiểu & Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
