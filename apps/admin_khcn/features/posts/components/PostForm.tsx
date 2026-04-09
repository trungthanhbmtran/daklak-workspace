"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Save, ArrowLeft, ImagePlus, Globe, Tag, Send, 
  Loader2, X, UploadCloud, Maximize2 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { useImageUpload } from "../hooks/useImageUpload";
import { postsApi } from "../api";
import { Category } from "../types";
import dynamic from "next/dynamic";

const LexicalEditorDynamic = dynamic(
  () => import("./editor/LexicalEditor").then((mod) => mod.LexicalEditor),
  { ssr: false, loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground">Đang khởi tạo trình soạn thảo...</div> }
);

// --- UTILITY: HÀM BIẾN TIẾNG VIỆT THÀNH SLUG ---
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

const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  slug: z.string().min(1, "Đường dẫn tĩnh không được để trống"),
  summary: z.string().max(300, "Tóm tắt không quá 300 ký tự").optional(),
  content: z.string().min(10, "Nội dung bài viết quá ngắn"), 
  categoryId: z.string().min(1, "Vui lòng chọn chuyên mục"),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "EDITING"]),
  thumbnailId: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export function PostForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const queryClient = useQueryClient();
  const [showFullImage, setShowFullImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "", slug: "", summary: "", content: "",
      categoryId: "", status: "DRAFT", thumbnailId: "",
    },
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return (res as any).data?.items || res.data || [];
    },
  });

  // Fetch Post if Edit
  const { data: postData, isLoading: isFetching } = useQuery({
    queryKey: ["post", editId],
    queryFn: () => postsApi.getPost(editId!).then(res => res.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (postData) {
      form.reset({
        title: postData.title,
        slug: postData.slug,
        summary: postData.summary || "",
        content: postData.content,
        categoryId: postData.categoryId,
        status: postData.status,
        thumbnailId: postData.thumbnailId || "",
      });
    }
  }, [postData, form]);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => form.setValue("thumbnailId", fileId, { shouldDirty: true }),
    onRemove: () => form.setValue("thumbnailId", "", { shouldDirty: true })
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    form.setValue("title", newTitle);
    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", convertToSlug(newTitle), { shouldValidate: true });
    }
  };

  const mutation = useMutation({
    mutationFn: (values: PostFormValues) => {
      if (isEdit) return postsApi.updatePost(editId!, values);
      return postsApi.createPost(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert(isEdit ? "Cập nhật bài viết thành công!" : "Tạo bài viết thành công!");
      onBack();
    },
    onError: (err: any) => {
      alert("Lỗi: " + (err.response?.data?.message || "Đã xảy ra lỗi hệ thống."));
    },
  });

  const handleOnSubmit = (values: PostFormValues) => mutation.mutate(values);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải dữ liệu bài viết...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-6 pb-10 relative">
        
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b">
          <Button type="button" variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
          <div className="flex items-center gap-3">
            <Button 
                type="button" 
                variant="outline" 
                disabled={mutation.isPending}
                onClick={() => {
                   form.setValue("status", "DRAFT");
                   form.handleSubmit(handleOnSubmit)();
                }}
            >
              <Save className="h-4 w-4 mr-2" /> Lưu nháp
            </Button>
            <Button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-700 shadow-md text-white" 
                disabled={mutation.isPending}
                onClick={() => {
                    if (form.getValues("status") === "DRAFT") {
                        form.setValue("status", "PENDING");
                    }
                    form.handleSubmit(handleOnSubmit)();
                }}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {isEdit ? "Cập nhật" : "Gửi duyệt bài"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm bg-muted/10">
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-5">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tiêu đề bài viết <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nhập tiêu đề..." 
                          className="text-lg font-semibold h-12 bg-background" 
                          {...field} 
                          onChange={handleTitleChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Đường dẫn tĩnh (Slug)</FormLabel>
                        <div className="flex items-center rounded-md border border-slate-200 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                          <span className="px-3 py-2 text-[13px] text-muted-foreground border-r bg-muted/30 font-mono select-none">
                            /
                          </span>
                          <FormControl>
                            <Input className="border-0 bg-transparent shadow-none font-mono text-sm h-9 focus-visible:ring-0" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Chuyên mục</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background h-10"><SelectValue placeholder="Chọn chuyên mục" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat: Category) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>

                  <FormField control={form.control} name="summary" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tóm tắt ngắn</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả ngắn gọn..." className="resize-none h-20 bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-3">
                  <Label className="font-bold">Nội dung chi tiết <span className="text-destructive">*</span></Label>
                  <Controller
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <LexicalEditorDynamic value={field.value} onChange={field.onChange} />
                    )}
                  />
                  {form.formState.errors.content && (
                    <p className="text-xs text-destructive font-medium">{form.formState.errors.content.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/10 border-b py-3 px-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

                {isUploading ? (
                  <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-[11px] mt-2 font-medium uppercase tracking-widest text-muted-foreground">Đang xử lý...</p>
                  </div>
                ) : (previewUrl || form.getValues("thumbnailId")) ? (
                  <div className="relative group rounded-lg overflow-hidden border">
                    <img src={previewUrl || `/api/v1/media/download/${form.getValues("thumbnailId")}`} alt="Thumbnail" className="aspect-video object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Button type="button" variant="secondary" size="icon" onClick={() => setShowFullImage(true)}><Maximize2 className="h-4 w-4" /></Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4 mr-2" /> Đổi</Button>
                      <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all">
                    <ImagePlus className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-[13px] font-semibold text-slate-500">Chọn ảnh tiêu đề</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/10 border-b py-3 px-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" /> Xuất bản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Lưu bản nháp</SelectItem>
                        <SelectItem value="PENDING">Chờ phê duyệt</SelectItem>
                        <SelectItem value="PUBLISHED">Công khai ngay</SelectItem>
                        <SelectItem value="EDITING">Yêu cầu chỉnh sửa</SelectItem>
                        <SelectItem value="REJECTED">Từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* LIGHTBOX MODAL */}
        {showFullImage && (previewUrl || form.getValues("thumbnailId")) && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-6xl w-full" onClick={e => e.stopPropagation()}>
               <img src={previewUrl || `/api/v1/media/download/${form.getValues("thumbnailId")}`} className="w-full h-auto max-h-[90vh] object-contain rounded-sm" />
               <Button type="button" variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full border-2 border-white shadow-2xl" onClick={() => setShowFullImage(false)}>
                 <X className="h-5 w-5" />
               </Button>
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
