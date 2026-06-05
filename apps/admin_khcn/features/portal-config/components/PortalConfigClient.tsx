"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings, Phone, Calendar, Sparkles, Building, CheckCircle2,
  Image as ImageIcon, Loader2, UploadCloud, X, Eye,
  Columns, Languages, Map as MapIcon, Layout, Palette
} from "lucide-react";
import { PortalSubNav } from "./PortalSubNav";
import { usePortalConfig } from "./usePortalConfig";
import {
  DEFAULT_ORG_SECTIONS_VI, DEFAULT_ORG_SECTIONS_EN,
  DEFAULT_LEADERS_VI, DEFAULT_LEADERS_EN,
  DEFAULT_COMMUNE_ZONES_VI, DEFAULT_COMMUNE_ZONES_EN,
  EMPTY_TRANSLATION,
} from "./portalConfig.defaults";
import {
  BrandingCard, ScheduleCard, AddressLicenseCard, CustomLabelsCard, ContactDetailsCard,
} from "./sub-components/PortalConfigCards";
import { Label } from "@/components/ui/label";

export function PortalConfigClient() {
  const router = useRouter();
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [activeConfigTab, setActiveConfigTab] = useState<string>("identity");
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [orgSections] = useState<Record<string, any[]>>({ vi: DEFAULT_ORG_SECTIONS_VI, en: DEFAULT_ORG_SECTIONS_EN });
  const [leaders] = useState<Record<string, any[]>>({ vi: DEFAULT_LEADERS_VI, en: DEFAULT_LEADERS_EN });
  const [communeZones] = useState<Record<string, any[]>>({ vi: DEFAULT_COMMUNE_ZONES_VI, en: DEFAULT_COMMUNE_ZONES_EN });
  const [useCustomAboutLayout] = useState<boolean>(false);
  const [customAboutLayout] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  // Tất cả fetch + save logic trong hook
  const {
    logoUrl, setLogoUrl, mapUrl, setMapUrl, themeLogo,
    isSaving, languages, configTranslations, updateTranslationField,
    isLoading, handleSave,
  } = usePortalConfig();

  // 4. Image Upload Hook integration
  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      setLogoUrl(`/api/v1/admin/media/download/${fileId}`);
      toast.success("Tải logo thành công!");
    },
    onRemove: () => {
      setLogoUrl("");
    }
  });

  const {
    isUploading: isUploadingMap,
    previewUrl: previewMapUrl,
    handleImageUpload: handleMapUpload,
    removeImage: removeMapImage
  } = useImageUpload({
    onSuccess: (fileId) => {
      setMapUrl(`/api/v1/admin/media/download/${fileId}`);
      toast.success("Tải bản đồ hành chính thành công!");
    },
    onRemove: () => {
      setMapUrl("");
    }
  });

  // Dynamic active selection
  const activeLogo = previewUrl || themeLogo || logoUrl;
  const activeMap = previewMapUrl || mapUrl;

  const resolveLogoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/api/v1/admin/media/download/${url}`;
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 select-none">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải dữ liệu cấu hình đơn vị...</p>
      </div>
    );
  }

  const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  // Card render helpers — đã tách thành sub-components ở ./sub-components/PortalConfigCards.tsx
  // Mỗi card có React.memo để tránh re-render không cần thiết
  const cardProps = (langCode: string) => ({
    langCode,
    activeLangs,
    trans: configTranslations[langCode] || {},
    isCompareMode,
    onUpdate: updateTranslationField,
  });









  // Simulator Localized values
  const simName = configTranslations[activeLangTab]?.unitName || "UBND XÃ DANG KANG";
  const simTitle = configTranslations[activeLangTab]?.unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ";
  const simIdentifier = configTranslations[activeLangTab]?.unitIdentifier || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK";
  const simSchedule = configTranslations[activeLangTab]?.citizenSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30";
  const simLicense = configTranslations[activeLangTab]?.licenseInfo || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp";
  const simResponsible = configTranslations[activeLangTab]?.responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang";
  const simAddress = configTranslations[activeLangTab]?.address || "Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk";
  const simContactFormTitle = configTranslations[activeLangTab]?.contactFormTitle || "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG";
  const simContactFormSuccessDesc = configTranslations[activeLangTab]?.contactFormSuccessDesc || "Bộ phận văn thư xã Dang Kang đã nhận được thư góp ý của bạn và sẽ phản hồi sớm nhất có thể.";
  const simContactMapTitle = configTranslations[activeLangTab]?.contactMapTitle || "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG";
  const simFooterPortalTitle = configTranslations[activeLangTab]?.footerPortalTitle || "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG";
  const simFooterPortalSubtitle = configTranslations[activeLangTab]?.footerPortalSubtitle || "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng";
  const simHotline = configTranslations[activeLangTab]?.hotline || "Đường dây nóng: 0262.3812.345";
  const simFax = configTranslations[activeLangTab]?.fax || "Fax: 0262.3812.346";
  const simEmail = configTranslations[activeLangTab]?.email || "Email: xadangkang@krongbong.daklak.gov.vn";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none animate-fade-in">
      {/* GLOBAL SUB-NAVIGATION */}
      <PortalSubNav />
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
        <Button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lưu cấu hình
            </>
          )}
        </Button>
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
              <Tabs
                value={activeLangTab}
                onValueChange={(val) => {
                  setActiveLangTab(val);
                }}
                className="w-auto"
              >
                <TabsList className="bg-slate-200/60 p-0.5 flex gap-0.5 rounded-lg border border-slate-200/50">
                  {activeLangs.map((lang) => (
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

          {/* TAB 1: CẤU HÌNH ĐƠN VỊ & LỊCH TIẾP DÂN */}
          {activeConfigTab === "identity" && (
            <div className="space-y-6 animate-fade-in">
              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BrandingCard {...cardProps("vi")} />
                  <BrandingCard {...cardProps("en")} />
                </div>
              ) : (
                <BrandingCard {...cardProps(activeLangTab)} />
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ScheduleCard {...cardProps("vi")} />
                  <ScheduleCard {...cardProps("en")} />
                </div>
              ) : (
                <ScheduleCard {...cardProps(activeLangTab)} />
              )}
            </div>
          )}

          {/* TAB 2: THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI */}
          {activeConfigTab === "contact" && (
            <div className="space-y-6 animate-fade-in">
              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AddressLicenseCard {...cardProps("vi")} />
                  <AddressLicenseCard {...cardProps("en")} />
                </div>
              ) : (
                <AddressLicenseCard {...cardProps(activeLangTab)} />
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomLabelsCard {...cardProps("vi")} />
                  <CustomLabelsCard {...cardProps("en")} />
                </div>
              ) : (
                <CustomLabelsCard {...cardProps(activeLangTab)} />
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ContactDetailsCard {...cardProps("vi")} />
                  <ContactDetailsCard {...cardProps("en")} />
                </div>
              ) : (
                <ContactDetailsCard {...cardProps(activeLangTab)} />
              )}

              {/* Standalone Map Upload Card */}
              <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-indigo-650" />
                    <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Bản đồ Hành chính Đơn vị
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                      Hình ảnh Bản đồ hành chính
                    </Label>

                    <div className="flex items-start gap-4">
                      <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center shrink-0 w-44 h-28 relative overflow-hidden group">
                        {activeMap ? (
                          <>
                            <img
                              src={resolveLogoUrl(activeMap)}
                              alt="Administrative Map"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => removeMapImage()}
                                className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                              >
                                <X className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                            {isUploadingMap ? (
                              <Loader2 className="w-6 h-6 animate-spin text-indigo-650" />
                            ) : (
                              <UploadCloud className="w-6 h-6 text-slate-400" />
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1 pt-1">
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Tải lên hình ảnh ranh giới phân vùng hành chính hoặc bản đồ địa giới của đơn vị. Hình ảnh này sẽ hiển thị trực quan trên Trang Liên hệ ở Cổng Dân Cư.
                        </p>
                        <input
                          type="file"
                          ref={mapInputRef}
                          onChange={handleMapUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingMap}
                            onClick={() => mapInputRef.current?.click()}
                            className="text-[10px] font-black uppercase tracking-wider border-slate-250 rounded-lg hover:bg-slate-50 h-8"
                          >
                            Tải ảnh lên
                          </Button>
                          {activeMap && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeMapImage()}
                              className="text-[10px] font-black uppercase tracking-wider rounded-lg h-8"
                            >
                              Xóa ảnh
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SHORTCUTS & LIVE PORTAL PREVIEW */}
        <div className="space-y-8">
          {/* STYLE & LAYOUT SHORTCUTS CARD */}
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

          {/* LIVE SIMULATOR PREVIEW */}
          <Card className="border border-emerald-150 bg-emerald-50/5 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-emerald-50/20 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Mô phỏng hiển thị Portal
                </CardTitle>
              </div>
              <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-auto">
                <TabsList className="bg-emerald-100/50 p-0.5 flex gap-0.5 rounded-lg border border-emerald-100">
                  {activeLangs.map(lang => (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      className="px-2 py-1 font-extrabold uppercase text-[9px] rounded-md transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
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
                  <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center p-1 shadow-sm shrink-0">
                    {activeLogo ? (
                      <img src={activeLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[8px] font-black text-slate-400">LOGO</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-serif font-black tracking-widest text-[#0056b3] uppercase leading-none">
                      {simTitle || "TRANG THÔNG TIN ĐIỆN TỬ"}
                    </span>
                    <h2 className="text-[11px] font-serif font-black text-[#cc0000] uppercase tracking-wide leading-tight mt-0.5 truncate">
                      {simName || "UBND XÃ DANG KANG"}
                    </h2>
                    <span className="text-blue-800 text-[6px] font-serif font-bold tracking-wider leading-none uppercase mt-0.5">
                      {simIdentifier || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK"}
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
                      {simSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Portal Service Title Simulation */}
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 shadow-inner space-y-2">
                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest leading-none block border-b pb-1 border-emerald-150">Dịch vụ công trực tuyến (Footer Portal Widget)</span>
                <div className="space-y-0.5">
                  <h4 className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide leading-tight">
                    {simFooterPortalTitle}
                  </h4>
                  <p className="text-[8px] font-medium text-slate-600 leading-normal">
                    {simFooterPortalSubtitle}
                  </p>
                </div>
              </div>

              {/* Dynamic Contact Labels Simulation */}
              <div className="bg-sky-50/20 border border-sky-100 rounded-lg p-3 shadow-inner space-y-1.5">
                <span className="text-[8px] font-black text-sky-800 uppercase tracking-widest leading-none block border-b pb-1 border-sky-150">Góp ý & Bản đồ (Contact Page Labels)</span>
                <p className="text-[8px] font-bold text-sky-900 uppercase tracking-wide leading-tight">
                  Form: {simContactFormTitle}
                </p>
                <p className="text-[8px] font-medium text-slate-500 leading-tight">
                  Map: {simContactMapTitle}
                </p>
                <p className="text-[7.5px] italic text-slate-400 leading-normal border-t pt-1 border-slate-100">
                  Thành công: "{simContactFormSuccessDesc}"
                </p>
              </div>

              {/* License/Footer simulator */}
              <div className="bg-slate-900 text-slate-300 rounded-lg p-3 space-y-1.5 text-[8px] shadow-md">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block border-b pb-1 border-slate-800">Mô phỏng Chân Trang (Footer)</span>
                <p className="font-extrabold text-white text-[9px] uppercase">{simName || "UBND XÃ DANG KANG"}</p>
                <p className="text-[#fef08a] font-bold text-[8px] uppercase tracking-wide">{simIdentifier || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK"}</p>
                <p className="text-slate-400 leading-normal">
                  {simLicense || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp"}. Chịu trách nhiệm nội dung: {simResponsible || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang"}.
                </p>
                <div className="text-slate-400 space-y-0.5 pt-1 border-t border-slate-800 font-medium">
                  <p>{simAddress}</p>
                  <p>
                    <span className="text-amber-300 font-mono font-bold">{simHotline}</span>
                    {simFax && ` | `}
                    <span className="font-mono">{simFax}</span>
                  </p>
                  <p className="text-sky-300">{simEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
