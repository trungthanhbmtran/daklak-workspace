"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, ArrowLeft, ImagePlus, Globe, Tag, Send,
  Loader2, X, UploadCloud, Maximize2, Star, Bell, FileText, AlertCircle, CheckCircle2, Sparkles
} from "lucide-react";
import { toast } from "sonner";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryApi } from "@/features/system-admin/categories/api";

import { useImageUpload } from "../hooks/useImageUpload";
import { postsApi } from "../api";
import { Category, Post } from "../types";
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

const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề quá ngắn"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().max(300, "Tóm tắt tối đa 300 ký tự").optional(),
  content: z.string().min(10, "Nội dung quá ngắn"),
  categoryId: z.string().min(1, "Chọn chuyên mục"),
  status: z.enum([
    "DRAFT", "SUBMITTED", "UNDER_REVIEW", "REJECTED",
    "APPROVED", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"
  ]),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNotification: z.boolean().default(false),
  translations: z.record(z.string(), z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
  })).default({}),
});

type PostFormValues = z.infer<typeof postSchema>;

export function PostForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const queryClient = useQueryClient();
  const [showFullImage, setShowFullImage] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      categoryId: "",
      status: "DRAFT",
      thumbnail: "",
      tags: [],
      isFeatured: false,
      isNotification: false,
      translations: {},
    },
  });

  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});

  const handleAutoTranslate = async (langCode: string) => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    const content = form.getValues("content");

    if (!title) {
      toast.error("Vui lòng nhập tiêu đề tiếng Việt trước khi dịch");
      return;
    }

    setIsTranslating(prev => ({ ...prev, [langCode]: true }));
    try {
      // 1. Dịch Tiêu đề
      const resTitle = await postsApi.translate(title, langCode);
      const translatedTitle = resTitle.translated_text;
      form.setValue(`translations.${langCode}.title`, translatedTitle, { shouldDirty: true });

      // 2. Tạo Slug từ Tiêu đề đã dịch (Cực kỳ quan trọng cho SEO)
      const translatedSlug = convertToSlug(translatedTitle);
      form.setValue(`translations.${langCode}.slug`, translatedSlug, { shouldDirty: true });

      // 3. Dịch Tóm tắt
      if (description) {
        const resDesc = await postsApi.translate(description, langCode);
        form.setValue(`translations.${langCode}.description`, resDesc.translated_text, { shouldDirty: true });
      }

      // 4. Dịch Nội dung
      if (content) {
        const resContent = await postsApi.translate(content, langCode);
        form.setValue(`translations.${langCode}.content`, resContent.translated_text, { shouldDirty: true });
      }

      toast.success(`Đã dịch xong sang ${languages.find(l => l.code === langCode)?.name}`);
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Lỗi khi dịch tự động");
    } finally {
      setIsTranslating(prev => ({ ...prev, [langCode]: false }));
    }
  };

  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const all = await categoryApi.fetchAll();
        const langs = all.filter((c: any) => c.group === 'LANGUAGE' && c.active === 1);
        setLanguages(langs);

        // Đảm bảo translations object có đầy đủ keys cho các ngôn ngữ
        const currentTranslations = form.getValues("translations") || {};
        const newTranslations = { ...currentTranslations };
        let hasNew = false;
        langs.forEach(l => {
          if (l.code !== 'vi' && !newTranslations[l.code]) {
            newTranslations[l.code] = { title: "", description: "", content: "" };
            hasNew = true;
          }
        });
        if (hasNew) {
          form.setValue("translations", newTranslations);
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newTitle = e.target.value;
    onChangeOriginal(newTitle);
    
    const slugName = activeLangTab === 'vi' ? "slug" : `translations.${activeLangTab}.slug` as any;
    
    // Chỉ tự động cập nhật slug nếu trường slug chưa bị người dùng sửa tay (dirty)
    const isSlugDirty = activeLangTab === 'vi' 
      ? form.formState.dirtyFields.slug 
      : (form.formState.dirtyFields as any).translations?.[activeLangTab]?.slug;

    if (!isSlugDirty) {
      form.setValue(slugName, convertToSlug(newTitle), { shouldValidate: true, shouldDirty: true });
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res.data;
    },
  });

  const { data: postData, isLoading: isFetching } = useQuery<Post>({
    queryKey: ["post", editId],
    queryFn: async () => await postsApi.getPost(editId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (postData && languages.length > 0) {
      let parsedTranslations = postData.translations || {};
      if (typeof parsedTranslations === 'string') {
        try {
          parsedTranslations = JSON.parse(parsedTranslations);
        } catch (e) {
          parsedTranslations = {};
        }
      }

      // Đảm bảo mọi ngôn ngữ đều có key trong object để Form không bị lỗi
      const fullTranslations = { ...parsedTranslations };
      languages.forEach(lang => {
        if (lang.code !== 'vi' && !fullTranslations[lang.code]) {
          fullTranslations[lang.code] = { title: "", description: "", content: "" };
        }
      });

      form.reset({
        title: postData.title,
        slug: postData.slug,
        description: postData.description || "",
        content: postData.content,
        categoryId: postData.categoryId || "",
        status: postData.status as any,
        thumbnail: postData.thumbnail || "",
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        isFeatured: postData.isFeatured || false,
        isNotification: postData.isNotification || false,
        translations: fullTranslations,
      });
    }
  }, [postData, languages, form]);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => form.setValue("thumbnail", id, { shouldDirty: true }),
    onRemove: () => form.setValue("thumbnail", "", { shouldDirty: true })
  });

  const mutation = useMutation({
    mutationFn: (v: PostFormValues) => {
      const payload = {
        ...v,
        translations: JSON.stringify(v.translations || {})
      };
      return isEdit && editId ? postsApi.updatePost(editId, payload) : postsApi.createPost(payload);
    },
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

  const onSubmit = (values: PostFormValues) => {
    mutation.mutate(values);
  };

  if (isFetching) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[1400px] mx-auto space-y-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa nội dung" : "Tạo bài viết mới"}</h1>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Bản thảo nội dung & cấu hình</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() => {
                form.setValue("status", "DRAFT");
                void form.handleSubmit(onSubmit)();
              }}
            >
              Lưu nháp
            </Button>

            {(!isEdit || form.watch("status") === "DRAFT" || form.watch("status") === "REJECTED") && (
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-500/20"
                disabled={mutation.isPending}
                onClick={() => {
                  form.setValue("status", "SUBMITTED");
                  void form.handleSubmit(onSubmit)();
                }}
              >
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isEdit ? "Gửi lại phê duyệt" : "Gửi phê duyệt"}
              </Button>
            )}

            {isEdit && (form.watch("status") !== "DRAFT" && form.watch("status") !== "REJECTED") && (
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-lg shadow-emerald-500/20"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lưu bài viết
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-slate-700 tracking-tight">
                  <FileText className="h-5 w-5 text-blue-500" /> Thông tin bài viết
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                {postData?.autoModerationStatus && (
                  <div className={`p-4 rounded-xl border flex items-start gap-4 mb-2 ${postData.autoModerationStatus === 'SAFE'
                    ? 'bg-green-50 border-green-100 text-green-800'
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                    {postData.autoModerationStatus === 'SAFE' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">Kiểm duyệt tự động: {postData.autoModerationStatus === 'SAFE' ? 'Hợp lệ' : 'Cảnh báo'}</p>
                      <p className="text-xs mt-1 opacity-90">{postData.autoModerationNote}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" /> Chuyên mục bài viết
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-slate-200 h-11">
                            <SelectValue placeholder="Chọn chuyên mục chính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat: Category) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

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

                  <div key={activeLangTab} className="space-y-6 animate-in fade-in-50 duration-300">
                    {activeLangTab !== 'vi' && (
                      <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 mb-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Globe className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-900">Phiên bản dịch: {languages.find(l => l.code === activeLangTab)?.name}</p>
                            <p className="text-xs text-blue-700/70 italic text-[11px]">Nhập nội dung tương ứng cho ngôn ngữ này</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 gap-2 shadow-sm"
                          onClick={() => handleAutoTranslate(activeLangTab)}
                          disabled={isTranslating[activeLangTab]}
                        >
                          {isTranslating[activeLangTab] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          Dịch tự động (AI)
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField 
                        control={form.control} 
                        name={activeLangTab === 'vi' ? "title" : `translations.${activeLangTab}.title` as any} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-700">Tiêu đề bài viết ({activeLangTab === 'vi' ? 'Gốc' : languages.find(l => l.code === activeLangTab)?.name})</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập tiêu đề..."
                                className={`text-lg py-6 focus-visible:ring-blue-500 ${activeLangTab === 'vi' ? 'bg-slate-50/50' : 'bg-blue-50/10 border-blue-100'}`}
                                {...field}
                                onChange={(e) => handleTitleChange(e, field.onChange)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      <FormField 
                        control={form.control} 
                        name={activeLangTab === 'vi' ? "slug" : `translations.${activeLangTab}.slug` as any} 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-slate-700">Đường dẫn tĩnh (Slug)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-mono">/</span>
                                <Input 
                                  className={`font-mono text-sm pl-6 ${activeLangTab === 'vi' ? 'bg-muted/30' : 'bg-blue-50/10 border-blue-100'}`} 
                                  {...field} 
                                  onChange={(e) => field.onChange(convertToSlug(e.target.value))}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                    </div>

                    <FormField 
                      control={form.control} 
                      name={activeLangTab === 'vi' ? "description" : `translations.${activeLangTab}.description` as any} 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-slate-700">Tóm tắt ngắn (Description)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Mô tả ngắn gọn nội dung bài viết..." 
                              className={`min-h-[80px] resize-none ${activeLangTab === 'vi' ? 'bg-slate-50/50' : 'bg-blue-50/10 border-blue-100'}`} 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-[11px]">Hiển thị trên SEO và danh sách bài viết.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />

                    <div className="pt-4 border-t space-y-4">
                      <FormField
                        control={form.control}
                        name={activeLangTab === 'vi' ? "content" : `translations.${activeLangTab}.content` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-base block text-slate-700">Nội dung chi tiết ({activeLangTab.toUpperCase()})</FormLabel>
                            <FormControl>
                              <LexicalEditorDynamic 
                                key={`${activeLangTab}-${field.value ? 'has-val' : 'empty'}`} 
                                value={field.value || ""} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh bài viết</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {isUploading ? (
                  <div className="aspect-video border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (previewUrl || form.getValues("thumbnail")) ? (
                  <div className="relative group rounded-xl overflow-hidden border shadow-inner">
                    <img
                      src={previewUrl || (form.getValues("thumbnail") ? `/api/v1/admin/media/download/${form.getValues("thumbnail")}` : '')}
                      className="w-full aspect-video object-cover"
                      alt="Thumbnail"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <Button type="button" variant="secondary" size="icon" onClick={() => setShowFullImage(true)}><Maximize2 className="h-4 w-4" /></Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4 mr-2" /> Đổi ảnh</Button>
                      <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group">
                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-2">
                      <ImagePlus className="h-6 w-6 text-slate-400" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-500">Tải lên ảnh tiêu đề</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Globe className="h-4 w-4 text-blue-600" /> Cấu hình hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <FormField name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Trạng thái xuất bản</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="font-medium"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT" className="text-slate-500">Lưu bản nháp</SelectItem>
                        <SelectItem value="SUBMITTED" className="text-orange-600 font-medium">Chờ phê duyệt</SelectItem>
                        <SelectItem value="UNDER_REVIEW" className="text-blue-600 font-medium">Đang thẩm định</SelectItem>
                        <SelectItem value="APPROVED" className="text-indigo-600 font-medium">Đã phê duyệt</SelectItem>
                        <SelectItem value="PUBLISHED" className="text-emerald-600 font-medium">Đã xuất bản</SelectItem>
                        <SelectItem value="REJECTED" className="text-rose-600">Bị từ chối</SelectItem>
                        <SelectItem value="UNPUBLISHED" className="text-slate-600">Đã gỡ bài</SelectItem>
                        <SelectItem value="ARCHIVED" className="text-slate-400">Lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <Separator />

                <div className="space-y-4">
                  <FormField name="isFeatured" render={({ field }) => (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="f-mode"><Star className={`h-3.5 w-3.5 ${field.value ? 'fill-yellow-400 text-yellow-500' : ''}`} /> Tin nổi bật</Label>
                        <p className="text-[10px] text-muted-foreground italic">Ghim lên đầu trang chủ</p>
                      </div>
                      <Switch id="f-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />

                  <FormField name="isNotification" render={({ field }) => (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="n-mode"><Bell className={`h-3.5 w-3.5 ${field.value ? 'fill-blue-400 text-blue-500' : ''}`} /> Gửi thông báo</Label>
                        <p className="text-[10px] text-muted-foreground italic">Gửi Notify cho khách hàng</p>
                      </div>
                      <Switch id="n-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Tag className="h-4 w-4 text-blue-600" /> Nhãn gắn (Tags)</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập và nhấn Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="h-9 focus-visible:ring-blue-500"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={addTag}>Thêm</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.watch("tags").length > 0 ? form.watch("tags").map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-default">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => form.setValue("tags", form.getValues("tags").filter(t => t !== tag))} />
                    </Badge>
                  )) : <p className="text-[11px] text-muted-foreground italic px-1 text-center w-full">Thêm từ khóa để SEO bài viết tốt hơn</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showFullImage && (previewUrl || form.getValues("thumbnail")) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm" onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              <img
                src={previewUrl || (form.getValues("thumbnail") ? `/api/v1/admin/media/download/${form.getValues("thumbnail")}` : '')}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg border border-white/20"
                alt="Full"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute -top-12 right-0 text-white hover:bg-white/10" onClick={() => setShowFullImage(false)}><X className="h-8 w-8" /></Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}