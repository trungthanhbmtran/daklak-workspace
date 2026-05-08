// features/posts/components/BannerForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Save, Loader2, ImagePlus,
  Trash2, Monitor, Globe, Info, ExternalLink,
  UploadCloud, X, Eye, Palette, Sparkles, Type, Upload, FileImage, Layers, Image
} from "lucide-react";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import axios from "axios";
import imageCompression from "browser-image-compression";
import apiClient from "@/lib/axiosInstance";
import { categoryApi } from "@/features/system-admin/categories/api";
import { toast } from "sonner";


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { bannerSchema } from "../schemas";
import { postsApi } from "../api";

interface BannerFormProps {
  onBack: () => void;
  editId?: string | null;
}


const DEFAULT_STYLES = {
  bgType: "gradient",
  bgGradientStart: "#990000",
  bgGradientMiddle: "#cc0000",
  bgGradientEnd: "#800000",
  bgImage: "",
  titleColor: "#fbc02d",
  textColor: "#fff7ed",
  alignment: "left",
  showStar: true,
  starColor: "#ffff00",
  starOpacity: 0.08,
  watermarkType: "star", // star, drum, lotus, custom
  watermarkUrl: "",
  buttonBg: "#ffde59",
  buttonTextColor: "#0f172a",
  buttonText: "Tìm hiểu thêm"
};

const PRESETS = [
  {
    name: "Cờ đỏ Sao vàng",
    bgType: "gradient",
    bgGradientStart: "#990000",
    bgGradientMiddle: "#cc0000",
    bgGradientEnd: "#800000",
    bgImage: "",
    titleColor: "#fbc02d",
    textColor: "#fff7ed",
    starColor: "#ffff00",
    starOpacity: 0.08,
    watermarkType: "star",
    watermarkUrl: "",
    buttonBg: "#ffde59",
    buttonTextColor: "#0f172a",
    alignment: "left"
  },
  {
    name: "Hồng sen Tươi sáng",
    bgType: "gradient",
    bgGradientStart: "#b0124a",
    bgGradientMiddle: "#db2777",
    bgGradientEnd: "#9d174d",
    bgImage: "",
    titleColor: "#fdf2f8",
    textColor: "#fce7f3",
    starColor: "#ffffff",
    starOpacity: 0.05,
    watermarkType: "lotus",
    watermarkUrl: "",
    buttonBg: "#ffffff",
    buttonTextColor: "#be185d",
    alignment: "center"
  },
  {
    name: "Đại dương Sâu thẳm",
    bgType: "gradient",
    bgGradientStart: "#1e3a8a",
    bgGradientMiddle: "#2563eb",
    bgGradientEnd: "#172554",
    bgImage: "",
    titleColor: "#60a5fa",
    textColor: "#dbeafe",
    starColor: "#60a5fa",
    starOpacity: 0.08,
    watermarkType: "drum",
    watermarkUrl: "",
    buttonBg: "#3b82f6",
    buttonTextColor: "#ffffff",
    alignment: "left"
  },
  {
    name: "Xanh ngọc Vinh quang",
    bgType: "gradient",
    bgGradientStart: "#064e3b",
    bgGradientMiddle: "#059669",
    bgGradientEnd: "#022c22",
    bgImage: "",
    titleColor: "#a7f3d0",
    textColor: "#ecfdf5",
    starColor: "#34d399",
    starOpacity: 0.06,
    watermarkType: "star",
    watermarkUrl: "",
    buttonBg: "#10b981",
    buttonTextColor: "#ffffff",
    alignment: "left"
  },
  {
    name: "Ánh kim Hoàng triều",
    bgType: "gradient",
    bgGradientStart: "#78350f",
    bgGradientMiddle: "#d97706",
    bgGradientEnd: "#451a03",
    bgImage: "",
    titleColor: "#fef3c7",
    textColor: "#fffbeb",
    starColor: "#fbbf24",
    starOpacity: 0.1,
    watermarkType: "drum",
    watermarkUrl: "",
    buttonBg: "#fbbf24",
    buttonTextColor: "#78350f",
    alignment: "center"
  }
];

