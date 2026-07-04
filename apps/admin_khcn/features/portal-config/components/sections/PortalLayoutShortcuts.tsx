"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Layout } from "lucide-react";

export const PortalLayoutShortcuts = () => {
  const router = useRouter();

  return (
    <Card className="border border-indigo-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-linear-to-br from-indigo-50/10 to-slate-50/30">
      <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
          <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Phím tắt Thiết kế & Bố cục
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
          Tài nguyên thương hiệu (Logo, Favicon), màu sắc, phông chữ và cách thiết kế trang giới thiệu đã được đồng bộ hóa quy hoạch sang các phân hệ chuyên dụng dưới đây:
        </p>

        {/* Shortcut 1: Giao diện */}
        <div className="group relative border border-slate-150 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-sm transition-all duration-300">
          <div className="flex gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600 group-hover:scale-105 transition-transform duration-300 shrink-0 h-9 w-9 flex items-center justify-center">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                Quản trị Giao diện (Appearance)
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                Cấu hình màu sắc, phông chữ, bo góc, tải lên Logo nhận diện và Favicon của đơn vị.
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/services/posts/appearance")}
                className="p-0 text-indigo-600 hover:text-indigo-800 font-extrabold text-[10px] h-auto mt-1 flex items-center gap-1"
              >
                Đi tới Quản lý Giao diện &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* Shortcut 2: Page Builder */}
        <div className="group relative border border-slate-150 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-sm transition-all duration-300">
          <div className="flex gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 group-hover:scale-105 transition-transform duration-300 shrink-0 h-9 w-9 flex items-center justify-center">
              <Layout className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                Trình tạo Trang trực quan (Page Builder)
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                Thiết kế sinh động bố cục trang giới thiệu (/gioi-thieu), trang chủ và liên hệ hành chính.
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/services/posts/portal-page-builder")}
                className="p-0 text-indigo-600 hover:text-indigo-800 font-extrabold text-[10px] h-auto mt-1 flex items-center gap-1"
              >
                Mở Trình tạo Trang trực quan &rarr;
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
