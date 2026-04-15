// features/posts/components/CategoryForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Save, Loader2, Info, Layout, 
  Settings, ImagePlus, Trash2, ShieldCheck
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
import { categorySchema } from "../schemas";
import { postsApi } from "../api";
import { useImageUpload } from "../hooks/useImageUpload";

interface CategoryFormProps {
  onBack: () => void;
  editId?: string | null;
}

export function CategoryForm({ onBack, editId }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
      status: true,
      orderIndex: 0,
      isGovStandard: false,
      thumbnail: "",
    },
  });

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      form.setValue("thumbnail", fileId, { shouldValidate: true, shouldDirty: true });
    },
    onRemove: () => form.setValue("thumbnail", "", { shouldValidate: true, shouldDirty: true }),
  });

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

  // Fetch list of categories for parent selection
  const { data: categories } = useQuery({
    queryKey: ["categories_for_select"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      const payload = res?.data;
      const list = payload?.data || payload?.items || (Array.isArray(payload) ? payload : []);
      // Filter out self to prevent circular parent
      return list.filter((c: any) => c.id !== editId);
    },
  });

  // Fetch detailed data if editing
  const { data: categoryData, isLoading: isFetching } = useQuery({
    queryKey: ["category", editId],
    queryFn: async () => {
      const res = await postsApi.getCategory(editId!);
      return res?.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (categoryData) {
      form.reset({
        ...categoryData,
        name: categoryData.name || "",
        slug: categoryData.slug || "",
        description: categoryData.description || "",
        parentId: categoryData.parentId || null,
        isGovStandard: !!categoryData.isGovStandard,
        thumbnail: categoryData.thumbnail || "",
      });
    }
  }, [categoryData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      // Ensure parentId is null if "none" or empty string
      const payload = { ...values };
      if (payload.parentId === "none" || payload.parentId === "") {
        payload.parentId = null;
      }
      
      if (isEdit) return postsApi.updateCategory(editId!, payload);
      return postsApi.createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories_all"] });
      queryClient.invalidateQueries({ queryKey: ["categories_for_select"] });
      alert(isEdit ? "Cập nhật chuyên mục thành công!" : "Tạo chuyên mục thành công!");
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
        <span className="ml-3 text-muted-foreground">Đang tải dữ liệu chuyên mục...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa Chuyên mục" : "Thêm Chuyên mục mới"}</h2>
          <p className="text-muted-foreground">Thiết lập thông tin định danh và phân cấp cho chuyên mục.</p>
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
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Chuyên mục <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Tin tức, Sự kiện..." {...field} />
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
                          <Input placeholder="tin-tuc" {...field} />
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
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mô tả ngắn gọn về chuyên mục này..." 
                            className="min-h-[100px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 2. Hình ảnh & Đại diện (Optional) */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-primary" /> Hình ảnh đại diện
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            
                            {isUploading ? (
                              <div className="w-40 aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/20">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (previewUrl || field.value) ? (
                              <div className="relative group w-40 aspect-square rounded-lg overflow-hidden border shadow-sm">
                                <img 
                                  src={previewUrl || (field.value?.startsWith('http') ? field.value : `/api/v1/media/download/${field.value}`)} 
                                  alt="Thumb Preview" 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}><ImagePlus className="h-4 w-4" /></Button>
                                  <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={removeImage}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-40 aspect-square border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group"
                              >
                                <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                                <p className="mt-2 text-xs font-medium text-muted-foreground group-hover:text-primary text-center px-2">Tải ảnh lên</p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Ảnh đại diện cho chuyên mục (tùy chọn).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* 3. Cấu hình phân cấp & Hiển thị */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Cấu hình
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chuyên mục cha</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || "none"}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chuyên mục cha" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">--- Không có (Gốc) ---</SelectItem>
                            {categories?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>
                                {Array.from({ length: c.depth || 0 }).map(() => "— ")}
                                {c.name}
                              </SelectItem>
                            ))}
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
                          <FormLabel className="text-sm font-medium">Trạng thái</FormLabel>
                          <div className="text-[10px] text-muted-foreground">Hiển thị chuyên mục</div>
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

                  <FormField
                    control={form.control}
                    name="isGovStandard"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-blue-50/50 border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <FormLabel className="text-sm font-medium text-blue-900">Chuẩn NN</FormLabel>
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
                  {isEdit ? "Cập nhật" : "Tạo mới"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