const getBannerBackgroundStyle = (styles: any) => {
  if (styles.bgType === "image") {
    if (styles.bgImage === "pattern-drum") {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' opacity='0.08'><circle cx='50%' cy='50%' r='40%' fill='none' stroke='%23ffffff' stroke-width='2'/><circle cx='50%' cy='50%' r='30%' fill='none' stroke='%23ffffff' stroke-dasharray='10,10'/><circle cx='50%' cy='50%' r='20%' fill='none' stroke='%23ffffff'/><circle cx='50%' cy='50%' r='10%' fill='none' stroke='%23ffffff'/></svg>`;
      const drumBg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
      return {
        background: `linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundImage: `${drumBg}, linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    if (styles.bgImage === "pattern-clouds") {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='30' opacity='0.05'><path d='M0 15 Q15 0, 30 15 T60 15' fill='none' stroke='%23ffffff' stroke-width='1.5'/></svg>`;
      const cloudsBg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
      return {
        background: `linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundImage: `${cloudsBg}, linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundRepeat: "repeat"
      };
    }
    if (styles.bgImage && styles.bgImage.startsWith("http")) {
      return {
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${styles.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
  }
  return {
    background: `linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`
  };
};

const renderBannerWatermark = (styles: any) => {
  const color = styles.starColor || "#ffff00";
  const opacity = styles.starOpacity !== undefined ? styles.starOpacity : 0.08;

  if (styles.watermarkType === "drum") {
    return (
      <svg className="w-56 h-56 transition-all duration-300" style={{ color, opacity }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="32" strokeDasharray="6 3" />
        <circle cx="50" cy="50" r="24" />
        <circle cx="50" cy="50" r="16" />
        <polygon points="50,38 53,44 60,44 55,48 57,55 50,51 43,55 45,48 40,44 47,44" fill="currentColor" />
        <path d="M50,16 L50,24 M50,76 L50,84 M16,50 L24,50 M76,50 L84,50 M26,26 L32,32 M74,74 L68,68 M26,74 L32,68 M74,26 L68,32" />
      </svg>
    );
  }

  if (styles.watermarkType === "lotus") {
    return (
      <svg className="w-56 h-56 transition-all duration-300" style={{ color, opacity }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C11.5,4 10,6 8,7.5C9.5,8 11,9 12,11C13,9 14.5,8 16,7.5C14,6 12.5,4 12,2M12,12C10.5,13.5 8,14 5,14C7,15.5 10,16 12,18C14,16 17,15.5 19,14C16,14 13.5,13.5 12,12M12,19C10.5,19.8 9,20.5 7,21C9,21.5 11,21.8 12,22C13,21.8 15,21.5 17,21C15,20.5 13.5,19.8 12,19Z" />
      </svg>
    );
  }

  if (styles.watermarkType === "custom" && styles.watermarkUrl) {
    return (
      <img 
        src={styles.watermarkUrl} 
        alt="Custom Watermark" 
        className="w-48 h-48 object-contain transition-all duration-300" 
        style={{ opacity, filter: `drop-shadow(0 0 8px ${color})` }} 
      />
    );
  }

  return (
    <svg className="w-56 h-56 transition-all duration-300" style={{ color, opacity }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
    </svg>
  );
};

type BannerFormValues = z.infer<typeof bannerSchema>;

export function BannerForm({ onBack, editId }: BannerFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      linkType: "internal",
      customUrl: "",
      target: "_self",
      position: "top",
      orderIndex: 0,
      status: true,
      startAt: "",
      endAt: "",
      translations: {},
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");

  const [customStyles, setCustomStyles] = useState<any>(DEFAULT_STYLES);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isUploadingWatermark, setIsUploadingWatermark] = useState(false);

  const uploadCustomFile = async (file: File): Promise<string> => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1200,
      fileType: 'image/webp'
    });

    const res: any = await apiClient.post("/media/request-upload", {
      originalName: file.name,
      mimeType: compressed.type,
      size: compressed.size,
    });

    const { uploadUrl, fileId } = res.data;

    await axios.put(uploadUrl, compressed, {
      headers: { "Content-Type": compressed.type }
    });

    const confirmRes: any = await apiClient.post("/media/confirm-upload", { fileId });
    return confirmRes.data.downloadUrl;
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    try {
      const url = await uploadCustomFile(file);
      updateStyle("bgImage", url);
      toast.success("Tải hình nền biểu ngữ thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải hình nền lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingWatermark(true);
    try {
      const url = await uploadCustomFile(file);
      updateStyle("watermarkUrl", url);
      toast.success("Tải biểu tượng cổ động thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải biểu tượng lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingWatermark(false);
    }
  };

  const watchedPosition = form.watch("position");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const all = await categoryApi.fetchAll();
        const langs = all.filter((c: any) => c.group === 'LANGUAGE' && c.active === 1);
        setLanguages(langs);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        fileType: 'image/webp'
      });

      const res: any = await apiClient.post("/media/request-upload", {
        originalName: file.name,
        mimeType: compressed.type,
        size: compressed.size,
      });

      const { uploadUrl, fileId } = res.data;

      await axios.put(uploadUrl, compressed, {
        headers: { "Content-Type": compressed.type }
      });

      const confirmRes: any = await apiClient.post("/media/confirm-upload", { fileId });

      setPreviewUrl(confirmRes.data.downloadUrl);
      form.setValue("imageUrl", fileId, { shouldValidate: true, shouldDirty: true });

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    form.setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEdit && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, isEdit, form]);

  const { data: bannerData, isLoading: isFetching } = useQuery({
    queryKey: ["banner", editId],
    queryFn: async () => {
      const res: any = await postsApi.getBanner(editId!);
      return res?.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (bannerData) {
      let parsedTranslations = bannerData.translations || {};
      if (typeof parsedTranslations === 'string') {
        try {
          parsedTranslations = JSON.parse(parsedTranslations);
        } catch (e) {
          parsedTranslations = {};
        }
      }

      let loadedStyles = DEFAULT_STYLES;
      if (bannerData.metaDescription) {
        try {
          const parsed = JSON.parse(bannerData.metaDescription);
          if (parsed && typeof parsed === 'object') {
            loadedStyles = { ...DEFAULT_STYLES, ...parsed };
          }
        } catch (e) {
          console.log("metaDescription is not a JSON styling config");
        }
      }
      setCustomStyles(loadedStyles);

      form.reset({
        ...bannerData,
        name: bannerData.name || "",
        slug: bannerData.slug || "",
        description: bannerData.description || "",
        imageUrl: bannerData.imageUrl || "",
        customUrl: bannerData.customUrl || "",
        startAt: bannerData.startAt ? new Date(bannerData.startAt).toISOString().split('T')[0] : "",
        endAt: bannerData.endAt ? new Date(bannerData.endAt).toISOString().split('T')[0] : "",
        translations: parsedTranslations,
        metaTitle: bannerData.metaTitle || "",
        metaDescription: bannerData.metaDescription || "",
      });
    }
  }, [bannerData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const payload = {
        ...values,
        translations: JSON.stringify(values.translations || {}),
        metaDescription: values.position === "custom" ? JSON.stringify(customStyles) : values.metaDescription || ""
      };
      if (isEdit) return postsApi.updateBanner(editId!, payload);
      return postsApi.createBanner(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      onBack();
    },
  });

  const updateStyle = (key: string, value: any) => {
    setCustomStyles((prev: any) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (values: BannerFormValues) => {
    mutation.mutate(values);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải dữ liệu banner...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 md:px-8 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Cấu hình trình chiếu & liên kết</p>
          </div>
        </div>
         <div className="flex items-center gap-3">
          {watchedPosition === "custom" && (
            <Button
              type="button"
              variant="outline"
              className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 font-extrabold flex items-center gap-2"
              onClick={() => setIsPreviewModalOpen(true)}
            >
              <Eye className="w-4 h-4 text-amber-600 animate-pulse" /> Xem trước ở Client
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={onBack}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-500/20"
            disabled={mutation.isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? "Cập nhật Banner" : "Lưu Banner"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Card className="shadow-sm border-none bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-slate-700 tracking-tight">
                    <Info className="h-5 w-5 text-blue-500" /> Thông tin Banner
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                      <TabsTrigger value="vi" className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Tiếng Việt
                      </TabsTrigger>
                      {languages.filter(l => l.code !== 'vi').map(lang => (
                        <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" /> {lang.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="vi" className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Tiêu đề Banner <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: Banner Chào mừng năm mới..." className="text-lg py-6 focus-visible:ring-blue-500 bg-slate-50/50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Mô tả ngắn</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Mô tả ngắn gọn về mục đích hoặc vị trí sử dụng..."
                                className="min-h-[100px] resize-none bg-slate-50/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {languages.filter(l => l.code !== 'vi').map(lang => (
                      <TabsContent key={lang.code} value={lang.code} className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 mb-6 flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg"><Globe className="h-4 w-4 text-blue-600" /></div>
                          <div>
                            <p className="text-sm font-bold text-blue-900">Phiên bản dịch: {lang.name}</p>
                            <p className="text-xs text-blue-700/70 italic">Nhập tên và mô tả bằng {lang.name}</p>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name={`translations.${lang.code}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-blue-700">Tên Banner ({lang.name})</FormLabel>
                              <FormControl>
                                <Input placeholder={`Tên bằng ${lang.name}...`} className="text-lg py-6 border-blue-100 bg-blue-50/10" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`translations.${lang.code}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-blue-700">Mô tả ({lang.name})</FormLabel>
                              <FormControl>
                                <Textarea placeholder={`Mô tả bằng ${lang.name}...`} className="min-h-[100px] resize-none border-blue-100 bg-blue-50/10" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Mã định danh (Slug)</FormLabel>
                          <FormControl>
                            <Input placeholder="banner-homepage-top" className="font-mono bg-muted/30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Vị trí hiển thị</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-slate-50/50"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="top">Phía trên (Top Header)</SelectItem>
                              <SelectItem value="middle">Giữa trang (Body)</SelectItem>
                              <SelectItem value="bottom">Phía dưới (Footer)</SelectItem>
                              <SelectItem value="custom">Khẩu hiệu Tuyên truyền (Patriotic Slogan)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
                            * Vị trí &quot;Khẩu hiệu Tuyên truyền&quot; sẽ sinh giao diện cờ đỏ sao vàng cực kỳ sang trọng trên Cổng thông tin, sử dụng Tiêu đề làm khẩu hiệu nhỏ, và Nội dung mô tả làm Slogan chính. Không cần tải ảnh lên.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-slate-50/80">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" /> Liên kết & Điều hướng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="linkType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Loại liên kết</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="internal">Trang nội bộ</SelectItem>
                              <SelectItem value="external">Liên kết bên ngoài</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Mở trang</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="_self">Tại tab hiện tại</SelectItem>
                              <SelectItem value="_blank">Trong tab mới</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Đường dẫn liên kết (URL)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input placeholder="https://..." className="pl-9 bg-slate-50/50" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {watchedPosition === "custom" && (
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
                              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                customStyles.bgType !== "image" 
                                  ? "bg-white text-slate-800 shadow-xs dark:bg-slate-900 dark:text-slate-200" 
                                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                              }`}
                            >
                              Dải màu dốc (Gradient)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStyle("bgType", "image")}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                customStyles.bgType === "image" 
                                  ? "bg-white text-slate-800 shadow-xs dark:bg-slate-900 dark:text-slate-200" 
                                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                              }`}
                            >
                              Hình ảnh hoa văn
                            </button>
                          </div>

                          {customStyles.bgType === "image" ? (
                            <div className="space-y-4 pt-2">
                              <div>
                                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Chọn hoa văn chìm có sẵn</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1.5">
                                  {[
                                    { name: "Trống đồng Đông Sơn", value: "pattern-drum" },
                                    { name: "Họa tiết mây sóng cổ", value: "pattern-clouds" },
                                    { name: "Hình ảnh tự tải lên", value: "custom" }
                                  ].map((pat) => (
                                    <button
                                      key={pat.value}
                                      type="button"
                                      onClick={() => updateStyle("bgImage", pat.value)}
                                      className={`p-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                        customStyles.bgImage === pat.value || (pat.value === "custom" && customStyles.bgImage && customStyles.bgImage.startsWith("http"))
                                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400" 
                                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                                      }`}
                                    >
                                      {pat.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {(customStyles.bgImage === "custom" || (customStyles.bgImage && customStyles.bgImage.startsWith("http"))) && (
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
                                    <div className="h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                                      <Loader2 className="animate-spin text-blue-500 w-5 h-5" />
                                    </div>
                                  ) : customStyles.bgImage && customStyles.bgImage.startsWith("http") ? (
                                    <div className="relative rounded-xl overflow-hidden border">
                                      <img src={customStyles.bgImage} className="w-full h-20 object-cover" alt="Custom BG" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                                        <Button type="button" variant="secondary" size="xs" onClick={() => document.getElementById("bg-image-uploader")?.click()}>Thay đổi hình ảnh</Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      onClick={() => document.getElementById("bg-image-uploader")?.click()}
                                      className="h-20 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group"
                                    >
                                      <Upload className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform mb-1" />
                                      <span className="text-[11px] font-semibold text-slate-500">Tải lên hình ảnh nền riêng</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div>
                                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Bộ lọc màu nền dốc bên dưới (Gradient Filter)</Label>
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
                          ) : (
                            <div className="space-y-4 pt-2">
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
                                  className={`p-1.5 text-xs font-bold rounded capitalize border transition-all cursor-pointer h-9 ${
                                    customStyles.alignment === align 
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
                                        className={`p-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-left ${
                                          customStyles.watermarkType === wType.value
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
                                      <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 font-bold">Độ đậm</Label>
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
                                <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 font-bold">Màu chữ nút</Label>
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
                        className={`w-full text-white py-6 px-6 md:px-8 rounded-xl shadow border-y border-[#ffde59]/25 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 ${
                          customStyles.alignment === "center" ? "text-center md:items-center" : 
                          customStyles.alignment === "right" ? "text-right md:flex-row-reverse" : "text-left"
                        }`}
                      >
                        {/* Intricate Gold Borders */}
                        <div className="absolute inset-x-0 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />

                        {/* Custom / Traditional Watermark */}
                        {customStyles.showStar !== false && (
                          <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 transition-all duration-300">
                            {renderBannerWatermark(customStyles)}
                          </div>
                        )}

                        <div className="z-10 flex flex-col gap-1 flex-1">
                          <span 
                            style={{ color: customStyles.titleColor || "#fbc02d" }}
                            className={`text-xs font-black tracking-widest uppercase flex items-center gap-1.5 drop-shadow-sm ${
                              customStyles.alignment === "center" ? "justify-center" : 
                              customStyles.alignment === "right" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>⭐</span> {form.watch("name") || "TIÊU ĐỀ KHẨU HIỆU TUYÊN TRUYỀN"}
                          </span>
                          <h3 
                            style={{ color: customStyles.textColor || "#fff7ed" }}
                            className="text-sm md:text-base font-black tracking-wide leading-snug uppercase drop-shadow"
                          >
                            &quot;{form.watch("description") || "Nội dung khẩu hiệu chi tiết, slogan hành động của cơ quan nhà nước."}&quot;
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
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh Banner
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  {isUploading ? (
                    <div className="aspect-[21/9] border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20"><Loader2 className="animate-spin text-blue-500" /></div>
                  ) : (previewUrl || form.getValues("imageUrl")) ? (
                    <div className="relative group rounded-xl overflow-hidden border shadow-inner">
                      <img
                        src={previewUrl || (form.getValues("imageUrl")?.startsWith('http') ? form.getValues("imageUrl") : `/api/v1/admin/media/download/${form.getValues("imageUrl")}`)}
                        className="w-full aspect-[21/9] object-cover"
                        alt="Banner"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Thay đổi</Button>
                        <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="aspect-[21/9] border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group">
                      <ImagePlus className="h-8 w-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[13px] font-semibold text-slate-500">Tải lên ảnh Banner</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-600" /> Cấu hình hiển thị
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  <FormField
                    control={form.control}
                    name="orderIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Thứ tự ưu tiên</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Kích hoạt</Label>
                          <p className="text-[10px] text-muted-foreground italic">Hiển thị trên trang chủ</p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" /> Lịch trình
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <FormField
                    control={form.control}
                    name="startAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Ngày bắt đầu</FormLabel>
                        <FormControl><Input type="date" className="bg-slate-50/50" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Ngày kết thúc</FormLabel>
                        <FormControl><Input type="date" className="bg-slate-50/50" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* High-Fidelity simulated Client Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Simulated Browser Title Bar */}
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span onClick={() => setIsPreviewModalOpen(false)} className="w-3 h-3 rounded-full bg-red-500 hover:scale-105 transition-transform cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="bg-slate-900/60 text-[10px] text-slate-400 font-mono px-3 py-1 rounded-md border border-slate-700/50 ml-4 flex items-center gap-1.5">
                  <span className="text-emerald-500">🔒</span> https://portal.daklak.gov.vn
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Chế độ xem trước: Cổng Dân Cư Client</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-7 w-7">
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
                      <h1 className="text-xs font-black tracking-tight uppercase text-red-600">ỦY BAN NHÂN DÂN TỈNH ĐẮK LẮK</h1>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">CỔNG THÔNG TIN ĐIỆN TỬ BAN NGHÀNH</p>
                    </div>
                  </div>
                  <nav className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-700 uppercase">
                    <span className="text-red-600">Trang chủ</span>
                    <span>Tin tức</span>
                    <span>Dịch vụ công</span>
                    <span>Liên hệ</span>
                  </nav>
                </div>
              </header>

              {/* Portal Body Container */}
              <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                
                {/* Hero / Portal Title Block */}
                <div className="text-center space-y-2 py-4">
                  <span className="text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                    Tin tức &amp; Sự kiện Nổi bật
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cổng thông tin Dân cư Quốc gia</h2>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    Kênh truyền thông chính thống cung cấp thông tin, hướng dẫn thủ tục hành chính công và các hoạt động tuyên truyền của cơ quan nhà nước.
                  </p>
                </div>

                {/* Simulated Custom Slogan Banner (The Subject!) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khẩu hiệu Tuyên truyền của bạn sẽ được hiển thị tại đây:</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-black uppercase">Live</span>
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
                      <span 
                        style={{ color: customStyles.titleColor || "#fbc02d" }}
                        className={`text-xs md:text-sm font-black tracking-widest uppercase flex items-center gap-2 drop-shadow-md ${
                          customStyles.alignment === "center" ? "justify-center" : 
                          customStyles.alignment === "right" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>⭐</span> {form.watch("name") || "TIÊU ĐỀ KHẨU HIỆU TUYÊN TRUYỀN"}
                      </span>
                      <h3 
                        style={{ color: customStyles.textColor || "#fff7ed" }}
                        className="text-base md:text-lg font-black tracking-wide leading-snug uppercase drop-shadow-md"
                      >
                        &quot;{form.watch("description") || "Nội dung khẩu hiệu chi tiết, slogan hành động của cơ quan nhà nước."}&quot;
                      </h3>
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
                <p className="font-bold text-slate-200">© 2026 Bản quyền thuộc về Ủy ban Nhân dân tỉnh Đắk Lắk</p>
                <p className="text-[11px] text-slate-500 mt-1">Đường Lê Duẩn, Thành phố Buôn Ma Thuột, Tỉnh Đắk Lắk</p>
              </footer>

            </div>

            {/* Footer control */}
            <div className="bg-slate-800 px-6 py-4 border-t border-slate-700/60 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsPreviewModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-600 border-none">
                Đóng xem trước
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  form.handleSubmit(onSubmit)();
                }} 
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Lưu cấu hình ngay
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
