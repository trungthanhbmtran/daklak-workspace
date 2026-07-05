import * as React from "react";
import {
  Palette, Type, Sparkles, Upload, Loader2, Layers, Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PRESETS,
  getBannerBackgroundStyle,
  renderBannerWatermark
} from "./banner-helpers";
import { useImageUpload } from "../../hooks/useImageUpload";
import { toast } from "sonner";

interface SloganCustomizerProps {
  customStyles: any;
  setCustomStyles: React.Dispatch<React.SetStateAction<any>>;
  updateStyle: (key: string, value: any) => void;
  watchedName?: string;
  watchedDescription?: string;
}

export function SloganCustomizer({
  customStyles,
  setCustomStyles,
  updateStyle,
  watchedName,
  watchedDescription
}: SloganCustomizerProps) {
  const { isUploading: isUploadingBg, handleImageUpload: handleBgImageUpload } = useImageUpload({
    onSuccess: (_, url) => {
      updateStyle("bgImage", url);
      toast.success("Tải hình nền biểu ngữ thành công!");
    }
  });

  const { isUploading: isUploadingWatermark, handleImageUpload: handleWatermarkUpload } = useImageUpload({
    onSuccess: (_, url) => {
      updateStyle("watermarkUrl", url);
      toast.success("Tải biểu tượng cổ động thành công!");
    }
  });

  return (
    <Card className="shadow-sm border border-amber-200 bg-amber-50/5">
      <CardHeader className="pb-3 border-b bg-amber-50/10">
        <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-amber-900">
          ⭐ Tùy chỉnh Giao diện Khẩu hiệu (Slogan Styling)
        </CardTitle>
        <CardDescription className="text-xs text-amber-800">
          Cá nhân hóa dải màu dốc, tải ảnh họa tiết nền và biểu tượng cổ động truyền thống.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-white dark:bg-slate-900">

        {/* Presets Grid */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mẫu giao diện nhanh (Style Presets)</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setCustomStyles(preset)}
                className="p-2 text-[11px] font-bold rounded-lg border text-center transition-all bg-white hover:bg-slate-50 border-slate-200 active:scale-95 shadow-xs flex flex-col items-center gap-1 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <div
                  style={{ background: `linear-gradient(to right, ${preset.bgGradientStart}, ${preset.bgGradientMiddle || preset.bgGradientStart}, ${preset.bgGradientEnd})` }}
                  className="w-full h-3 rounded border border-black/10"
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="background" className="w-full border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20">
          <TabsList className="grid grid-cols-3 w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
            <TabsTrigger value="background" className="text-[11px] font-bold flex items-center gap-1.5 py-1.5 cursor-pointer">
              <Palette className="w-3.5 h-3.5 text-blue-600" /> Hình nền (Background)
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-[11px] font-bold flex items-center gap-1.5 py-1.5 cursor-pointer">
              <Type className="w-3.5 h-3.5 text-emerald-600" /> Phông chữ (Typography)
            </TabsTrigger>
            <TabsTrigger value="watermark" className="text-[11px] font-bold flex items-center gap-1.5 py-1.5 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Họa tiết & Nút (Icon & Button)
            </TabsTrigger>
          </TabsList>

          {/* BACKGROUND TAB */}
          <TabsContent value="background" className="space-y-4 pt-1">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Loại nền (Background Type)</Label>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateStyle("bgType", "gradient")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${customStyles.bgType !== "pattern" && customStyles.bgType !== "image"
                    ? "bg-white text-slate-800 shadow-xs dark:bg-slate-900 dark:text-slate-200"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  Dải màu dốc (Gradient)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStyle("bgType", "pattern");
                    if (customStyles.bgImage !== "pattern-drum" && customStyles.bgImage !== "pattern-clouds") {
                      updateStyle("bgImage", "pattern-drum");
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${customStyles.bgType === "pattern"
                    ? "bg-white text-slate-800 shadow-xs dark:bg-slate-900 dark:text-slate-200"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  Hình chìm nghệ thuật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStyle("bgType", "image");
                    if (customStyles.bgImage === "pattern-drum" || customStyles.bgImage === "pattern-clouds" || !customStyles.bgImage) {
                      updateStyle("bgImage", "custom");
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${customStyles.bgType === "image"
                    ? "bg-white text-slate-800 shadow-xs dark:bg-slate-900 dark:text-slate-200"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  Ảnh nền toàn phần
                </button>
              </div>

              {customStyles.bgType === "pattern" && (
                <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Chọn hoa văn chìm có sẵn</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {[
                        { name: "Trống đồng Đông Sơn", value: "pattern-drum" },
                        { name: "Họa tiết mây sóng cổ", value: "pattern-clouds" }
                      ].map((pat) => (
                        <button
                          key={pat.value}
                          type="button"
                          onClick={() => updateStyle("bgImage", pat.value)}
                          className={`p-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${customStyles.bgImage === pat.value
                            ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                            }`}
                        >
                          {pat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu sắc dốc phía dưới hoa văn (Gradient Colors)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Bắt đầu</span>
                        <div className="flex gap-1 mt-0.5">
                          <Input type="color" value={customStyles.bgGradientStart || "#990000"} onChange={(e) => updateStyle("bgGradientStart", e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                          <Input type="text" value={customStyles.bgGradientStart || "#990000"} onChange={(e) => updateStyle("bgGradientStart", e.target.value)} className="font-mono text-[9px] uppercase h-8 px-1" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Giữa</span>
                        <div className="flex gap-1 mt-0.5">
                          <Input type="color" value={customStyles.bgGradientMiddle || "#cc0000"} onChange={(e) => updateStyle("bgGradientMiddle", e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                          <Input type="text" value={customStyles.bgGradientMiddle || "#cc0000"} onChange={(e) => updateStyle("bgGradientMiddle", e.target.value)} className="font-mono text-[9px] uppercase h-8 px-1" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Kết thúc</span>
                        <div className="flex gap-1 mt-0.5">
                          <Input type="color" value={customStyles.bgGradientEnd || "#800000"} onChange={(e) => updateStyle("bgGradientEnd", e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                          <Input type="text" value={customStyles.bgGradientEnd || "#800000"} onChange={(e) => updateStyle("bgGradientEnd", e.target.value)} className="font-mono text-[9px] uppercase h-8 px-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {customStyles.bgType === "image" && (
                <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Tải ảnh nền tùy chọn</Label>
                    <input
                      type="file"
                      accept="image/*"
                      id="bg-image-uploader"
                      className="hidden"
                      onChange={handleBgImageUpload}
                    />
                    {isUploadingBg ? (
                      <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                        <Loader2 className="animate-spin text-blue-500 w-5 h-5" />
                      </div>
                    ) : customStyles.bgImage && customStyles.bgImage.startsWith("http") ? (
                      <div className="relative rounded-xl overflow-hidden border shadow-inner">
                        <img src={customStyles.bgImage} className="w-full h-24 object-cover" alt="Custom BG" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                          <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById("bg-image-uploader")?.click()}>Thay đổi hình ảnh</Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => document.getElementById("bg-image-uploader")?.click()}
                        className="h-24 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <Upload className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-semibold text-slate-500">Tải lên ảnh nền của bạn</span>
                        <p className="text-[10px] text-slate-400 italic mt-0.5">Tệp tối đa 1MB, khuyến nghị tỷ lệ rộng (landscape)</p>
                      </div>
                    )}
                  </div>

                  {customStyles.bgImage && customStyles.bgImage.startsWith("http") && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <Label className="text-[11px] font-bold text-slate-600 uppercase">Độ tối lớp phủ nền (Overlay Dimmer)</Label>
                        <span className="text-xs font-mono font-bold text-blue-600">{Math.round((customStyles.bgOpacity !== undefined ? customStyles.bgOpacity : 0.45) * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="0.90" step="0.05"
                        value={customStyles.bgOpacity !== undefined ? customStyles.bgOpacity : 0.45}
                        onChange={(e) => updateStyle("bgOpacity", parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                      />
                      <p className="text-[10px] text-slate-400 italic">Tăng độ tối giúp chữ tuyên truyền hiển thị sắc nét hơn trên ảnh nền phức tạp.</p>
                    </div>
                  )}
                </div>
              )}

              {customStyles.bgType !== "pattern" && customStyles.bgType !== "image" && (
                <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu bắt đầu (Start)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="color" value={customStyles.bgGradientStart || "#990000"} onChange={(e) => updateStyle("bgGradientStart", e.target.value)} className="w-9 h-9 p-0 border-none rounded-md cursor-pointer shrink-0" />
                        <Input type="text" value={customStyles.bgGradientStart || "#990000"} onChange={(e) => updateStyle("bgGradientStart", e.target.value)} className="font-mono text-xs uppercase h-9" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu giữa (Middle)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="color" value={customStyles.bgGradientMiddle || "#cc0000"} onChange={(e) => updateStyle("bgGradientMiddle", e.target.value)} className="w-9 h-9 p-0 border-none rounded-md cursor-pointer shrink-0" />
                        <Input type="text" value={customStyles.bgGradientMiddle || "#cc0000"} onChange={(e) => updateStyle("bgGradientMiddle", e.target.value)} className="font-mono text-xs uppercase h-9" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu kết thúc (End)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="color" value={customStyles.bgGradientEnd || "#800000"} onChange={(e) => updateStyle("bgGradientEnd", e.target.value)} className="w-9 h-9 p-0 border-none rounded-md cursor-pointer shrink-0" />
                        <Input type="text" value={customStyles.bgGradientEnd || "#800000"} onChange={(e) => updateStyle("bgGradientEnd", e.target.value)} className="font-mono text-xs uppercase h-9" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TYPOGRAPHY TAB */}
          <TabsContent value="typography" className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu khẩu hiệu nhỏ</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={customStyles.titleColor || "#fbc02d"} onChange={(e) => updateStyle("titleColor", e.target.value)} className="w-9 h-9 p-0 border-none rounded-md cursor-pointer shrink-0" />
                  <Input type="text" value={customStyles.titleColor || "#fbc02d"} onChange={(e) => updateStyle("titleColor", e.target.value)} className="font-mono text-xs uppercase h-9" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu chữ chính (Slogan)</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={customStyles.textColor || "#fff7ed"} onChange={(e) => updateStyle("textColor", e.target.value)} className="w-9 h-9 p-0 border-none rounded-md cursor-pointer shrink-0" />
                  <Input type="text" value={customStyles.textColor || "#fff7ed"} onChange={(e) => updateStyle("textColor", e.target.value)} className="font-mono text-xs uppercase h-9" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Căn lề nội dung</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateStyle("alignment", align)}
                      className={`p-1.5 text-xs font-bold rounded capitalize border transition-all cursor-pointer h-9 ${customStyles.alignment === align
                        ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                    >
                      {align === "left" ? "Trái" : align === "center" ? "Giữa" : "Phải"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* WATERMARK & BUTTON TAB */}
          <TabsContent value="watermark" className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Họa tiết chìm (Watermark) */}
              <div className="space-y-3 md:border-r md:pr-6 border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800/50">
                  <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">Hiện họa tiết chìm</Label>
                  <Switch
                    checked={customStyles.showStar !== false}
                    onCheckedChange={(checked) => updateStyle("showStar", checked)}
                  />
                </div>

                {customStyles.showStar !== false && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Loại biểu tượng / hình chìm</Label>
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {[
                          { name: "⭐ Ngôi sao cổ động", value: "star" },
                          { name: "🏵️ Trống đồng", value: "drum" },
                          { name: "💮 Bông sen", value: "lotus" },
                          { name: "🖼️ Hình tự tải lên", value: "custom" }
                        ].map((wType) => (
                          <button
                            key={wType.value}
                            type="button"
                            onClick={() => updateStyle("watermarkType", wType.value)}
                            className={`p-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-left ${customStyles.watermarkType === wType.value
                              ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/20 dark:border-amber-400"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                              }`}
                          >
                            {wType.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {customStyles.watermarkType === "custom" && (
                      <div className="space-y-2 mt-1">
                        <Label className="text-[11px] font-bold uppercase text-slate-500">Tải biểu tượng chìm riêng</Label>
                        <input
                          type="file"
                          accept="image/*"
                          id="watermark-uploader"
                          className="hidden"
                          onChange={handleWatermarkUpload}
                        />
                        {isUploadingWatermark ? (
                          <div className="h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                            <Loader2 className="animate-spin text-blue-500 w-5 h-5" />
                          </div>
                        ) : customStyles.watermarkUrl ? (
                          <div className="relative rounded-xl overflow-hidden border p-2 flex items-center justify-between bg-slate-50">
                            <img src={customStyles.watermarkUrl} className="w-12 h-12 object-contain" alt="Custom Watermark" />
                            <Button type="button" variant="secondary" size="xs" onClick={() => document.getElementById("watermark-uploader")?.click()}>Thay đổi</Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => document.getElementById("watermark-uploader")?.click()}
                            className="h-16 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer group"
                          >
                            <Upload className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-semibold text-slate-500">Tải biểu tượng PNG riêng</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Màu sắc</Label>
                        <div className="flex gap-1 mt-0.5">
                          <Input type="color" value={customStyles.starColor || "#ffff00"} onChange={(e) => updateStyle("starColor", e.target.value)} className="w-7 h-7 p-0 border-none rounded cursor-pointer" />
                          <Input type="text" value={customStyles.starColor || "#ffff00"} onChange={(e) => updateStyle("starColor", e.target.value)} className="font-mono text-[9px] uppercase h-7 px-1" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 ">Độ đậm</Label>
                          <span className="text-[9px] font-mono font-bold text-slate-400">{Math.round((customStyles.starOpacity || 0.08) * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0" max="0.30" step="0.01"
                          value={customStyles.starOpacity || 0.08}
                          onChange={(e) => updateStyle("starOpacity", parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thiết lập nút bấm hành động (Action Button) */}
              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> Nút hành động cổ động
                </Label>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Nhãn chữ trên nút</Label>
                  <Input
                    type="text"
                    value={customStyles.buttonText || "Tìm hiểu thêm"}
                    onChange={(e) => updateStyle("buttonText", e.target.value)}
                    className="text-xs py-1 mt-1 h-9"
                    placeholder="Ví dụ: Tìm hiểu thêm, Xem chi tiết..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Nền nút bấm</Label>
                    <div className="flex gap-1.5 mt-1">
                      <Input type="color" value={customStyles.buttonBg || "#ffde59"} onChange={(e) => updateStyle("buttonBg", e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer shrink-0" />
                      <Input type="text" value={customStyles.buttonBg || "#ffde59"} onChange={(e) => updateStyle("buttonBg", e.target.value)} className="font-mono text-[10px] uppercase h-8 px-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Màu chữ nút</Label>
                    <div className="flex gap-1.5 mt-1">
                      <Input type="color" value={customStyles.buttonTextColor || "#0f172a"} onChange={(e) => updateStyle("buttonTextColor", e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer shrink-0" />
                      <Input type="text" value={customStyles.buttonTextColor || "#0f172a"} onChange={(e) => updateStyle("buttonTextColor", e.target.value)} className="font-mono text-[10px] uppercase h-8 px-1" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>
        </Tabs>

        {/* Live Slogan Preview */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô phỏng hiển thị thực tế trên Cổng thông tin (Realtime Preview)</Label>
          <div
            style={getBannerBackgroundStyle(customStyles)}
            className={`w-full text-white py-6 px-6 md:px-8 rounded-xl shadow border-y border-[#ffde59]/25 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 ${customStyles.alignment === "center" ? "text-center md:items-center" :
              customStyles.alignment === "right" ? "text-right md:flex-row-reverse" : "text-left"
              }`}
          >
            {/* Intricate Gold Borders */}
            <div className="absolute inset-x-0 top-0.5 h-px bg-linear-to-r from-transparent via-[#ffde59]/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0.5 h-px bg-linear-to-r from-transparent via-[#ffde59]/50 to-transparent" />

            {/* Custom / Traditional Watermark */}
            {customStyles.showStar !== false && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 transition-all duration-300">
                {renderBannerWatermark(customStyles)}
              </div>
            )}

            <div className="z-10 flex flex-col gap-1 flex-1">
              <span
                style={{ color: customStyles.titleColor || "#fbc02d" }}
                className={`text-xs font-black tracking-widest uppercase flex items-center gap-1.5 drop-shadow-sm ${customStyles.alignment === "center" ? "justify-center" :
                  customStyles.alignment === "right" ? "justify-end" : "justify-start"
                  }`}
              >
                <span>⭐</span> {watchedName || "TIÊU ĐỀ KHẨU HIỆU TUYÊN TRUYỀN"}
              </span>
              <h3
                style={{ color: customStyles.textColor || "#fff7ed" }}
                className="text-sm md:text-base font-black tracking-wide leading-snug uppercase drop-shadow"
              >
                &quot;{watchedDescription || "Nội dung khẩu hiệu chi tiết, slogan hành động của cơ quan nhà nước."}&quot;
              </h3>
            </div>
            <div className="z-10 shrink-0">
              <div
                style={{ backgroundColor: customStyles.buttonBg || "#ffde59", color: customStyles.buttonTextColor || "#0f172a" }}
                className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase px-4 py-2.5 rounded shadow-md border border-white/10 transition-all cursor-not-allowed"
              >
                {customStyles.buttonText || "Tìm hiểu thêm"}
                <Info className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
