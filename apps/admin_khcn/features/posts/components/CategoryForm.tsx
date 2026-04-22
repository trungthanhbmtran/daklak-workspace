"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Save, Loader2, ImagePlus, X,
  Info, ExternalLink, Settings, Layout, FileText, UploadCloud
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { postsApi } from "../api";
import { useImageUpload } from "../hooks/useImageUpload";
import { Category } from "../types";

const categorySchema = z.object({
  name: z.string().min(2, "Tên chuyên mục quá ngắn"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  thumbnail: z.string().optional(),
  attachmentId: z.string().optional(),
  orderIndex: z.number().default(0),
  linkType: z.enum(["internal", "external"]).default("internal"),
  customUrl: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onBack: () => void;
  editId?: string | null;
}

export function CategoryForm({ onBack, editId }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editId;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "", slug: "", description: "", parentId: null,
      thumbnail: "", attachmentId: "", orderIndex: 0, linkType: "internal", customUrl: ""
    },
  });

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => form.setValue("thumbnail", id, { shouldDirty: true }),
    onRemove: () => form.setValue("thumbnail", "", { shouldDirty: true })
  });

  const { data: categories } = useQuery({
    queryKey: ["posts-categories-simple"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res.data?.data || res.data || [];
    },
  });

  const { data: categoryData, isLoading: isFetching } = useQuery({
    queryKey: ["category", editId],
    queryFn: async () => (await postsApi.getCategory(editId!))?.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (categoryData) {
      form.reset({
        ...categoryData,
        parentId: categoryData.parentId || null,
      });
    }
  }, [categoryData, form]);

  const mutation = useMutation({
    mutationFn: (v: CategoryFormValues) => isEdit ? postsApi.updateCategory(editId!, v) : postsApi.createCategory(v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      alert(isEdit ? "Cập nhật thành công!" : "Tạo mới thành công!");
      onBack();
    },
  });

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setIsUploadingDoc(true);
    setUploadProgress(0);

    try {
      // 1. Request Upload (Standard flow via Gateway)
      // Host will be auto-filled by Gateway if we use headers or it handles it
      // For now, let's assume postsApi has a generic upload request or we use the specific media one
      // Since postsApi doesn't have it, we use a custom one or add it to postsApi

      const res: any = await axios.post("/api/v1/admin/media/request-upload", {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      }, {
        headers: {
          // Auth is handled by axiosInstance if we used it, but here we use base axios
          // In this project, apiClient (axiosInstance) should be used
        }
      });

      const uploadInfo = res.data;

      // 2. Upload to MinIO (via Nginx proxy /media)
      await axios.put(uploadInfo.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))),
      });

      // 3. Confirm
      const confirmRes = await axios.post("/api/v1/admin/media/confirm-upload", {
        fileId: uploadInfo.fileId
      });

      form.setValue("attachmentId", confirmRes.data.id, { shouldDirty: true });
      alert("Tải lên văn bản thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải văn bản!");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

  if (isFetching) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa chuyên mục" : "Tạo chuyên mục mới"}</h1>
            <p className="text-sm text-muted-foreground">Phân loại nội dung để người dùng dễ dàng tìm kiếm.</p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} className="bg-blue-600 hover:bg-blue-700 shadow-md min-w-[140px]" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEdit ? "Cập nhật ngay" : "Tạo chuyên mục"}
        </Button>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b bg-muted/5">
                <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4 text-blue-600" /> Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Tên chuyên mục <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="VD: Tin tức nổi bật, Sự kiện..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Slug (Đường dẫn tĩnh)</FormLabel>
                      <FormControl><Input className="font-mono bg-slate-50" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="parentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Chuyên mục cha</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                        value={field.value || "none"}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn cấp cha" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- Không có (Cấp gốc) --</SelectItem>
                          {categories?.map((cat: Category) => (
                            cat.id !== editId && <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Mô tả ngắn</FormLabel>
                    <FormControl><Textarea className="min-h-[100px] resize-none" {...field} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-muted/5">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Văn bản đính kèm (Quy định/Hướng dẫn)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => docInputRef.current?.click()}
                      disabled={isUploadingDoc}
                    >
                      {isUploadingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      {form.watch("attachmentId") ? "Thay đổi văn bản" : "Tải lên văn bản"}
                    </Button>
                    <input id="doc-upload" type="file" className="hidden" ref={docInputRef} onChange={handleDocUpload} />

                    {form.watch("attachmentId") && !isUploadingDoc && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                        <FileText className="h-4 w-4" /> Đã có tệp đính kèm
                        <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => form.setValue("attachmentId", "")}>Xóa</Button>
                      </div>
                    )}
                  </div>

                  {isUploadingDoc && (
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-muted/5">
                <CardTitle className="text-base flex items-center gap-2"><ExternalLink className="h-4 w-4 text-blue-600" /> Liên kết tùy chỉnh</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="linkType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Loại liên kết</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="internal">Mặc định (Trang nội bộ)</SelectItem>
                          <SelectItem value="external">Liên kết ngoài (SEO/Redirect)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  {form.watch("linkType") === "external" && (
                    <FormField control={form.control} name="customUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">URL đích</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b bg-muted/5">
                <CardTitle className="text-base flex items-center gap-2"><ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                {isUploading ? (
                  <div className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (previewUrl || form.getValues("thumbnail")) ? (
                  <div className="relative group rounded-xl overflow-hidden border shadow-inner aspect-square">
                    <img src={previewUrl || `/api/v1/admin/media/download/${form.getValues("thumbnail")}`} className="w-full h-full object-cover" alt="Thumbnail" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Đổi ảnh</Button>
                      <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group">
                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-2">
                      <ImagePlus className="h-6 w-6 text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">Tải lên icon/ảnh</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-muted/5">
                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4 text-blue-600" /> Cấu hình khác</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField control={form.control} name="orderIndex" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Thứ tự hiển thị</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} /></FormControl>
                    <FormDescription>Số nhỏ hơn sẽ hiển thị trước.</FormDescription>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
