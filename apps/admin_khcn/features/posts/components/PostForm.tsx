"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, ArrowLeft, ImagePlus, Globe, Tag, Send,
  Loader2, X, UploadCloud, Maximize2, Star, Bell, LayoutDashboard, FileText
} from "lucide-react";

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
import { Category } from "../types";
import dynamic from "next/dynamic";

const LexicalEditorDynamic = dynamic(
  () => import("./editor/LexicalEditor").then((mod) => mod.LexicalEditor),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-xl border border-dashed flex items-center justify-center text-sm text-muted-foreground">Khởi tạo trình soạn thảo...</div>
  }
);

const convertToSlug = (text: string) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
};

const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề quá ngắn"),
  slug: z.string().min(1, "Slug không được để trống"),
  summary: z.string().max(300, "Tóm tắt tối đa 300 ký tự").optional(),
  content: z.string().min(10, "Nội dung quá ngắn"),
  categoryId: z.string().min(1, "Chọn chuyên mục"),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "EDITING"]),
  thumbnailId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  sendNotification: z.boolean().default(false),
});

type PostFormValues = z.infer<typeof postSchema>;

export function PostForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const queryClient = useQueryClient();
  const [showFullImage, setShowFullImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "", slug: "", summary: "", content: "",
      categoryId: "", status: "DRAFT", thumbnailId: "",
      tags: [], isFeatured: false, sendNotification: false,
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories({ pageSize: 100 });
      return res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
    },
  });

  const { data: postData, isLoading: isFetching } = useQuery({
    queryKey: ["post", editId],
    queryFn: async () => (await postsApi.getPost(editId!))?.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (postData) form.reset({ ...postData, sendNotification: false });
  }, [postData, form]);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => form.setValue("thumbnailId", id, { shouldDirty: true }),
    onRemove: () => form.setValue("thumbnailId", "", { shouldDirty: true })
  });

  const mutation = useMutation({
    mutationFn: (v: PostFormValues) => isEdit ? postsApi.updatePost(editId!, v) : postsApi.createPost(v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onBack();
    },
  });

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !form.getValues("tags").includes(val)) {
      form.setValue("tags", [...form.getValues("tags"), val]);
      setTagInput("");
    }
  };

  return (
    <Form {...form}>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20">

        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h1>
              <p className="text-xs text-muted-foreground">Quản lý nội dung và cấu hình xuất bản</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled={mutation.isPending} onClick={() => {
              form.setValue("status", "DRAFT");
              form.handleSubmit(v => mutation.mutate(v))();
            }}>
              Lưu nháp
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" disabled={mutation.isPending} onClick={() => {
              if (form.getValues("status") === "DRAFT") form.setValue("status", "PENDING");
              form.handleSubmit(v => mutation.mutate(v))();
            }}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isEdit ? "Cập nhật" : "Xuất bản"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5 text-blue-500" /> Nội dung chính
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Tiêu đề bài viết</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 10 Cách tối ưu React hiệu quả..."
                        className="text-lg py-6 focus-visible:ring-blue-500"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!form.formState.dirtyFields.slug) form.setValue("slug", convertToSlug(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Chuyên mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn chuyên mục" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories?.map((cat: Category) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Slug (URL)</FormLabel>
                      <FormControl><Input className="font-mono text-xs bg-muted/30" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="summary" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Tóm tắt ngắn gọn</FormLabel>
                    <FormControl><Textarea placeholder="Viết vài dòng giới thiệu thu hút..." className="min-h-[100px] resize-none" {...field} /></FormControl>
                    <FormDescription className="text-[11px]">Sẽ hiển thị ngoài danh sách bài viết.</FormDescription>
                  </FormItem>
                )} />

                <div className="pt-4 border-t">
                  <FormLabel className="text-sm font-medium mb-3 block">Nội dung chi tiết</FormLabel>
                  <Controller
                    control={form.control}
                    name="content"
                    render={({ field }) => <LexicalEditorDynamic value={field.value} onChange={field.onChange} />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: SIDEBAR CONFIG */}
          <div className="lg:col-span-4 space-y-6">

            {/* THUMBNAIL */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="py-3 px-5 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" /> Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {isUploading ? (
                  <div className="aspect-video border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20"><Loader2 className="animate-spin" /></div>
                ) : (previewUrl || form.getValues("thumbnailId")) ? (
                  <div className="relative group rounded-xl overflow-hidden border">
                    <img src={previewUrl || `/api/v1/media/download/${form.getValues("thumbnailId")}`} className="w-full aspect-video object-cover" alt="Thumbnail" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <Button type="button" variant="secondary" size="icon" onClick={() => setShowFullImage(true)}><Maximize2 className="h-4 w-4" /></Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4 mr-2" /> Thay đổi</Button>
                      <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer">
                    <ImagePlus className="h-8 w-8 text-slate-300 mb-2" />
                    <span className="text-xs font-medium text-slate-500">Tải lên ảnh bài viết</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* STATUS & PUBLISH */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="py-3 px-5 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Thiết lập xuất bản</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Trạng thái hiện tại</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Bản nháp</SelectItem>
                        <SelectItem value="PENDING">Chờ phê duyệt</SelectItem>
                        <SelectItem value="PUBLISHED">Công khai</SelectItem>
                        <SelectItem value="EDITING">Đang chỉnh sửa</SelectItem>
                        <SelectItem value="REJECTED">Từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <Separator className="opacity-60" />

                <div className="space-y-4">
                  <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="f-mode"><Star className="h-3 w-3" /> Bài viết nổi bật</Label>
                        <p className="text-[11px] text-muted-foreground">Hiển thị lên mục đặc biệt trang chủ</p>
                      </div>
                      <Switch id="f-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />

                  <FormField control={form.control} name="sendNotification" render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="n-mode"><Bell className="h-3 w-3" /> Gửi thông báo</Label>
                        <p className="text-[11px] text-muted-foreground">Thông báo đến người dùng app</p>
                      </div>
                      <Switch id="n-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* TAGS */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="py-3 px-5 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Nhãn gắn kèm</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="VD: React, Tech..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="h-9 focus-visible:ring-blue-500"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={addTag}>Thêm</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags").length > 0 ? form.watch("tags").map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => form.setValue("tags", form.getValues("tags").filter(t => t !== tag))} />
                    </Badge>
                  )) : <p className="text-[11px] text-muted-foreground italic">Chưa có tag nào...</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MODAL FULL IMAGE */}
        {showFullImage && (previewUrl || form.getValues("thumbnailId")) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm" onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              <img src={previewUrl || `/api/v1/media/download/${form.getValues("thumbnailId")}`} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" alt="Full" />
              <Button type="button" variant="ghost" size="icon" className="absolute -top-12 right-0 text-white hover:bg-white/10" onClick={() => setShowFullImage(false)}><X className="h-8 w-8" /></Button>
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}