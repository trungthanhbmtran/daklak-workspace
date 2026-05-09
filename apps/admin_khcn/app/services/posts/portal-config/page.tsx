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
  const [hotline, setHotline] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [citizenSchedule, setCitizenSchedule] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch existing portal config categories
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

  // 2. Load existing configs into form state
  useEffect(() => {
    if (dbCategories && dbCategories.length > 0) {
      const nameCat = dbCategories.find((c) => c.code === "unit_name");
      const titleCat = dbCategories.find((c) => c.code === "unit_title");
      const hotlineCat = dbCategories.find((c) => c.code === "hotline");
      const respCat = dbCategories.find((c) => c.code === "responsible_person");
      const scheduleCat = dbCategories.find((c) => c.code === "citizen_schedule");
      const logoCat = dbCategories.find((c) => c.code === "logo_url");

      if (nameCat) setUnitName(nameCat.name);
      if (titleCat) setUnitTitle(titleCat.name);
      if (hotlineCat) setHotline(hotlineCat.name);
      if (respCat) setResponsiblePerson(respCat.name);
      if (scheduleCat) setCitizenSchedule(scheduleCat.description || scheduleCat.name);
      if (logoCat) setLogoUrl(logoCat.name);
    }
  }, [dbCategories]);

  // 3. Image Upload Hook integration
  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      toast.success("Tải logo thành công!");
    }
  });

  // Dynamic active logo selection
  const activeLogo = previewUrl || logoUrl;

  // 4. Save/Update Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const configItems = [
      { code: "unit_name", name: unitName || "UBND XÃ DANG KANG", description: "Tên đơn vị chính quyền" },
      { code: "unit_title", name: unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ", description: "Tiêu đề phụ của cổng thông tin" },
      { code: "hotline", name: hotline || "0262.3812.345", description: "Đường dây nóng hỗ trợ công dân" },
      { code: "responsible_person", name: responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang", description: "Người chịu trách nhiệm nội dung thông tin" },
      { code: "logo_url", name: activeLogo || "", description: "Đường dẫn ảnh logo cơ quan" },
      { code: "citizen_schedule", name: citizenSchedule.slice(0, 255), description: citizenSchedule } // Use description to store long schedules
    ];

    try {
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
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải dữ liệu cấu hình đơn vị...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
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
          <p className="text-sm text-slate-500">
            Cấu hình thông tin hoạt động, nhận diện thương hiệu, đường dây nóng và lịch tiếp công dân của Ủy ban Nhân dân.
          </p>
        </div>
        <Button
          type="submit"
          onClick={handleSave}
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
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* CARD 1: BRANDING & IDENTITIES */}
            <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Nhận diện & Bản quyền
                  </CardTitle>
                </div>
                <CardDescription>Thiết lập tiêu đề chính hiển thị trên đỉnh của Cổng thông tin điện tử.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="unit-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Tên đơn vị chính (Hàng dưới)
                    </Label>
                    <Input
                      id="unit-name"
                      placeholder="Ví dụ: UBND XÃ DANG KANG"
                      className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit-title" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Tiêu đề phụ (Hàng trên)
                    </Label>
                    <Input
                      id="unit-title"
                      placeholder="Ví dụ: TRANG THÔNG TIN ĐIỆN TỬ"
                      className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                      value={unitTitle}
                      onChange={(e) => setUnitTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resp-person" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Người chịu trách nhiệm nội dung (Phần chân trang)
                  </Label>
                  <Input
                    id="resp-person"
                    placeholder="Ví dụ: Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang"
                    className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400 font-medium">Hiển thị ở chân trang để tuân thủ quy định pháp luật về Cổng thông tin cơ quan nhà nước.</p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: CONTACT & HOTLINE */}
            <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Liên hệ & Đường dây nóng
                  </CardTitle>
                </div>
                <CardDescription>Thiết lập số điện thoại khẩn cấp phục vụ tiếp nhận ý kiến, phản ánh kiến nghị.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>

            {/* CARD 3: CITIZEN RECEPTION SCHEDULE */}
            <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Lịch tiếp công dân định kỳ
                  </CardTitle>
                </div>
                <CardDescription>Cấu hình lịch trình hoạt động, thời gian gặp gỡ đối thoại trực tiếp của lãnh đạo.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="schedule" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Nội dung chi tiết thời gian tiếp công dân
                  </Label>
                  <Textarea
                    id="schedule"
                    rows={4}
                    placeholder="Ví dụ: Thứ 5 hàng tuần • 08:00 - 11:30"
                    className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm font-medium leading-relaxed"
                    value={citizenSchedule}
                    onChange={(e) => setCitizenSchedule(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* RIGHT COLUMN: LOGO UPLOADER & LIVE PORTAL PREVIEW */}
        <div className="space-y-8">
          {/* LOGO CONFIG */}
          <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden">
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
                  Mô phỏng hiển thị Portal thực tế
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
                      {unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ"}
                    </span>
                    <h2 className="text-[11px] font-serif font-black text-[#cc0000] uppercase tracking-wide leading-tight mt-0.5 truncate">
                      {unitName || "UBND XÃ DANG KANG"}
                    </h2>
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
                    <span className="text-[10px] font-semibold text-slate-700 truncate mt-0.5">
                      {citizenSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30"}
                    </span>
                  </div>
                </div>
              </div>

              {/* License/Footer simulator */}
              <div className="bg-slate-900 text-slate-300 rounded-lg p-3 space-y-2 text-[9px] shadow-md">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block border-b pb-1 border-slate-800">Mô phỏng Chân Trang (Footer)</span>
                <p className="font-extrabold text-white text-[10px] uppercase">{unitName || "UBND XÃ DANG KANG"}</p>
                <p className="text-slate-400 leading-normal">
                  Chịu trách nhiệm nội dung: {responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang"}.
                </p>
                <p className="text-slate-400">Đường dây nóng: <span className="text-amber-300 font-mono font-bold">{hotline || "0262.3812.345"}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
