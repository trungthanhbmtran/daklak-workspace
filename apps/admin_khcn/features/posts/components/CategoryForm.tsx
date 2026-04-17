"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, ImagePlus, Loader2, X, UploadCloud, Maximize2, FileText, Info, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { useImageUpload } from "../hooks/useImageUpload";
import { postsApi } from "../api";
import { categorySchema } from "../schemas";
import { Category } from "../types";

// Helper to convert text to slug
const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Extended schema for UI-specific needs if any, otherwise use imported
type CategoryFormValues = z.infer<typeof categorySchema> & {
  thumbnail?: string;
  metaTitle?: string;
  metaDescription?: string;
};

// We extend the base schema to include SEO fields which might not be in the base schema but are in the Category type
const extendedSchema = categorySchema.extend({
  thumbnail: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export function CategoryForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "", // Sử dụng chuỗi rỗng thay vì null để tương thích gRPC
      status: true,
      orderIndex: 0,
      isGovStandard: false,
      thumbnail: "",
      metaTitle: "",
      metaDescription: "",
      linkType: "standard",
      target: "_self",
    },
  });

  // Auto-slug generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newName = e.target.value;
    onChangeOriginal(newName);
    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", convertToSlug(newName), { shouldValidate: true });
    }
  };

  // Fetch all categories for parent selection
  const { data: allCategories } = useQuery({
    queryKey: ["all-categories-flat"],
    queryFn: async () => {
      const res = await postsApi.getCategories({ pageSize: 1000 });
      const items = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      // Filter out current category and its children if editing to prevent cycles
      // For simplicity, we just filter out the current ID. Nested set logic on backend will handle deeper cycles.
      return items.filter((cat: any) => cat.id !== editId);
    },
  });

  // Fetch current category data if editing
  const { data: categoryData, isLoading: isFetching } = useQuery({
    queryKey: ["category", editId],
    queryFn: async () => (await postsApi.getCategory(editId!))?.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (categoryData) {
      form.reset({
        ...categoryData,
        parentId: categoryData.parentId || ""
      });
    }
  }, [categoryData, form]);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => form.setValue("thumbnail", id, { shouldDirty: true }),
    onRemove: () => form.setValue("thumbnail", "", { shouldDirty: true })
  });

  const mutation = useMutation({
    mutationFn: (v: CategoryFormValues) => 
      isEdit ? postsApi.updateCategory(editId!, v) : postsApi.createCategory(v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onBack();
    },
    onError: (err: any) => {
      alert(`Lỗi: ${err?.response?.data?.message || err.message}`);
    }
  });

  if (isFetching) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="max-w-[1000px] mx-auto space-y-6 pb-20">
        
        {/* TOP ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{isEdit ? "Cập nhật chuyên mục" : "Thêm chuyên mục mới"}</h1>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Quản lý phân loại bài viết</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onBack} disabled={mutation.isPending}>Hủy</Button>
            <Button type="submit" className="bg-primary shadow-lg shadow-primary/20 min-w-[140px]" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? "Lưu thay đổi" : "Tạo chuyên mục"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase text-slate-700 tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Tên chuyên mục <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="VD: Tin tức sự kiện" 
                        className="bg-slate-50/50" 
                        {...field} 
                        onChange={(e) => handleNameChange(e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Đường dẫn tĩnh (Slug)</FormLabel>
                      <FormControl>
                        <Input className="font-mono text-xs bg-muted/30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="parentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Chuyên mục cha</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val === "root" ? "" : val)} 
                        value={field.value || "root"}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50">
                            <SelectValue placeholder="Chọn chuyên mục cha" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="root">-- Danh mục gốc --</SelectItem>
                          {allCategories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.depth > 0 ? "— ".repeat(cat.depth) : ""}{cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px]">Để trống nếu là danh mục cấp cao nhất.</FormDescription>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Nhập mô tả ngắn cho chuyên mục này..." 
                        className="min-h-[100px] bg-slate-50/50 resize-none" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )} />

              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase text-slate-700 tracking-tight flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" /> Tối ưu tìm kiếm (SEO)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <FormField control={form.control} name="metaTitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs">Tiêu đề SEO</FormLabel>
                    <FormControl><Input placeholder="Thẻ <title>..." className="bg-slate-50/50" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="metaDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs">Mô tả SEO</FormLabel>
                    <FormControl><Textarea placeholder="Thẻ <meta description>..." className="bg-slate-50/50 resize-none h-20" {...field} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <ImagePlus className="h-3.5 w-3.5 text-primary" /> Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {isUploading ? (
                  <div className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20">
                    <Loader2 className="animate-spin text-primary h-6 w-6" />
                  </div>
                ) : (previewUrl || form.getValues("thumbnail")) ? (
                  <div className="relative group rounded-xl overflow-hidden border shadow-inner aspect-square">
                    <img src={previewUrl || `/api/v1/media/download/${form.getValues("thumbnail")}`} className="w-full h-full object-cover" alt="Thumbnail" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <Button type="button" variant="secondary" size="icon" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4" /></Button>
                      <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group">
                    <ImagePlus className="h-8 w-8 text-slate-300 group-hover:text-primary/60 transition-colors" />
                    <span className="text-[11px] mt-2 font-medium text-slate-400 group-hover:text-primary/60">Upload Image</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-primary" /> Thiết lập hiển thị
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                
                <FormField control={form.control} name="orderIndex" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Thứ tự hiển thị</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                  </FormItem>
                )} />

                <Separator />

                <div className="space-y-4">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold cursor-pointer" htmlFor="s-mode">Hiển thị</Label>
                        <p className="text-[10px] text-muted-foreground">Công khai ngoài trang chủ</p>
                      </div>
                      <Switch id="s-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />

                  <FormField control={form.control} name="isGovStandard" render={({ field }) => (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold cursor-pointer" htmlFor="g-mode">Chuẩn nhà nước</Label>
                        <p className="text-[10px] text-muted-foreground">Theo danh mục của Bộ/Sở</p>
                      </div>
                      <Switch id="g-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
