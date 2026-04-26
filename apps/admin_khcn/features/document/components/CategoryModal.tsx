"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDocuments } from "../hooks/useDocuments";
import { Loader2, Save } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  code: z.string().min(2, "Mã danh mục phải có ít nhất 2 ký tự"),
  groupCode: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any; // If present, it's edit mode
  groupCode: string;
}

export function CategoryModal({ isOpen, onClose, category, groupCode }: CategoryModalProps) {
  const { createCategory, updateCategory, isLoading } = useDocuments();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      code: "",
      groupCode: groupCode,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        code: category.code,
        groupCode: groupCode,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        groupCode: groupCode,
      });
    }
  }, [category, groupCode, form, isOpen]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (category) {
        await updateCategory({ id: category.id, ...values });
      } else {
        await createCategory(values);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {category ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho danh mục trong nhóm <strong>{groupCode}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Công văn, Quyết định..." className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Mã định danh</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: CONG_VAN" className="rounded-xl font-mono uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Hủy</Button>
              <Button type="submit" className="rounded-xl px-6 shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {category ? "Lưu thay đổi" : "Tạo danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
