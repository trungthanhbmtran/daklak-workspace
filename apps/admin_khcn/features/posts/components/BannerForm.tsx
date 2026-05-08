// features/posts/components/BannerForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Save, Loader2, ImagePlus,
  Trash2, Monitor, Globe, Info, ExternalLink,
  UploadCloud, X, Eye
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
  titleColor: "#fbc02d",
  textColor: "#fff7ed",
  alignment: "left",
  showStar: true,
  starColor: "#ffff00",
  starOpacity: 0.08,
  buttonBg: "#ffde59",
  buttonTextColor: "#0f172a",
  buttonText: "Tìm hiểu thêm"
};

const PRESETS = [
  {
    name: "Cờ đỏ Sao vàng",
    bgGradientStart: "#990000",
    bgGradientMiddle: "#cc0000",
    bgGradientEnd: "#800000",
    titleColor: "#fbc02d",
    textColor: "#fff7ed",
    starColor: "#ffff00",
    starOpacity: 0.08,
    buttonBg: "#ffde59",
    buttonTextColor: "#0f172a",
    alignment: "left"
  },
  {
    name: "Hồng sen Tươi sáng",
    bgGradientStart: "#b0124a",
    bgGradientMiddle: "#db2777",
    bgGradientEnd: "#9d174d",
    titleColor: "#fdf2f8",
    textColor: "#fce7f3",
    starColor: "#ffffff",
    starOpacity: 0.05,
    buttonBg: "#ffffff",
    buttonTextColor: "#be185d",
    alignment: "center"
  },
  {
    name: "Đại dương Sâu thẳm",
    bgGradientStart: "#1e3a8a",
    bgGradientMiddle: "#2563eb",
    bgGradientEnd: "#172554",
    titleColor: "#60a5fa",
    textColor: "#dbeafe",
    starColor: "#60a5fa",
    starOpacity: 0.08,
    buttonBg: "#3b82f6",
    buttonTextColor: "#ffffff",
    alignment: "left"
  },
  {
    name: "Xanh ngọc Vinh quang",
    bgGradientStart: "#064e3b",
    bgGradientMiddle: "#059669",
    bgGradientEnd: "#022c22",
    titleColor: "#a7f3d0",
    textColor: "#ecfdf5",
    starColor: "#34d399",
    starOpacity: 0.06,
    buttonBg: "#10b981",
    buttonTextColor: "#ffffff",
    alignment: "left"
  },
  {
    name: "Ánh kim Hoàng triều",
    bgGradientStart: "#78350f",
    bgGradientMiddle: "#d97706",
    bgGradientEnd: "#451a03",
    titleColor: "#fef3c7",
    textColor: "#fffbeb",
    starColor: "#fbbf24",
    starOpacity: 0.1,
    buttonBg: "#fbbf24",
    buttonTextColor: "#78350f",
    alignment: "center"
  }
];

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
                      Thay đổi màu sắc chữ, màu nền, căn lề và ngôi sao cổ động theo ý muốn.
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Background Style */}
                      <div className="space-y-4 md:border-r md:pr-4 border-slate-100 dark:border-slate-800">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Màu nền Banner (Background)</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu bắt đầu (Start)</Label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="color" 
                                value={customStyles.bgGradientStart || "#990000"} 
                                onChange={(e) => updateStyle("bgGradientStart", e.target.value)}
                                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer shrink-0"
                              />
                              <Input 
                                type="text" 
                                value={customStyles.bgGradientStart || "#990000"} 
                                onChange={(e) => updateStyle("bgGradientStart", e.target.value)}
                                className="font-mono text-xs uppercase"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu giữa (Middle)</Label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="color" 
                                value={customStyles.bgGradientMiddle || "#cc0000"} 
                                onChange={(e) => updateStyle("bgGradientMiddle", e.target.value)}
                                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer shrink-0"
                              />
                              <Input 
                                type="text" 
                                value={customStyles.bgGradientMiddle || "#cc0000"} 
                                onChange={(e) => updateStyle("bgGradientMiddle", e.target.value)}
                                className="font-mono text-xs uppercase"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu kết thúc (End)</Label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="color" 
                                value={customStyles.bgGradientEnd || "#800000"} 
                                onChange={(e) => updateStyle("bgGradientEnd", e.target.value)}
                                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer shrink-0"
                              />
                              <Input 
                                type="text" 
                                value={customStyles.bgGradientEnd || "#800000"} 
                                onChange={(e) => updateStyle("bgGradientEnd", e.target.value)}
                                className="font-mono text-xs uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Text & Button Style */}
                      <div className="space-y-4 md:border-r md:pr-4 border-slate-100 dark:border-slate-800">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Chữ & Căn lề (Typography)</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu khẩu hiệu nhỏ</Label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="color" 
                                value={customStyles.titleColor || "#fbc02d"} 
                                onChange={(e) => updateStyle("titleColor", e.target.value)}
                                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer shrink-0"
                              />
                              <Input 
                                type="text" 
                                value={customStyles.titleColor || "#fbc02d"} 
                                onChange={(e) => updateStyle("titleColor", e.target.value)}
                                className="font-mono text-xs uppercase"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu chữ chính (Slogan)</Label>
                            <div className="flex gap-2 mt-1">
                              <Input 
                                type="color" 
                                value={customStyles.textColor || "#fff7ed"} 
                                onChange={(e) => updateStyle("textColor", e.target.value)}
                                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer shrink-0"
                              />
                              <Input 
                                type="text" 
                                value={customStyles.textColor || "#fff7ed"} 
                                onChange={(e) => updateStyle("textColor", e.target.value)}
                                className="font-mono text-xs uppercase"
                              />
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
                                  className={`p-1.5 text-xs font-bold rounded capitalize border transition-all ${
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
                      </div>

                      {/* Watermark & Button Style */}
                      <div className="space-y-4">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ngôi sao & Nút bấm</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">Hiện sao chìm</Label>
                            <Switch 
                              checked={customStyles.showStar !== false} 
                              onCheckedChange={(checked) => updateStyle("showStar", checked)} 
                            />
                          </div>
                          {customStyles.showStar !== false && (
                            <>
                              <div>
                                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Màu ngôi sao</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input 
                                    type="color" 
                                    value={customStyles.starColor || "#ffff00"} 
                                    onChange={(e) => updateStyle("starColor", e.target.value)}
                                    className="w-10 h-10 p-0 border-none rounded-md cursor-pointer shrink-0"
                                  />
                                  <Input 
                                    type="text" 
                                    value={customStyles.starColor || "#ffff00"} 
                                    onChange={(e) => updateStyle("starColor", e.target.value)}
                                    className="font-mono text-xs uppercase"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Độ đậm nhạt sao</Label>
                                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">{Math.round((customStyles.starOpacity || 0.08) * 100)}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="0.3" 
                                  step="0.01" 
                                  value={customStyles.starOpacity || 0.08}
                                  onChange={(e) => updateStyle("starOpacity", parseFloat(e.target.value))}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700 mt-2"
                                />
                              </div>
                            </>
                          )}
                          <div>
                            <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Chữ trên nút bấm</Label>
                            <Input 
                              type="text" 
                              value={customStyles.buttonText || "Tìm hiểu thêm"} 
                              onChange={(e) => updateStyle("buttonText", e.target.value)}
                              className="text-xs py-1 mt-1"
                              placeholder="Tìm hiểu thêm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Nền nút</Label>
                              <div className="flex gap-1 mt-0.5">
                                <Input 
                                  type="color" 
                                  value={customStyles.buttonBg || "#ffde59"} 
                                  onChange={(e) => updateStyle("buttonBg", e.target.value)}
                                  className="w-6 h-6 p-0 border-none rounded-md cursor-pointer shrink-0"
                                />
                                <span className="text-[9px] font-mono self-center uppercase">{customStyles.buttonBg || "#ffde"}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Chữ nút</Label>
                              <div className="flex gap-1 mt-0.5">
                                <Input 
                                  type="color" 
                                  value={customStyles.buttonTextColor || "#0f172a"} 
                                  onChange={(e) => updateStyle("buttonTextColor", e.target.value)}
                                  className="w-6 h-6 p-0 border-none rounded-md cursor-pointer shrink-0"
                                />
                                <span className="text-[9px] font-mono self-center uppercase">{customStyles.buttonTextColor || "#0f17"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Live Slogan Preview */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô phỏng hiển thị thực tế trên Cổng thông tin (Realtime Preview)</Label>
                      <div 
                        style={{
                          background: `linear-gradient(to right, ${customStyles.bgGradientStart || "#990000"}, ${customStyles.bgGradientMiddle || customStyles.bgGradientStart || "#cc0000"}, ${customStyles.bgGradientEnd || "#800000"})`
                        }}
                        className={`w-full text-white py-6 px-6 md:px-8 rounded-xl shadow border-y border-[#ffde59]/25 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 ${
                          customStyles.alignment === "center" ? "text-center md:items-center" : 
                          customStyles.alignment === "right" ? "text-right md:flex-row-reverse" : "text-left"
                        }`}
                      >
                        {/* Intricate Gold Borders */}
                        <div className="absolute inset-x-0 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />

                        {/* Traditional Gold Star Watermark */}
                        {customStyles.showStar !== false && (
                          <div 
                            className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 transition-all duration-300"
                            style={{ opacity: customStyles.starOpacity || 0.08 }}
                          >
                            <svg className="w-48 h-48" style={{ color: customStyles.starColor || "#ffff00" }} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                            </svg>
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
                    style={{
                      background: `linear-gradient(to right, ${customStyles.bgGradientStart || "#990000"}, ${customStyles.bgGradientMiddle || customStyles.bgGradientStart || "#cc0000"}, ${customStyles.bgGradientEnd || "#800000"})`
                    }}
                    className={`w-full text-white py-8 px-8 md:px-10 rounded-2xl shadow-xl border-y border-[#ffde59]/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300 ${
                      customStyles.alignment === "center" ? "text-center md:items-center" : 
                      customStyles.alignment === "right" ? "text-right md:flex-row-reverse" : "text-left"
                    }`}
                  >
                    {/* Intricate Gold Borders */}
                    <div className="absolute inset-x-0 top-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffde59]/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffde59]/60 to-transparent" />

                    {/* Traditional Gold Star Watermark */}
                    {customStyles.showStar !== false && (
                      <div 
                        className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 scale-125"
                        style={{ opacity: customStyles.starOpacity || 0.08 }}
                      >
                        <svg className="w-56 h-56" style={{ color: customStyles.starColor || "#ffff00" }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                        </svg>
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
