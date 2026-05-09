"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/features/system-admin/categories/api";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Phone,
  Calendar,
  Sparkles,
  Shield,
  Building,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
  FileText,
  UserCheck,
  Eye
} from "lucide-react";
import apiClient from "@/lib/axiosInstance";

export default function PortalConfigPage() {
  const [unitName, setUnitName] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitIdentifier, setUnitIdentifier] = useState("");
  const [hotline, setHotline] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [citizenSchedule, setCitizenSchedule] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [licenseInfo, setLicenseInfo] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");

  const [configTranslations, setConfigTranslations] = useState<Record<string, {
    unitName: string;
    unitTitle: string;
    unitIdentifier: string;
    responsiblePerson: string;
    citizenSchedule: string;
    licenseInfo: string;
    address: string;
  }>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch registered active languages from Category module
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const all = await categoryApi.fetchAll();
        const langs = all.filter((c: any) => c.group === "LANGUAGE" && c.active === 1);
        setLanguages(langs.length > 0 ? langs : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      } catch (error) {
        console.error("Error fetching languages", error);
        setLanguages([{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      }
    };
    fetchLanguages();
  }, []);

  // 2. Fetch existing portal config categories
  const { data: dbCategories, isLoading, refetch } = useQuery({
    queryKey: ["categories", "PORTAL_CONFIG"],
    queryFn: async () => {
      try {
        const res = await categoryApi.fetchAll();
        return Array.isArray(res) ? res.filter((c: any) => c.group === "PORTAL_CONFIG") : [];
      } catch (error) {
        console.error("Error fetching categories", error);
        return [];
      }
    }
  });

  // 3. Load existing configs and translation sets into state
  useEffect(() => {
    if (dbCategories && dbCategories.length > 0) {
      const nameCat = dbCategories.find((c) => c.code === "unit_name");
      const titleCat = dbCategories.find((c) => c.code === "unit_title");
      const identCat = dbCategories.find((c) => c.code === "unit_identifier");
      const hotlineCat = dbCategories.find((c) => c.code === "hotline");
      const respCat = dbCategories.find((c) => c.code === "responsible_person");
      const scheduleCat = dbCategories.find((c) => c.code === "citizen_schedule");
      const logoCat = dbCategories.find((c) => c.code === "logo_url");
      const licenseCat = dbCategories.find((c) => c.code === "license_info");
      const faxCat = dbCategories.find((c) => c.code === "fax");
      const emailCat = dbCategories.find((c) => c.code === "email");
      const addressCat = dbCategories.find((c) => c.code === "address");

      // Set global fields
      if (hotlineCat) setHotline(hotlineCat.name);
      if (logoCat) setLogoUrl(logoCat.name);
      if (faxCat) setFax(faxCat.name);
      if (emailCat) setEmail(emailCat.name);

      const activeLangs = languages.length > 0 ? languages.map(l => l.code) : ["vi", "en"];
      const newTranslations: typeof configTranslations = {};

      activeLangs.forEach(langCode => {
        newTranslations[langCode] = {
          unitName: "",
          unitTitle: "",
          unitIdentifier: "",
          responsiblePerson: "",
          citizenSchedule: "",
          licenseInfo: "",
          address: ""
        };
      });

      const extractField = (cat: any, lang: string) => {
        if (!cat) return "";
        
        // Handle backwards compatibility for long plain text in citizen schedule
        if (cat.code === "citizen_schedule" && lang === "vi" && cat.description && !cat.description.trim().startsWith('{')) {
          return cat.description || cat.name || "";
        }
        
        // Check if there is valid JSON dictionary in description field
        if (cat.description && cat.description.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(cat.description);
            if (parsed && typeof parsed === 'object') {
              if (parsed[lang] !== undefined) {
                return parsed[lang];
              }
              if (parsed.translations && parsed.translations[lang] !== undefined) {
                return parsed.translations[lang];
              }
            }
          } catch (e) {
            console.error("Error parsing JSON description", e);
          }
        }

        // Return name field as primary language (vi) fallback
        if (lang === "vi") {
          return cat.name || "";
        }

        return "";
      };

      activeLangs.forEach(langCode => {
        newTranslations[langCode] = {
          unitName: extractField(nameCat, langCode),
          unitTitle: extractField(titleCat, langCode),
          unitIdentifier: extractField(identCat, langCode),
          responsiblePerson: extractField(respCat, langCode),
          citizenSchedule: extractField(scheduleCat, langCode),
          licenseInfo: extractField(licenseCat, langCode),
          address: extractField(addressCat, langCode),
        };
      });

      setConfigTranslations(newTranslations);

      // Save fallback local state
      if (nameCat) setUnitName(nameCat.name);
      if (titleCat) setUnitTitle(titleCat.name);
      if (identCat) setUnitIdentifier(identCat.name);
      if (respCat) setResponsiblePerson(respCat.name);
      if (scheduleCat) setCitizenSchedule(scheduleCat.description || scheduleCat.name);
      if (licenseCat) setLicenseInfo(licenseCat.name);
      if (addressCat) setAddress(addressCat.name);
    }
  }, [dbCategories, languages]);

  // helper to update active tab field translation state
  const updateTranslationField = (lang: string, field: string, value: string) => {
    setConfigTranslations((prev) => {
      const existingLang = prev[lang] || {
        unitName: "",
        unitTitle: "",
        unitIdentifier: "",
        responsiblePerson: "",
        citizenSchedule: "",
        licenseInfo: "",
        address: ""
      };
      return {
        ...prev,
        [lang]: {
          ...existingLang,
          [field]: value
        }
      };
    });
  };

  // 4. Image Upload Hook integration
  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      toast.success("Tải logo thành công!");
    }
  });

  // Dynamic active logo selection
  const activeLogo = previewUrl || logoUrl;

  // 5. Save/Update Handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];
      
      const buildTranslationsJson = (fieldExtractor: (langCode: string) => string) => {
        const dict: Record<string, string> = {};
        activeLangs.forEach(l => {
          dict[l.code] = fieldExtractor(l.code) || "";
        });
        return JSON.stringify(dict);
      };

      const configItems = [
        {
          code: "unit_name",
          name: configTranslations["vi"]?.unitName || "UBND XÃ DANG KANG",
          description: buildTranslationsJson(lang => configTranslations[lang]?.unitName)
        },
        {
          code: "unit_title",
          name: configTranslations["vi"]?.unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ",
          description: buildTranslationsJson(lang => configTranslations[lang]?.unitTitle)
        },
        {
          code: "unit_identifier",
          name: configTranslations["vi"]?.unitIdentifier || "TỈNH ĐẮK LẮK",
          description: buildTranslationsJson(lang => configTranslations[lang]?.unitIdentifier)
        },
        {
          code: "responsible_person",
          name: configTranslations["vi"]?.responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang",
          description: buildTranslationsJson(lang => configTranslations[lang]?.responsiblePerson)
        },
        {
          code: "citizen_schedule",
          name: (configTranslations["vi"]?.citizenSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30").slice(0, 255),
          description: buildTranslationsJson(lang => configTranslations[lang]?.citizenSchedule)
        },
        {
          code: "license_info",
          name: configTranslations["vi"]?.licenseInfo || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp",
          description: buildTranslationsJson(lang => configTranslations[lang]?.licenseInfo)
        },
        {
          code: "address",
          name: configTranslations["vi"]?.address || "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk",
          description: buildTranslationsJson(lang => configTranslations[lang]?.address)
        },
        // Global non-translatable configurations
        {
          code: "hotline",
          name: hotline || "0262.3812.345",
          description: "Đường dây nóng hỗ trợ công dân"
        },
        {
          code: "logo_url",
          name: activeLogo || "",
          description: "Đường dẫn ảnh logo cơ quan"
        },
        {
          code: "fax",
          name: fax || "0262.3812.346",
          description: "Số Fax cơ quan"
        },
        {
          code: "email",
          name: email || "xadangkang@krongbong.daklak.gov.vn",
          description: "Địa chỉ Email cơ quan"
        }
      ];

      for (const item of configItems) {
        const existing = dbCategories?.find((c) => c.code === item.code);

        if (existing) {
          // UPDATE
          await apiClient.put(`/categories/${existing.id}`, {
            code: item.code,
            name: item.name,
            description: item.description,
            active: 1
          });
        } else {
          // CREATE NEW
          await apiClient.post("/categories", {
            group: "PORTAL_CONFIG",
            code: item.code,
            name: item.name,
            description: item.description,
            order: 1
          });
        }
      }

      toast.success("Lưu cấu hình hệ thống thành công!");
      refetch();
    } catch (error) {
      console.error("Failed to save portal config", error);
      toast.error("Không thể lưu cấu hình hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
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

  // Simulator Localized values
  const simName = configTranslations[activeLangTab]?.unitName || "UBND XÃ DANG KANG";
  const simTitle = configTranslations[activeLangTab]?.unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ";
  const simIdentifier = configTranslations[activeLangTab]?.unitIdentifier || "TỈNH ĐẮK LẮK";
  const simSchedule = configTranslations[activeLangTab]?.citizenSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30";
  const simLicense = configTranslations[activeLangTab]?.licenseInfo || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp";
  const simResponsible = configTranslations[activeLangTab]?.responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang";
  const simAddress = configTranslations[activeLangTab]?.address || "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/20">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              Cấu hình chung đơn vị & Portal
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý thông tin nhận diện cơ quan, bản quyền, đường dây nóng, và lịch tiếp công dân đa ngôn ngữ.
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
        {/* LEFT COLUMN: EDITOR FORM WITH TRANSLATION TABS */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-2 rounded-xl mb-6 shadow-sm">
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider pl-2">
                Ngôn ngữ soạn thảo cấu hình:
              </span>
              <TabsList className="bg-slate-200/50 p-1 w-full sm:w-auto flex justify-start gap-1 rounded-lg">
                {activeLangs.map(lang => (
                  <TabsTrigger
                    key={lang.code}
                    value={lang.code}
                    className="px-3.5 py-1.5 font-extrabold uppercase text-[10px] rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                  >
                    {lang.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {activeLangs.map(lang => {
              const trans = configTranslations[lang.code] || {
                unitName: "",
                unitTitle: "",
                unitIdentifier: "",
                responsiblePerson: "",
                citizenSchedule: "",
                licenseInfo: "",
                address: ""
              };

              return (
                <TabsContent key={lang.code} value={lang.code} className="space-y-6 mt-0 focus-visible:outline-none">
                  {/* CARD 1: BRANDING & IDENTITIES */}
                  <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                    <CardHeader className="bg-slate-50/50 border-b">
                      <div className="flex items-center gap-2.5">
                        <Building className="w-4 h-4 text-indigo-600" />
                        <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                          Nhận diện & Bản quyền ({lang.name})
                        </CardTitle>
                      </div>
                      <CardDescription>Thiết lập tiêu đề chính hiển thị trên đỉnh của Cổng thông tin điện tử.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={`unit-name-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Tên đơn vị chính (Hàng dưới)
                          </Label>
                          <Input
                            id={`unit-name-${lang.code}`}
                            placeholder="Ví dụ: UBND XÃ DANG KANG"
                            className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                            value={trans.unitName || ""}
                            onChange={(e) => updateTranslationField(lang.code, "unitName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`unit-title-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Tiêu đề phụ (Hàng trên)
                          </Label>
                          <Input
                            id={`unit-title-${lang.code}`}
                            placeholder="Ví dụ: TRANG THÔNG TIN ĐIỆN TỬ"
                            className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                            value={trans.unitTitle || ""}
                            onChange={(e) => updateTranslationField(lang.code, "unitTitle", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`unit-identifier-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Đơn vị hành chính cấp tỉnh (Hàng 3)
                          </Label>
                          <Input
                            id={`unit-identifier-${lang.code}`}
                            placeholder="Ví dụ: TỈNH ĐẮK LẮK"
                            className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                            value={trans.unitIdentifier || ""}
                            onChange={(e) => updateTranslationField(lang.code, "unitIdentifier", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`resp-person-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Người chịu trách nhiệm nội dung (Phần chân trang)
                        </Label>
                        <Input
                          id={`resp-person-${lang.code}`}
                          placeholder="Ví dụ: Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang"
                          className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                          value={trans.responsiblePerson || ""}
                          onChange={(e) => updateTranslationField(lang.code, "responsiblePerson", e.target.value)}
                        />
                        <p className="text-[11px] text-slate-400 font-medium">Hiển thị ở chân trang để tuân thủ quy định pháp luật về Cổng thông tin cơ quan nhà nước.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CARD 3: CITIZEN RECEPTION SCHEDULE */}
                  <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                    <CardHeader className="bg-slate-50/50 border-b">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                          Lịch tiếp công dân định kỳ ({lang.name})
                        </CardTitle>
                      </div>
                      <CardDescription>Cấu hình lịch trình hoạt động, thời gian gặp gỡ đối thoại trực tiếp của lãnh đạo.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <Label htmlFor={`schedule-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Nội dung chi tiết thời gian tiếp công dân
                        </Label>
                        <Textarea
                          id={`schedule-${lang.code}`}
                          rows={4}
                          placeholder="Ví dụ: Thứ 5 hàng tuần • 08:00 - 11:30"
                          className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm font-medium leading-relaxed"
                          value={trans.citizenSchedule || ""}
                          onChange={(e) => updateTranslationField(lang.code, "citizenSchedule", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* CARD 4: EXTENDED FOOTER INFO */}
                  <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                    <CardHeader className="bg-slate-50/50 border-b">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                          Địa chỉ & Giấy phép ({lang.name})
                        </CardTitle>
                      </div>
                      <CardDescription>Cấu hình các thông tin liên hệ và pháp lý khác hiển thị tại chân trang của cổng thông tin.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`address-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Địa chỉ trụ sở chính cơ quan
                        </Label>
                        <Input
                          id={`address-${lang.code}`}
                          placeholder="Ví dụ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk"
                          className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                          value={trans.address || ""}
                          onChange={(e) => updateTranslationField(lang.code, "address", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`license-info-${lang.code}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Thông tin Giấy phép hoạt động
                        </Label>
                        <Textarea
                          id={`license-info-${lang.code}`}
                          rows={3}
                          placeholder="Ví dụ: Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp"
                          className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm font-medium leading-relaxed"
                          value={trans.licenseInfo || ""}
                          onChange={(e) => updateTranslationField(lang.code, "licenseInfo", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* GLOBAL CONFIGS CARD (FAX, EMAIL, HOTLINE) */}
          <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Đường dây nóng, Fax & Thư điện tử (Cấu hình chung hệ thống)
                </CardTitle>
              </div>
              <CardDescription>Các liên hệ hành chính kỹ thuật dùng chung cho toàn bộ các phiên bản ngôn ngữ.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotline" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Số điện thoại hotline
                  </Label>
                  <Input
                    id="hotline"
                    placeholder="Ví dụ: 0262.3812.345"
                    className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 font-mono tracking-wider font-semibold"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Số Fax cơ quan
                  </Label>
                  <Input
                    id="fax"
                    placeholder="Ví dụ: 0262.3812.346"
                    className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 font-mono"
                    value={fax}
                    onChange={(e) => setFax(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Địa chỉ Email cơ quan
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ví dụ: xadangkang@krongbong.daklak.gov.vn"
                    className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 font-mono"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: LOGO UPLOADER & LIVE PORTAL PREVIEW */}
        <div className="space-y-8">
          {/* LOGO CONFIG */}
          <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Logo nhận diện đơn vị
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center gap-5">
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner group">
                {activeLogo ? (
                  <>
                    <img src={activeLogo} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => {
                        removeImage();
                        setLogoUrl("");
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full text-xs font-bold gap-1"
                    >
                      <X className="w-4 h-4" /> Gỡ ảnh
                    </button>
                  </>
                ) : isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-indigo-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[10px] font-bold animate-pulse">Đang tải...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors gap-1"
                  >
                    <UploadCloud className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tải lên Logo</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg text-xs font-bold uppercase text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Chọn tệp ảnh logo
                </Button>
                <p className="text-[10px] text-slate-400 mt-2">Dạng tệp hỗ trợ: PNG, JPG, WEBP. Dung lượng tối đa: 2MB.</p>
              </div>
            </CardContent>
          </Card>

          {/* LIVE SIMULATOR PREVIEW */}
          <Card className="border border-emerald-150 bg-emerald-50/5 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-emerald-50/20 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Mô phỏng hiển thị Portal ({activeLangTab.toUpperCase()})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-left">
              {/* Header simulator */}
              <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-3 shadow-inner space-y-2">
                <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest leading-none block border-b pb-1 border-amber-100/50">Mô phỏng Đỉnh Trang (Header)</span>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center p-1 shadow-sm flex-shrink-0">
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
                      {simIdentifier || "TỈNH ĐẮK LẮK"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reception simulation */}
              <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3 shadow-inner space-y-2">
                <span className="text-[8px] font-black text-indigo-800 uppercase tracking-widest leading-none block border-b pb-1 border-indigo-150">Lịch Tiếp Công Dân (Widget)</span>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
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

              {/* License/Footer simulator */}
              <div className="bg-slate-900 text-slate-300 rounded-lg p-3 space-y-1.5 text-[8px] shadow-md">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block border-b pb-1 border-slate-800">Mô phỏng Chân Trang (Footer)</span>
                <p className="font-extrabold text-white text-[9px] uppercase">{simName || "UBND XÃ DANG KANG"}</p>
                <p className="text-[#fef08a] font-bold text-[8px] uppercase tracking-wide">HUYỆN KRÔNG BÔNG - {simIdentifier || "TỈNH ĐẮK LẮK"}</p>
                <p className="text-slate-400 leading-normal">
                  {simLicense || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp"}. Chịu trách nhiệm nội dung: {simResponsible || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang"}.
                </p>
                <div className="text-slate-400 space-y-0.5 pt-1 border-t border-slate-800 font-medium">
                  <p>Địa chỉ: {simAddress || "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk"}</p>
                  <p>Đường dây nóng: <span className="text-amber-300 font-mono font-bold">{hotline || "0262.3812.345"}</span> | Fax: <span className="font-mono">{fax || "0262.3812.346"}</span></p>
                  <p>Email: <span className="text-sky-300">{email || "xadangkang@krongbong.daklak.gov.vn"}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
