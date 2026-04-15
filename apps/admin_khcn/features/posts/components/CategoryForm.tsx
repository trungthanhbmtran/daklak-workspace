// features/posts/components/CategoryForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Info, LayoutGrid, Hash, AlignLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { postsApi } from "../api";
import { Category } from "../types";

interface CategoryFormProps {
  initialData?: Category;
  onBack: () => void;
}

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

export function CategoryForm({ initialData, onBack }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const { register, handleSubmit, setValue, watch, formState: { errors, dirtyFields } } = useForm({
    defaultValues: initialData || {
      name: "",
      slug: "",
      parentId: "root",
      description: "",
      status: true,
      isGovStandard: false
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return (res?.data?.data || []) as Category[];
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? postsApi.updateCategory(initialData.id, data) : postsApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      onBack();
    }
  });

  // Tự động tạo slug khi gõ tên
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);

    // Chỉ tự động tạo slug nếu người dùng chưa sửa slug thủ công
    if (!dirtyFields.slug) {
      setValue("slug", convertToSlug(name), { shouldValidate: true });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-10 w-10 shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">{isEdit ? "Chỉnh sửa chuyên mục" : "Thêm chuyên mục mới"}</h2>
            <p className="text-sm text-muted-foreground">Quản lý cấu trúc phân cấp và hiển thị của chuyên mục</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} disabled={mutation.isPending}>Hủy bỏ</Button>
          <Button
            onClick={handleSubmit((data) => mutation.mutate({
              ...data,
              parentId: data.parentId === "root" ? null : data.parentId
            }))}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 min-w-[140px]"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? "Cập nhật" : "Lưu dữ liệu"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: MAIN INFO */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-blue-500" /> Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Tên hiển thị */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1">
                  Tên hiển thị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Tin tức nổi bật"
                  className="h-11 bg-slate-50/50 focus:bg-white transition-all border-slate-200"
                  {...register("name", { required: true })}
                  onChange={handleNameChange}
                />
              </div>

              {/* Đường dẫn tĩnh (Slug) */}
              <div className="grid gap-2">
                <Label htmlFor="slug" className="text-sm font-semibold flex items-center gap-1">
                  Đường dẫn tĩnh (Slug) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Hash className="h-4 w-4" />
                  </span>
                  <Input
                    id="slug"
                    placeholder="tin-tuc-noi-bat"
                    className="h-11 pl-9 font-mono text-sm bg-slate-50/10 border-slate-200"
                    {...register("slug", { required: true })}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground italic">Slug sẽ được tự động tạo từ tên nếu bạn không nhập thủ công.</p>
              </div>

              <Separator className="my-2" />

              {/* Mô tả */}
              <div className="grid gap-2">
                <Label htmlFor="desc" className="text-sm font-semibold flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" /> Mô tả ngắn
                </Label>
                <Textarea
                  id="desc"
                  {...register("description")}
                  placeholder="Nhập mô tả cho chuyên mục này..."
                  className="min-h-[120px] bg-slate-50/50 focus:bg-white resize-none border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-blue-500" /> Cấu hình & Vị trí
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Vị trí trong cây */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Chuyên mục cha</Label>
                <Select
                  onValueChange={(v) => setValue("parentId", v)}
                  defaultValue={watch("parentId") || "root"}
                >
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 h-10">
                    <SelectValue placeholder="Chọn chuyên mục cha" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="root" className="font-bold text-blue-600 focus:text-blue-700">
                      -- Là chuyên mục Gốc (Cấp 0) --
                    </SelectItem>
                    {categories?.filter(c => c.id !== initialData?.id).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.depth > 0 && "  ".repeat(cat.depth)}
                        {cat.depth > 0 ? "└─ " : ""}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-2">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-blue-700 font-medium">
                    Cấu trúc cây (Nested Set) sẽ tự động cập nhật lại các chỉ số Left/Right khi bạn lưu.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Phân loại chính phủ */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-emerald-800" htmlFor="gov-switch">
                    <Star className={`h-4 w-4 ${watch("isGovStandard") ? "fill-emerald-500 text-emerald-500" : "text-emerald-400"}`} /> Chuẩn CP
                  </Label>
                  <p className="text-[10px] text-emerald-600/80 italic font-medium">Theo chuẩn Cổng TTĐT Chính phủ</p>
                </div>
                <Switch
                  id="gov-switch"
                  checked={watch("isGovStandard")}
                  onCheckedChange={(val) => setValue("isGovStandard", val, { shouldDirty: true })}
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" htmlFor="status-switch">
                    <Eye className="h-4 w-4 text-slate-500" /> Hiển thị
                  </Label>
                  <p className="text-[10px] text-muted-foreground italic">Kích hoạt trên giao diện web</p>
                </div>
                <Switch
                  id="status-switch"
                  checked={watch("status")}
                  onCheckedChange={(val) => setValue("status", val, { shouldDirty: true })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}