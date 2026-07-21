/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, ArrowLeft, ImagePlus, Globe, Tag, Send,
  Loader2, X, UploadCloud, Maximize2, Star, Bell, FileText, AlertCircle, CheckCircle2, Sparkles,
  Copy, Link2
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
import { Category } from "../types";
import dynamic from "next/dynamic";
import { convertToSlug } from "@/lib/slug";
import { Heading, Text } from "@/components/ui/typography";


const LexicalEditorDynamic = dynamic(
  () => import("./editor/LexicalEditor").then((mod) => mod.LexicalEditor),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-xl border border-dashed flex items-center justify-center text-sm text-muted-foreground">Khởi tạo trình soạn thảo...</div>
  }
);

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
      toast.error((error as any)?.response?.data?.message || "Lỗi khi dịch tự động");
    } finally {
      setIsTranslating(prev => ({ ...prev, [langCode]: false }));
    }
  };

  const [activeLangTab, setActiveLangTab] = useState<string>("vi");

  const { data: languages = [] } = useQuery({
    queryKey: ['portal-languages'],
    queryFn: async () => {
      const langs = await categoryApi.fetchByGroup('LANGUAGE');
      return langs.data;
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (languages.length > 0) {
      const currentTranslations = form.getValues("translations") || {};
      const newTranslations = { ...currentTranslations };
      let hasNew = false;
      languages.forEach(l => {
        if (l.code !== 'vi' && !newTranslations[l.code]) {
          newTranslations[l.code] = { title: "", description: "", content: "" };
          hasNew = true;
        }
      });
      if (hasNew) {
        form.setValue("translations", newTranslations);
      }
    }
  }, [languages, form]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newTitle = e.target.value;
    onChangeOriginal(newTitle);
    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", convertToSlug(newTitle), { shouldValidate: true });
    }
  };

  const handleTranslationTitleChange = (langCode: string, e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newTitle = e.target.value;
    onChangeOriginal(newTitle);

    const slugName = `translations.${langCode}.slug` as any;
    const isSlugDirty = (form.formState.dirtyFields as any).translations?.[langCode]?.slug;

    if (!isSlugDirty) {
      form.setValue(slugName, convertToSlug(newTitle), { shouldValidate: true });
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res.data;
    },
  });

  const { data: postResponse, isLoading: isFetching } = useQuery({
    queryKey: ["post", editId],
    queryFn: async () => await postsApi.getPost(editId!),
    enabled: isEdit,
  });
  const postData = postResponse?.data;

  useEffect(() => {
    if (postData && languages.length > 0) {
      let parsedTranslations = postData.translations || {};
      if (typeof parsedTranslations === 'string') {
        try {
          parsedTranslations = JSON.parse(parsedTranslations);
        // eslint-disable-next-line unused-imports/no-unused-vars
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
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
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

  const currentSlug = form.watch("slug") || editId || "";
  const currentEnSlug = (form.watch("translations.en.slug") as any) || currentSlug;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[1400px] mx-auto space-y-6 pb-20 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Heading level="h1" className="font-bold tracking-tight">{isEdit ? "Chỉnh sửa nội dung" : "Tạo bài viết mới"}</Heading>
              <Text className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Bản thảo nội dung & cấu hình</Text>
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
                <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-foreground tracking-tight">
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
                      <Text className="font-bold uppercase tracking-tight">Kiểm duyệt tự động: {postData.autoModerationStatus === 'SAFE' ? 'Hợp lệ' : 'Cảnh báo'}</Text>
                      <Text className="mt-1 opacity-90">{postData.autoModerationNote}</Text>
                    </div>
                  </div>
                )}

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
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Tiêu đề chính <Text as="span" className="text-destructive">*</Text></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Bí quyết học lập trình hiệu quả..."
                            className="text-lg py-6 focus-visible:ring-blue-500 bg-muted/50"
                            {...field}
                            onChange={(e) => handleTitleChange(e, field.onChange)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="categoryId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Chuyên mục</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-muted/50"><SelectValue placeholder="Chọn chuyên mục" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {categories?.map((cat: Category) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="slug" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Đường dẫn tĩnh (Slug)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Text as="span" className="absolute left-3 top-2.5 text-muted-foreground font-mono">/</Text>
                              <Input className="font-mono text-sm bg-muted/30 pl-6" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Tóm tắt ngắn (Description)</FormLabel>
                        <FormControl><Textarea placeholder="Mô tả nội dung bài viết trong khoảng 160 ký tự..." className="min-h-[80px] resize-none bg-muted/50" {...field} /></FormControl>
                        <FormDescription className="text-[11px]">Sẽ hiển thị trên kết quả tìm kiếm Google và danh sách bài viết.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="pt-4 border-t space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                        <Label className="font-bold text-base text-slate-800">Nội dung chi tiết (TIẾNG VIỆT)</Label>
                      </div>

                      <Controller
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <LexicalEditorDynamic key={`vi-wysiwyg-${field.value ? 'has-val' : 'empty'}`} value={field.value || ""} onChange={field.onChange} />
                        )}
                      />
                      {form.formState.errors.content && <Text className="text-destructive font-medium">{form.formState.errors.content.message}</Text>}
                    </div>
                  </TabsContent>

                  {languages.filter(l => l.code !== 'vi').map(lang => (
                    <TabsContent key={lang.code} value={lang.code} className="space-y-6 animate-in fade-in-50 duration-300">
                      <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 mb-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Globe className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <Text className="font-bold text-blue-900">Phiên bản dịch: {lang.name}</Text>
                            <Text className="text-blue-700/70 italic text-[11px]">Nhập nội dung tương ứng cho ngôn ngữ này</Text>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 gap-2 shadow-sm"
                          onClick={() => handleAutoTranslate(lang.code)}
                          disabled={isTranslating[lang.code]}
                        >
                          {isTranslating[lang.code] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          Dịch tự động (AI)
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`translations.${lang.code}.title`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-blue-700">Tiêu đề ({lang.name})</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Nhập tiêu đề bằng ${lang.name}...`}
                                className="text-lg py-6 focus-visible:ring-blue-500 border-blue-100 bg-blue-50/10"
                                {...field}
                                onChange={(e) => handleTranslationTitleChange(lang.code, e, field.onChange)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name={`translations.${lang.code}.slug`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-blue-700">Slug / Đường dẫn ({lang.name})</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="news-and-events"
                                className="font-mono text-sm border-blue-100 bg-blue-50/10"
                                {...field}
                                onChange={(e) => field.onChange(convertToSlug(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name={`translations.${lang.code}.description`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-blue-700">Tóm tắt ({lang.name})</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={`Mô tả ngắn bằng ${lang.name}...`}
                              className="min-h-[100px] resize-none focus-visible:ring-blue-500 border-blue-100 bg-blue-50/10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="pt-4 border-t border-blue-100/50 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                          <Label className="font-bold text-base text-blue-700">Nội dung chi tiết ({lang.code.toUpperCase()})</Label>
                        </div>

                        <Controller
                          control={form.control}
                          name={`translations.${lang.code}.content`}
                          render={({ field }) => (
                            <LexicalEditorDynamic key={`${lang.code}-wysiwyg-${field.value ? 'has-val' : 'empty'}`} value={field.value || ""} onChange={field.onChange} />
                          )}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="py-3 px-5 border-b bg-muted/80">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh bài viết</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {isUploading ? (
                  <div className="aspect-video border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (previewUrl || form.getValues("thumbnail")) ? (
                  <div className="relative group rounded-xl overflow-hidden border shadow-inner">
                    // eslint-disable-next-line @next/next/no-img-element
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
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group">
                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-2">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Text as="span" className="text-[13px] font-semibold text-muted-foreground">Tải lên ảnh tiêu đề</Text>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-muted/80">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Globe className="h-4 w-4 text-blue-600" /> Cấu hình hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <FormField name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Trạng thái xuất bản</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="font-medium"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT" className="text-muted-foreground">Lưu bản nháp</SelectItem>
                        <SelectItem value="SUBMITTED" className="text-orange-600 font-medium">Chờ phê duyệt</SelectItem>
                        <SelectItem value="UNDER_REVIEW" className="text-blue-600 font-medium">Đang thẩm định</SelectItem>
                        <SelectItem value="APPROVED" className="text-indigo-600 font-medium">Đã phê duyệt</SelectItem>
                        <SelectItem value="PUBLISHED" className="text-emerald-600 font-medium">Đã xuất bản</SelectItem>
                        <SelectItem value="REJECTED" className="text-rose-600">Bị từ chối</SelectItem>
                        <SelectItem value="UNPUBLISHED" className="text-muted-foreground">Đã gỡ bài</SelectItem>
                        <SelectItem value="ARCHIVED" className="text-muted-foreground">Lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <Separator />

                <div className="space-y-4">
                  <FormField name="isFeatured" render={({ field }) => (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="f-mode"><Star className={`h-3.5 w-3.5 ${field.value ? 'fill-yellow-400 text-yellow-500' : ''}`} /> Tin nổi bật</Label>
                        <Text className="text-[10px] text-muted-foreground italic">Ghim lên đầu trang chủ</Text>
                      </div>
                      <Switch id="f-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />

                  <FormField name="isNotification" render={({ field }) => (
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="n-mode"><Bell className={`h-3.5 w-3.5 ${field.value ? 'fill-blue-400 text-blue-500' : ''}`} /> Gửi thông báo</Label>
                        <Text className="text-[10px] text-muted-foreground italic">Gửi Notify cho khách hàng</Text>
                      </div>
                      <Switch id="n-mode" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-muted/80">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-600" /> Đường dẫn cấu hình Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {isEdit && editId ? (
                  <div className="space-y-4">
                    <Text className="text-muted-foreground leading-relaxed">
                      Tùy thuộc vào mục đích sử dụng, hãy sao chép đường dẫn tương ứng dưới đây để gán vào Menu:
                    </Text>

                    <div className="space-y-3">
                      <div className="border-t pt-3 first:border-0 first:pt-0">
                        <Text as="span" className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-2">
                          1. Dạng Trang tĩnh CMS (Giới thiệu, Liên hệ...)
                        </Text>
                        <div className="space-y-2">
                          <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                            <Text as="span" className="font-semibold text-foreground">Tiếng Việt</Text>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <code className="text-[11px] font-mono text-muted-foreground break-all">/trang/{currentSlug}</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                                onClick={() => {
                                  void navigator.clipboard.writeText(`/trang/${currentSlug}`);
                                  toast.success("Đã sao chép đường dẫn trang tĩnh tiếng Việt!");
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                            <Text as="span" className="font-semibold text-foreground">Tiếng Anh (English)</Text>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <code className="text-[11px] font-mono text-muted-foreground break-all">/en/page/{currentEnSlug}</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                                onClick={() => {
                                  void navigator.clipboard.writeText(`/en/page/${currentEnSlug}`);
                                  toast.success("Đã sao chép đường dẫn trang tĩnh tiếng Anh!");
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <Text as="span" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                          2. Dạng Tin tức / Bài viết thông thường
                        </Text>
                        <div className="space-y-2">
                          <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                            <Text as="span" className="font-semibold text-foreground">Tiếng Việt</Text>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <code className="text-[11px] font-mono text-muted-foreground break-all">/tin-tuc/{currentSlug}</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                                onClick={() => {
                                  void navigator.clipboard.writeText(`/tin-tuc/${currentSlug}`);
                                  toast.success("Đã sao chép đường dẫn tin tức tiếng Việt!");
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                            <Text as="span" className="font-semibold text-foreground">Tiếng Anh (English)</Text>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <code className="text-[11px] font-mono text-muted-foreground break-all">/en/news/{currentEnSlug}</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                                onClick={() => {
                                  void navigator.clipboard.writeText(`/en/news/${currentEnSlug}`);
                                  toast.success("Đã sao chép đường dẫn tin tức tiếng Anh!");
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Text className="text-muted-foreground italic text-center py-2">
                    Đường dẫn liên kết cấu hình Menu sẽ khả dụng sau khi lưu bài viết lần đầu.
                  </Text>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="py-3 px-5 border-b bg-muted/80">
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
                  )) : <Text className="text-[11px] text-muted-foreground italic px-1 text-center w-full">Thêm từ khóa để SEO bài viết tốt hơn</Text>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showFullImage && (previewUrl || form.getValues("thumbnail")) && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm" onClick={() => setShowFullImage(false)}>
            <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              // eslint-disable-next-line @next/next/no-img-element
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
