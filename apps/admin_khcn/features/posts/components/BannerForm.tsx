// features/posts/components/BannerForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Save, Loader2, ImagePlus,
  Trash2, Monitor, Globe, Info, ExternalLink
} from "lucide-react";
import { useEffect, useRef } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import imageCompression from "browser-image-compression";
import apiClient from "@/lib/axiosInstance";

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

export function BannerForm({ onBack, editId }: BannerFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      linkType: "internal" as const,
      customUrl: "",
      target: "_self",
      position: "top" as const,
      orderIndex: 0,
      status: true,
      startAt: "",
      endAt: "",
    },
  });  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Compress image
      const compressed = await imageCompression(file, { 
        maxSizeMB: 0.8, 
        maxWidthOrHeight: 1920, 
        fileType: 'image/webp' 
      });

      // 2. Request upload URL from Gateway -> Media Service
      const res: any = await apiClient.post("/media/request-upload", {
        originalName: file.name,
        mimeType: compressed.type,
        size: compressed.size,
      });

      const { uploadUrl, fileId } = res.data;

      // 3. Upload directly to storage (MinIO via Nginx Proxy)
      await axios.put(uploadUrl, compressed, { 
        headers: { "Content-Type": compressed.type } 
      });

      // 4. Confirm upload to Gateway -> Media Service
      const confirmRes: any = await apiClient.post("/media/confirm-upload", { fileId });
      
      // 5. Update form and preview
      setPreviewUrl(confirmRes.data.downloadUrl);
      form.setValue("imageUrl", fileId, { shouldValidate: true, shouldDirty: true });
      
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Lỗi tải ảnh: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    form.setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Slugify logic
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

  // Fetch detailed data if editing
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
      form.reset({
        ...bannerData,
        name: bannerData.name || "",
        slug: bannerData.slug || "",
        description: bannerData.description || "",
        imageUrl: bannerData.imageUrl || "",
        customUrl: bannerData.customUrl || "",
        startAt: bannerData.startAt ? new Date(bannerData.startAt).getUTCFullYear() > 1 ? new Date(bannerData.startAt).toISOString().split('T')[0] : "" : "",
        endAt: bannerData.endAt ? new Date(bannerData.endAt).getUTCFullYear() > 1 ? new Date(bannerData.endAt).toISOString().split('T')[0] : "" : "",
      });
    }
  }, [bannerData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (isEdit) return postsApi.updateBanner(editId!, values);
      return postsApi.createBanner(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      alert(isEdit ? "Cập nhật banner thành công!" : "Tạo banner thành công!");
      onBack();
    },
    onError: (err: any) => {
      alert("Lỗi: " + (err.response?.data?.message || "Đã xảy ra lỗi hệ thống."));
    },
  });

  const onSubmit = (values: any) => {
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h2>
          <p className="text-muted-foreground">Cấu hình thông tin hiển thị và liên kết banner cho cổng thông tin.</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Thông tin cơ bản */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" /> Thông tin cơ bản
                  </CardTitle>
                  <CardDescription>Các thông tin định danh và mô tả nội dung banner.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Banner <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Banner Chào mừng năm mới..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã định danh (Slug) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="banner-homepage-top" {...field} />
                        </FormControl>
                        <FormDescription>Đường dẫn tĩnh duy nhất, tự động tạo từ tên.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả / Ghi chú</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả ngắn gọn về mục đích hoặc vị trí sử dụng..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 pt-2">
                    <FormLabel className="flex items-center justify-between">
                      <span>Hình ảnh Banner <span className="text-destructive">*</span></span>
                      {(previewUrl || form.getValues("imageUrl")) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={removeImage}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Xóa ảnh
                        </Button>
                      )}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-4">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                              />

                              {isUploading ? (
                                <div className="aspect-[21/9] border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/20 animate-pulse">
                                  <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                                  <p className="text-xs mt-3 font-medium text-muted-foreground">Đang tải ảnh lên hệ thống...</p>
                                </div>
                              ) : (previewUrl || field.value) ? (
                                <div className="relative group rounded-xl overflow-hidden border-2 border-muted shadow-lg bg-black">
                                  <img
                                    src={previewUrl || (field.value?.startsWith('http') ? field.value : `/api/v1/admin/media/download/${field.value}`)}
                                    alt="Banner Preview"
                                    className="aspect-[21/9] object-cover w-full group-hover:opacity-80 transition-opacity duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6 gap-4">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      className="shadow-xl backdrop-blur-sm bg-white/90"
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <UploadCloud className="h-4 w-4 mr-2" /> Thay đổi ảnh
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="shadow-xl"
                                      onClick={removeImage}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className="aspect-[21/9] border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group shadow-sm"
                                >
                                  <div className="p-4 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300 shadow-inner">
                                    <ImagePlus className="h-10 w-10 text-muted-foreground/60 group-hover:text-primary/70" />
                                  </div>
                                  <div className="mt-4 text-center">
                                    <p className="font-semibold text-muted-foreground group-hover:text-primary/80">Kéo thả hoặc nhấp để tải ảnh</p>
                                    <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-wider font-medium">Hỗ trợ WEBP, PNG, JPG (Max 2MB)</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 3. Liên kết & Điều hướng */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-primary" /> Liên kết & Điều hướng
                  </CardTitle>
                  <CardDescription>Cấu hình hành động khi người dùng nhấp vào banner.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="linkType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại liên kết</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại liên kết" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="internal">Liên kết nội bộ (Trang con)</SelectItem>
                              <SelectItem value="external">Liên kết ngoài (URL tự do)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cách thức mở trang</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_self">Mở tại tab hiện tại</SelectItem>
                              <SelectItem value="_blank">Mở trong cửa sổ/tab mới</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đường dẫn liên kết (URL)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://..." className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>Để trống nếu banner không có liên kết.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* 2. Cấu hình hiển thị */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" /> Cấu hình hiển thị
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vị trí hiển thị</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vị trí" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="top">Phía trên (Header/Top)</SelectItem>
                            <SelectItem value="middle">Giữa trang (Body)</SelectItem>
                            <SelectItem value="bottom">Phía dưới (Footer)</SelectItem>
                            <SelectItem value="custom">Vị trí tùy chỉnh</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orderIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thứ tự hiển thị</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormDescription>Số càng nhỏ hiển thị càng ưu tiên.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/10 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Trạng thái</FormLabel>
                          <div className="text-xs text-muted-foreground">Kích hoạt hiển thị ngay lập tức</div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 4. Thời gian hiển thị */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> Lịch hiển thị
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="startAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Để trống để hiển thị vô thời hạn.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg shadow-md"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {isEdit ? "Cập nhật Banner" : "Xuất bản Banner"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
