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
import { useImageUpload } from "../hooks/useImageUpload";

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
  });

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      form.setValue("imageUrl", fileId);
    },
    onRemove: () => form.setValue("imageUrl", ""),
  });

  // Fetch detailed data if editing
  const { data: bannerData, isLoading: isFetching } = useQuery({
    queryKey: ["banner", editId],
    queryFn: async () => {
      const res = await postsApi.getBanner(editId!);
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
        startAt: bannerData.startAt ? new Date(bannerData.startAt).toISOString().split('T')[0] : "",
        endAt: bannerData.endAt ? new Date(bannerData.endAt).toISOString().split('T')[0] : "",
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Cột chính: 8/12 */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Nội dung Banner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Banner <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Banner Chào mừng năm mới 2026..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã định danh (Slug)</FormLabel>
                          <FormControl>
                            <Input placeholder="banner-homepage-top" {...field} />
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
                          <FormLabel>Vị trí hiển thị</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn vị trí" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="top">Phía trên (Top)</SelectItem>
                              <SelectItem value="middle">Giữa trang (Middle)</SelectItem>
                              <SelectItem value="bottom">Phía dưới (Bottom)</SelectItem>
                              <SelectItem value="custom">Tùy chỉnh (Custom)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú / Mô tả</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ghi chú về mục đích sử dụng banner..." className="h-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> Cấu hình Liên kết & Thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="linkType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại liên kết</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="internal">Link nội bộ (Internal)</SelectItem>
                              <SelectItem value="external">Link ngoài trang (External)</SelectItem>
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
                          <FormLabel>Mục tiêu (Target)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_self">Mở tại tab hiện tại</SelectItem>
                              <SelectItem value="_blank">Mở tab mới</SelectItem>
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
                        <FormLabel>Đường dẫn liên kết (URL)</FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-md border border-input bg-muted/20 overflow-hidden">
                            <span className="px-3 text-muted-foreground"><ExternalLink className="h-3 w-3" /></span>
                            <Input className="border-0 bg-transparent focus-visible:ring-0 text-sm h-10" placeholder="https://..." {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày bắt đầu hiển thị</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày kết thúc hiển thị</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cột phụ: 4/12 */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="bg-muted/10 border-b py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                    <ImagePlus className="h-4 w-4" /> Hình ảnh Banner
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

                  {isUploading ? (
                    <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-[10px] mt-2 text-muted-foreground uppercase font-bold tracking-tighter">Đang xử lý ảnh...</p>
                    </div>
                  ) : (previewUrl || form.getValues("imageUrl")) ? (
                    <div className="relative group rounded-lg overflow-hidden border">
                      <img src={previewUrl || form.getValues("imageUrl")} alt="Banner" className="aspect-video object-cover w-full" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Thay đổi</Button>
                        <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={removeImage}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all"
                    >
                      <ImagePlus className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-[12px] font-semibold text-muted-foreground">Nhấp để tải ảnh (21:9)</p>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => <FormMessage className="mt-2" />}
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="bg-muted/10 border-b py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                    <Monitor className="h-4 w-4" /> Hiển thị
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <FormField
                    control={form.control}
                    name="orderIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Thứ tự ưu tiên</FormLabel>
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                        <FormLabel className="text-xs cursor-pointer">Trạng thái hiển thị</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg h-11" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {isEdit ? "Cập nhật Banner" : "Xuất bản Banner"}
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-700 leading-relaxed">
                  <strong>Tip:</strong> Hãy sử dụng ảnh có kích thước chuẩn 1920x820px hoặc tỉ lệ 21:9 để banner hiển thị đẹp nhất trên mọi thiết bị.
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
