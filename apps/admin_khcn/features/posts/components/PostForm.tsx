"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, ArrowLeft, ImagePlus, Globe, Tag, Send,
  Loader2, X, UploadCloud, Maximize2, Star, Bell, 
  FileText, AlertCircle, CheckCircle2, User, Link, 
  Languages, Calendar, Search, Layout, Settings, Info
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useImageUpload } from "../hooks/useImageUpload";
import { postsApi } from "../api";
import { Category } from "../types";
import { postSchema } from "../schemas";
import dynamic from "next/dynamic";

const LexicalEditorDynamic = dynamic(
  () => import("./editor/LexicalEditor").then((mod) => mod.LexicalEditor),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-xl border border-dashed flex items-center justify-center text-sm text-muted-foreground">Khởi tạo trình soạn thảo...</div>
  }
);

// --- HÀM BIẾN TIẾNG VIỆT THÀNH SLUG ---
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

type PostFormValues = any; // Will use inferred type from zod in a real scenario

export function PostForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const queryClient = useQueryClient();
  const [showFullImage, setShowFullImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: "", slug: "", description: "", content: "",
      categoryId: "", status: "DRAFT", thumbnail: "",
      tags: [], isFeatured: false, isNotification: false,
      authorName: "", source: "", language: "vi",
      seoTitle: "", seoDescription: "", seoKeywords: "",
      allowComment: true, publishedAt: "", expiredAt: ""
    },
  });

  // Chức năng tự tạo slug khi gõ tiêu đề
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newTitle = e.target.value;
    onChangeOriginal(newTitle);
    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", convertToSlug(newTitle), { shouldValidate: true });
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res.data;
    },
  });

  const { data: postData, isLoading: isFetching } = useQuery({
    queryKey: ["post", editId],
    queryFn: async () => await postsApi.getPost(editId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (postData) {
      form.reset({
        ...postData,
        description: postData.description || "",
        thumbnail: postData.thumbnail || "",
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        authorName: postData.authorName || "",
        source: postData.source || "",
        seoTitle: postData.seoTitle || "",
        seoDescription: postData.seoDescription || "",
        seoKeywords: postData.seoKeywords || "",
        language: postData.language || "vi",
        publishedAt: postData.publishedAt ? new Date(postData.publishedAt).toISOString().slice(0, 16) : "",
        expiredAt: postData.expiredAt ? new Date(postData.expiredAt).toISOString().slice(0, 16) : "",
      });
    }
  }, [postData, form]);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => form.setValue("thumbnail", id, { shouldDirty: true }),
    onRemove: () => form.setValue("thumbnail", "", { shouldDirty: true })
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

  if (isFetching) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" /></div>;

  return (
    <Form {...form}>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20 px-4">

        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-4 border-b">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-xl shadow-sm border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">{isEdit ? "Cập nhật bài viết" : "Khởi tạo bài viết"}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100">
                    Decree 42/2022 Compliant
                 </Badge>
                 {form.watch("status") && (
                   <Badge variant="outline" className="text-[10px] uppercase font-mono">
                     Status: {form.watch("status")}
                   </Badge>
                 )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" className="text-slate-500 font-medium" disabled={mutation.isPending} onClick={() => {
              form.setValue("status", "DRAFT");
              form.handleSubmit((v) => mutation.mutate(v))();
            }}>
              Lưu bản nháp
            </Button>

            {(!isEdit || form.watch("status") === "DRAFT" || form.watch("status") === "REJECTED") && (
              <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-500/20 rounded-xl" disabled={mutation.isPending} onClick={() => {
                form.setValue("status", "SUBMITTED");
                form.handleSubmit((v) => mutation.mutate(v))();
              }}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Gửi phê duyệt
              </Button>
            )}

            {isEdit && (form.watch("status") !== "DRAFT" && form.watch("status") !== "REJECTED") && (
              <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-lg shadow-emerald-500/20 rounded-xl" disabled={mutation.isPending} onClick={() => {
                form.handleSubmit((v) => mutation.mutate(v))();
              }}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lưu thay đổi
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: CONTENT CARD */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-xl h-12">
                <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Nội dung chính
                </TabsTrigger>
                <TabsTrigger value="metadata" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <Info className="h-4 w-4" /> Thông tin bổ trợ
                </TabsTrigger>
                <TabsTrigger value="seo" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <Search className="h-4 w-4" /> Cấu hình SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-0 border-none outline-none ring-0">
                <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700">
                      <Layout className="h-4 w-4 text-blue-600" /> Biên tập nội dung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Tiêu đề bài viết <span className="text-rose-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tiêu đề chính xác và thu hút..."
                            className="text-lg py-6 focus-visible:ring-blue-500/20 border-slate-200 bg-slate-50/30 font-bold"
                            {...field}
                            onChange={(e) => handleTitleChange(e, field.onChange)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="categoryId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Chuyên mục</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-slate-50/30 border-slate-200 h-10"><SelectValue placeholder="Chọn chuyên mục" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {categories?.map((cat: Category) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField name="slug" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Đường dẫn tĩnh (Slug)</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-mono group-focus-within:text-blue-500 transition-colors">/</span>
                              <Input className="font-mono text-xs bg-slate-100/50 border-slate-200 pl-6 h-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Tóm tắt nội dung</FormLabel>
                        <FormControl><Textarea placeholder="Viết một đoạn tóm tắt ngắn về bài viết (SEO Description)..." className="min-h-[100px] resize-none bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                        <FormDescription className="text-[11px] text-slate-500">Tối ưu trong khoảng 150-160 ký tự để hiển thị tốt nhất trên Google.</FormDescription>
                      </FormItem>
                    )} />

                    <div className="pt-4 border-t border-slate-100">
                      <FormLabel className="font-bold text-slate-700 mb-3 block">Nội dung chi tiết bài viết</FormLabel>
                      <Controller
                        control={form.control}
                        name="content"
                        render={({ field }) => <LexicalEditorDynamic value={field.value} onChange={field.onChange} />}
                      />
                      {form.formState.errors.content && <p className="text-xs text-rose-500 font-medium mt-2">{form.formState.errors.content.message}</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-6 mt-0">
                <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                   <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700">
                      <User className="h-4 w-4 text-blue-600" /> Nguồn tin & Bản quyền
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="authorName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Tên tác giả / Bút danh</FormLabel>
                          <FormControl><Input placeholder="VD: Nguyễn Văn A..." className="bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                          <FormDescription className="text-[10px]">Hiển thị trực tiếp trên bài viết.</FormDescription>
                        </FormItem>
                      )} />
                      <FormField name="source" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">Nguồn trích dẫn</FormLabel>
                          <FormControl><Input placeholder="VD: Báo Chính phủ, Cổng TTĐT..." className="bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <Separator className="bg-slate-100" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="language" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700 flex items-center gap-2"><Languages className="h-3.5 w-3.5" /> Ngôn ngữ hiển thị</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-slate-50/30 border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="vi">Tiếng Việt</SelectItem>
                              <SelectItem value="en">English (Tiếng Anh)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      
                      <FormField name="allowComment" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-xl bg-slate-50/50 border-slate-200 mt-6">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-bold text-slate-700">Cho phép bình luận</FormLabel>
                            <FormDescription className="text-[10px]">Người dùng có thể gửi ý kiến phản hồi.</FormDescription>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <Separator className="bg-slate-100" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="publishedAt" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Hẹn giờ xuất bản</FormLabel>
                          <FormControl><Input type="datetime-local" className="bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                          <FormDescription className="text-[10px]">Để trống nếu muốn xuất bản ngay sau khi duyệt.</FormDescription>
                        </FormItem>
                      )} />
                      <FormField name="expiredAt" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700 flex items-center gap-2 text-rose-600"><Calendar className="h-3.5 w-3.5" /> Ngày hết hạn bài viết</FormLabel>
                          <FormControl><Input type="datetime-local" className="bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                          <FormDescription className="text-[10px]">Bài viết sẽ tự động gỡ sau thời gian này.</FormDescription>
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6 mt-0">
                <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                   <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700">
                      <Search className="h-4 w-4 text-blue-600" /> Tối ưu công cụ tìm kiếm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField name="seoTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Meta Title (Tiêu đề SEO)</FormLabel>
                        <FormControl><Input placeholder="Thường giống tiêu đề bài viết..." className="bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField name="seoKeywords" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Meta Keywords</FormLabel>
                        <FormControl><Input placeholder="Cách nhau bằng dấu phẩy..." className="bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                        <FormDescription className="text-[10px]">Các từ khóa chính liên quan đến bài viết.</FormDescription>
                      </FormItem>
                    )} />

                    <FormField name="seoDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Meta Description</FormLabel>
                        <FormControl><Textarea placeholder="Đoạn mô tả hiển thị trên Google Search..." className="min-h-[120px] resize-none bg-slate-50/30 border-slate-200" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            {/* THUMBNAIL CARD */}
            <Card className="shadow-sm overflow-hidden border-slate-200/60">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600"><ImagePlus className="h-3.5 w-3.5 text-blue-600" /> Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {isUploading ? (
                  <div className="aspect-video border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20 border-blue-200"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (previewUrl || form.getValues("thumbnail")) ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-inner ring-1 ring-black/5">
                    <img src={previewUrl || `/api/v1/admin/media/download/${form.getValues("thumbnail")}`} className="w-full aspect-video object-cover" alt="Thumbnail" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <Button type="button" variant="secondary" size="icon" className="rounded-full h-9 w-9" onClick={() => setShowFullImage(true)}><Maximize2 className="h-4 w-4" /></Button>
                      <Button type="button" variant="secondary" size="sm" className="rounded-lg h-9" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4 mr-2" /> Thay đổi</Button>
                      <Button type="button" variant="destructive" size="icon" className="rounded-full h-9 w-9" onClick={removeImage}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group bg-slate-50/30">
                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-2 border border-slate-100">
                      <ImagePlus className="h-6 w-6 text-slate-400" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-500">Tải lên ảnh bài viết</span>
                    <span className="text-[10px] text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* STATUS & FLAGS CARD */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600"><Settings className="h-3.5 w-3.5 text-blue-600" /> Thiết lập hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="space-y-4">
                  <FormField name="isFeatured" render={({ field }) => (
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold flex items-center gap-2 cursor-pointer text-slate-700" htmlFor="f-mode">
                          <Star className={`h-3.5 w-3.5 ${field.value ? 'fill-yellow-400 text-yellow-500' : 'text-slate-400'}`} /> Tin tiêu điểm
                        </Label>
                        <p className="text-[10px] text-muted-foreground">Hiển thị nổi bật tại trang chủ.</p>
                      </div>
                      <Switch id="f-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />

                  <FormField name="isNotification" render={({ field }) => (
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold flex items-center gap-2 cursor-pointer text-slate-700" htmlFor="n-mode">
                          <Bell className={`h-3.5 w-3.5 ${field.value ? 'fill-blue-400 text-blue-500' : 'text-slate-400'}`} /> Gửi thông báo
                        </Label>
                        <p className="text-[10px] text-muted-foreground">Thông báo cho người dùng.</p>
                      </div>
                      <Switch id="n-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />
                </div>

                <Separator className="bg-slate-100" />

                <FormField name="tags" render={() => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-2"><Tag className="h-3 w-3" /> Từ khóa (Tags)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="h-9 focus-visible:ring-blue-500/20 bg-slate-50/50 border-slate-200"
                      />
                      <Button type="button" size="sm" variant="secondary" className="h-9 rounded-lg px-4" onClick={addTag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-lg border border-dashed border-slate-200">
                      {form.watch("tags").length > 0 ? form.watch("tags").map((tag) => (
                        <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium text-[10px]">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => form.setValue("tags", form.getValues("tags").filter(t => t !== tag))} />
                        </Badge>
                      )) : <p className="text-[10px] text-slate-400 italic text-center w-full my-auto">Chưa có nhãn gắn</p>}
                    </div>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* QUICK HELP CARD */}
            <Card className="bg-blue-600 border-none shadow-blue-500/20 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FileText className="h-24 w-24 text-white" />
               </div>
               <CardContent className="p-6 relative z-10">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" /> Lưu ý biên tập
                  </h4>
                  <ul className="mt-3 space-y-2">
                    <li className="text-[11px] text-blue-50/80 flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-300 mt-1 shrink-0" />
                      Sử dụng thẻ H2, H3 để cấu trúc bài viết chuẩn SEO.
                    </li>
                    <li className="text-[11px] text-blue-50/80 flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-300 mt-1 shrink-0" />
                      Đảm bảo thông tin tác giả và nguồn trích dẫn theo đúng Nghị định 42.
                    </li>
                    <li className="text-[11px] text-blue-50/80 flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-300 mt-1 shrink-0" />
                      Kiểm tra kỹ Slug trước khi gửi phê duyệt.
                    </li>
                  </ul>
               </CardContent>
            </Card>
          </div>
        </div>

        {/* MODAL FULL IMAGE */}
        {showFullImage && (previewUrl || form.getValues("thumbnail")) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-6 backdrop-blur-md" onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-5xl w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <img src={previewUrl || `/api/v1/admin/media/download/${form.getValues("thumbnail")}`} className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl" alt="Full Preview" />
              <Button type="button" variant="ghost" size="icon" className="absolute -top-14 right-0 text-white hover:bg-white/10 rounded-full h-10 w-10" onClick={() => setShowFullImage(false)}><X className="h-6 w-6" /></Button>
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}