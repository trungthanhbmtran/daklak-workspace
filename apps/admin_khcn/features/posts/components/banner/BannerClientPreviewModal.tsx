/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getBannerBackgroundStyle, 
  renderBannerWatermark 
} from "./banner-helpers";
import { Heading, Text } from "@/components/ui/typography";


interface BannerClientPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customStyles: any;
  watchedName?: string;
  watchedDescription?: string;
  onSaveAndSubmit: () => void;
}

export function BannerClientPreviewModal({
  isOpen,
  onClose,
  customStyles,
  watchedName,
  watchedDescription,
  onSaveAndSubmit
}: BannerClientPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Simulated Browser Title Bar */}
        <div className="bg-slate-850 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <Text as="span" onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:scale-105 transition-transform cursor-pointer" />
              <Text as="span" className="w-3 h-3 rounded-full bg-yellow-500" />
              <Text as="span" className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="bg-slate-900/60 text-[10px] text-slate-400 font-mono px-3 py-1 rounded-md border border-slate-700/50 ml-4 flex items-center gap-1.5">
              <Text as="span" className="text-emerald-500">🔒</Text> https://portal.daklak.gov.vn
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Text as="span" className="text-slate-400 font-bold">Chế độ xem trước: Cổng Dân Cư Client</Text>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Simulated Viewport Client App Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] text-slate-900">
          
          {/* Portal Header */}
          <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs border-2 border-yellow-400 shadow-sm">
                  ĐL
                </div>
                <div>
                  <Heading level="h1" className="font-black tracking-tight uppercase text-red-600">ỦY BAN NHÂN DÂN TỈNH ĐẮK LẮK</Heading>
                  <Text className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">CỔNG THÔNG TIN ĐIỆN TỬ BAN NGHÀNH</Text>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-700 uppercase">
                <Text as="span" className="text-red-600">Trang chủ</Text>
                <Text as="span">Tin tức</Text>
                <Text as="span">Dịch vụ công</Text>
                <Text as="span">Liên hệ</Text>
              </nav>
            </div>
          </header>

          {/* Portal Body Container */}
          <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            
            {/* Hero / Portal Title Block */}
            <div className="text-center space-y-2 py-4">
              <Text as="span" className="text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                Tin tức &amp; Sự kiện Nổi bật
              </Text>
              <Heading level="h2" className="font-black text-slate-900 uppercase tracking-tight">Cổng thông tin Dân cư Quốc gia</Heading>
              <Text className="text-slate-500 max-w-lg mx-auto">
                Kênh truyền thông chính thống cung cấp thông tin, hướng dẫn thủ tục hành chính công và các hoạt động tuyên truyền của cơ quan nhà nước.
              </Text>
            </div>

            {/* Simulated Custom Slogan Banner (The Subject!) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Text as="span" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khẩu hiệu Tuyên truyền của bạn sẽ được hiển thị tại đây:</Text>
                <Text as="span" className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-black uppercase">Live</Text>
              </div>

              <div 
                style={getBannerBackgroundStyle(customStyles)}
                className={`w-full text-white py-8 px-8 md:px-10 rounded-2xl shadow-xl border-y border-[#ffde59]/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300 ${
                  customStyles.alignment === "center" ? "text-center md:items-center" : 
                  customStyles.alignment === "right" ? "text-right md:flex-row-reverse" : "text-left"
                }`}
              >
                {/* Intricate Gold Borders */}
                <div className="absolute inset-x-0 top-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffde59]/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffde59]/60 to-transparent" />

                {/* Custom / Traditional Watermark */}
                {customStyles.showStar !== false && (
                  <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 scale-125 transition-all duration-300">
                    {renderBannerWatermark(customStyles)}
                  </div>
                )}

                <div className="z-10 flex flex-col gap-2 flex-1">
                  <Text as="span" 
                    style={{ color: customStyles.titleColor || "#fbc02d" }}
                    className={` font-black tracking-widest uppercase flex items-center gap-2 drop-shadow-md ${ customStyles.alignment === "center" ? "justify-center" : customStyles.alignment === "right" ? "justify-end" : "justify-start" }`}
                  >
                    <Text as="span">⭐</Text> {watchedName || "TIÊU ĐỀ KHẨU HIỆU TUYÊN TRUYỀN"}
                  </Text>
                  <Heading level="h3" 
                    style={{ color: customStyles.textColor || "#fff7ed" }}
                    className="font-black tracking-wide leading-snug uppercase drop-shadow-md"
                  >
                    &quot;{watchedDescription || "Nội dung khẩu hiệu chi tiết, slogan hành động của cơ quan nhà nước."}&quot;
                  </Heading>
                </div>
                <div className="z-10 shrink-0">
                  <div
                    style={{ backgroundColor: customStyles.buttonBg || "#ffde59", color: customStyles.buttonTextColor || "#0f172a" }}
                    className="inline-flex items-center gap-2 text-xs font-black tracking-wider uppercase px-5 py-3 rounded-md shadow-lg border border-white/10 transition-all hover:scale-105"
                  >
                    {customStyles.buttonText || "Tìm hiểu thêm"}
                    <Info className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Content Feed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-xs space-y-2">
                  <div className="bg-slate-100 aspect-video rounded-lg w-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              ))}
            </div>

          </main>

          {/* Portal Footer */}
          <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center text-xs mt-12 border-t border-slate-800">
            <Text className="font-bold text-slate-200">© 2026 Bản quyền thuộc về Ủy ban Nhân dân tỉnh Đắk Lắk</Text>
            <Text className="text-[11px] text-slate-500 mt-1">Đường Lê Duẩn, Thành phố Buôn Ma Thuột, Tỉnh Đắk Lắk</Text>
          </footer>

        </div>

        {/* Footer control */}
        <div className="bg-slate-800 px-6 py-4 border-t border-slate-700/60 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="bg-slate-700 text-white hover:bg-slate-600 border-none">
            Đóng xem trước
          </Button>
          <Button 
            type="button" 
            onClick={onSaveAndSubmit} 
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Lưu cấu hình ngay
          </Button>
        </div>

      </div>
    </div>
  );
}
