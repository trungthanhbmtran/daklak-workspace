// features/posts/components/CategoryForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import { useEffect } from "react";

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
import { Category } from "../types";

interface CategoryFormProps {
  onBack: () => void;
  editId?: string | null;
}

export function CategoryForm({ onBack, editId }: CategoryFormProps) {
  const queryClient = useQueryClient();
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
    },
  });

  // Fetch all categories for parent selection
  const { data: allCategories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return (res as any).data?.items || res.data || [];
    },
  });

  // Fetch detailed data if editing
  const { data: categoryData, isLoading: isFetching } = useQuery({
    queryKey: ["posts-category", editId],
    queryFn: () => postsApi.getCategory(editId!).then(res => res.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (categoryData) {
      form.reset({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || "",
        parentId: categoryData.parentId || null,
        status: categoryData.status,
        orderIndex: categoryData.orderIndex,
      });
    }
  }, [categoryData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (isEdit) return postsApi.updateCategory(editId!, values);
      return postsApi.createCategory(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      alert(isEdit ? "Cập nhật thành công!" : "Tạo chuyên mục mới thành công!");
      onBack();
    },
    onError: (err: any) => {
      alert("Lỗi: " + (err.response?.data?.message || "Đã xảy ra lỗi hệ thống."));
    },
  });

  const onSubmit = (values: any) => mutation.mutate(values);

  // Auto-slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);
    if (!form.formState.dirtyFields.slug) {
      const slug = value.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-md bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Thông tin chuyên mục</CardTitle>
                  <CardDescription>Cung cấp các thông tin cơ bản về chuyên mục này.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên chuyên mục <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Tin tức Khoa học..." {...field} onChange={handleNameChange} />
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
                        <FormLabel>Slug (Đường dẫn tĩnh) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-md border border-input bg-muted/20 overflow-hidden">
                            <span className="pl-3 pr-1 text-xs text-muted-foreground font-mono">/</span>
                            <Input className="border-0 bg-transparent focus-visible:ring-0 font-mono text-sm h-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả ngắn</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Mô tả về chuyên mục..." className="min-h-[100px] resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-md bg-card">
                <CardHeader>
                  <CardTitle className="text-base">Thiết lập</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chuyên mục cha</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(val === "none" ? null : val)} 
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Không có (Chuyên mục cấp 1)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Không có (Chuyên mục cấp 1)</SelectItem>
                            {allCategories
                              ?.filter((c: Category) => c.id !== editId)
                              .map((c: Category) => (
                                <SelectItem key={c.id} value={c.id}>
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
                        <FormDescription className="text-[10px]">Thứ tự nhỏ sẽ hiển thị trước.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Trạng thái</FormLabel>
                          <FormDescription className="text-[10px]">Kích hoạt để sử dụng.</FormDescription>
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

                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEdit ? "Cập nhật chuyên mục" : "Tạo chuyên mục"}
                  </Button>
                </CardContent>
              </Card>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <Info className="h-3 w-3" /> Lưu ý
                </div>
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Chuyên mục giúp phân loại bài viết. Chuyên mục cấp cha sẽ bao gồm cả các bài viết của chuyên mục con. 
                  Hãy cẩn thận khi đổi slug của chuyên mục đã có sẵn bài viết.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
