// features/posts/components/CategoryForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { postsApi } from "../api";
import { Category } from "../types";

interface CategoryFormProps {
  initialData?: Category;
  onBack: () => void;
}

export function CategoryForm({ initialData, onBack }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: "",
      slug: "",
      parentId: "root",
      description: "",
      status: true
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{isEdit ? "Chỉnh sửa chuyên mục" : "Thêm chuyên mục mới"}</h2>
          <p className="text-sm text-muted-foreground">Vị trí sẽ được tự động tính toán theo cấu trúc cây</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate({
        ...data,
        parentId: data.parentId === "root" ? null : data.parentId
      }))} className="space-y-4">
        <Card className="border-2 shadow-none">
          <CardContent className="pt-6 space-y-5">
            {/* Tên & Slug */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-semibold">Tên hiển thị</Label>
              <Input
                id="name"
                placeholder="VD: Điện thoại di động"
                {...register("name", { required: true })}
              />
            </div>

            {/* Chọn vị trí trong cây */}
            <div className="grid gap-2">
              <Label className="font-semibold">Vị trí trong hệ thống</Label>
              <Select
                onValueChange={(v) => setValue("parentId", v)}
                defaultValue={watch("parentId") || "root"}
              >
                <SelectTrigger className="bg-muted/20">
                  <SelectValue placeholder="Chọn chuyên mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root" className="font-bold text-primary italic">
                    -- Là chuyên mục Gốc (Cấp 0) --
                  </SelectItem>
                  {categories?.filter(c => c.id !== initialData?.id).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {"  ".repeat(cat.depth)} {cat.depth > 0 ? "└─ " : ""}{cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Khi bạn chọn một chuyên mục cha, hệ thống sẽ chèn chuyên mục mới này vào vị trí cuối cùng của nhánh con thuộc cha đó và cập nhật lại toàn bộ chỉ số Left/Right của các nhánh liên quan.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Mô tả ngắn</Label>
              <Textarea id="desc" {...register("description")} placeholder="Nhập mô tả..." rows={3} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
              <div className="space-y-0.5">
                <Label>Trạng thái hiển thị</Label>
                <p className="text-xs text-muted-foreground">Cho phép chuyên mục xuất hiện trên website</p>
              </div>
              <Switch
                checked={watch("status")}
                onCheckedChange={(val) => setValue("status", val)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>Hủy bỏ</Button>
          <Button type="submit" className="min-w-[120px]" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}