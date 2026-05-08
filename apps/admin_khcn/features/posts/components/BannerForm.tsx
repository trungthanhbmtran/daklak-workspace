// features/posts/components/BannerForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Save, Loader2, ImagePlus,
  Trash2, Monitor, Globe, Info, ExternalLink,
  UploadCloud, X
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
      });
    }
  }, [bannerData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const payload = {
        ...values,
        translations: JSON.stringify(values.translations || {})
      };
      if (isEdit) return postsApi.updateBanner(editId!, payload);
      return postsApi.createBanner(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      onBack();
    },
  });

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
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
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
    </div>
  );
}
