/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Library, ChevronLeft, ChevronRight } from "lucide-react";
import { useKpiCriteriaListPaginated, useCreateKpiCriterion, useUpdateKpiCriterion, useDeleteKpiCriterion } from "@/features/hrm/hooks/useKpis";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên tiêu chí"),
  description: z.string().optional(),
  weight: z.number().min(0, "Trọng số không hợp lệ"),
  baseScore: z.number().min(0, "Điểm chuẩn không hợp lệ"),
  scoringMethod: z.string(),
  difficulty: z.string(),
  difficultyMultiplier: z.number().min(0),
  bonusThresholdDays: z.number().min(0),
  bonusPerDay: z.number().min(0),
  penaltyPerDay: z.number().min(0),
  integrationCode: z.string().optional(),
  formula: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function KpiCriteriaClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading } = useKpiCriteriaListPaginated({ page, limit });
  const criteriaList = response?.data || [];
  const meta: any = response?.meta?.pagination;

  const createMutation = useCreateKpiCriterion();
  const updateMutation = useUpdateKpiCriterion();
  const deleteMutation = useDeleteKpiCriterion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      weight: 10,
      baseScore: 100,
      scoringMethod: "MANUAL",
      difficulty: "NORMAL",
      difficultyMultiplier: 1.0,
      bonusThresholdDays: 0,
      bonusPerDay: 0,
      penaltyPerDay: 0,
      integrationCode: "",
      formula: "",
    },
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        name: item.name,
        description: item.description || "",
        weight: item.weight || 10,
        baseScore: item.baseScore || 100,
        scoringMethod: item.scoringMethod || "MANUAL",
        difficulty: item.difficulty || "NORMAL",
        difficultyMultiplier: item.difficultyMultiplier || 1.0,
        bonusThresholdDays: item.bonusThresholdDays || 0,
        bonusPerDay: item.bonusPerDay || 0,
        penaltyPerDay: item.penaltyPerDay || 0,
        integrationCode: item.integrationCode || "",
        formula: item.formula || "",
      });
    } else {
      setEditingId(null);
      form.reset({
        name: "",
        description: "",
        weight: 10,
        baseScore: 100,
        scoringMethod: "MANUAL",
        difficulty: "NORMAL",
        difficultyMultiplier: 1.0,
        bonusThresholdDays: 0,
        bonusPerDay: 0,
        penaltyPerDay: 0,
        integrationCode: "",
        formula: "",
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: values });
        toast.success("Cập nhật tiêu chí thành công");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo tiêu chí mới thành công");
      }
      setIsModalOpen(false);
     
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // eslint-disable-next-line unused-imports/no-unused-vars
  const executeDelete = async (reason?: string) => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete);
      toast.success("Đã xóa tiêu chí");
     
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || "Đã xảy ra lỗi khi xóa");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleNextPage = () => {
    if (meta?.page < meta?.totalPages) setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (meta?.page > 1) setPage(p => p - 1);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-0 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Heading level="h1" className="flex items-center gap-2">
            <Library className="w-6 h-6 text-primary" />
            Khung Tiêu chí & KPI
          </Heading>
          <Text variant="small" className="text-muted-foreground mt-1 font-normal">
            Quản lý tập trung các bộ tiêu chí đánh giá KPI để áp dụng thống nhất cho toàn bộ hệ thống.
          </Text>
        </div>
        <Button onClick={() => openModal()} className="h-10 px-4">
          <Plus className="w-4 h-4 mr-2" /> Tạo Tiêu chí
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 min-h-[300px]">
            {criteriaList.map((item: any) => (
              <Card key={item.id} className="shadow-sm border border-border bg-card hover:border-primary/50 transition-colors h-[240px]">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <Heading level="h4" className="line-clamp-2 leading-snug flex-1 mr-3">
                      {item.name}
                    </Heading>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openModal(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Text variant="small" className="text-muted-foreground line-clamp-2 mb-4 flex-1 font-normal">
                    {item.description || "Chưa có mô tả."}
                  </Text>

                  <div className="space-y-3 pt-4 border-t border-border mt-auto">
                    <div className="flex justify-between items-center text-sm">
                      <Text as="span" variant="small" className="text-muted-foreground font-normal">Điểm chuẩn:</Text>
                      <Text as="span" variant="small" weight="medium" className="text-foreground">{item.baseScore}</Text>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <Text as="span" variant="small" className="text-muted-foreground font-normal">Độ khó:</Text>
                      <Text as="span" variant="small" weight="medium" className="text-foreground">
                        {item.difficulty} (x{item.difficultyMultiplier})
                      </Text>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <Text as="span" variant="small" className="text-muted-foreground font-normal">Phương pháp:</Text>
                      <Text as="span" weight="medium" className="text-foreground text-[11px] px-2 py-0.5 bg-muted rounded-md">
                        {item.scoringMethod}
                      </Text>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {criteriaList.length === 0 && (
            <div className="text-center py-16 border border-border rounded-lg bg-muted/10">
              <Text variant="muted">Chưa có tiêu chí nào.</Text>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Text variant="small" className="font-normal text-muted-foreground">
                Hiển thị <Text as="span" weight="medium" className="text-foreground">{meta?.total ? Math.min((meta.page - 1) * limit + 1, meta.total) : 0} - {meta?.total ? Math.min(meta.page * limit, meta.total) : 0}</Text> trong tổng số <Text as="span" weight="medium" className="text-foreground">{meta?.total || 0}</Text> bản ghi
              </Text>
              <div className="flex items-center gap-2">
                <span>Số dòng:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1); // Reset page when changing limit
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={handlePrevPage}
                disabled={!(meta?.page > 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Text as="span" variant="small" weight="medium" className="px-3 py-1 text-foreground">
                Trang {meta?.page || 1} / {meta?.totalPages || 1}
              </Text>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={handleNextPage}
                disabled={!(meta?.page < meta?.totalPages)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO / SỬA TIÊU CHÍ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              {editingId ? "Cập nhật Tiêu chí" : "Tạo Tiêu chí mới"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Tên tiêu chí <Text as="span" className="text-red-500">*</Text></FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-md" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Trọng số (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="rounded-md" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="baseScore"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Điểm chuẩn (Base)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="rounded-md" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Độ khó</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-md">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EASY">Cơ bản / Dễ</SelectItem>
                            <SelectItem value="NORMAL">Bình thường</SelectItem>
                            <SelectItem value="HARD">Nâng cao / Khó</SelectItem>
                            <SelectItem value="COMPLEX">Phức tạp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficultyMultiplier"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Hệ số độ khó</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} className="rounded-md" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="scoringMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Mô hình tính điểm</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-md">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANUAL">Đánh giá thủ công</SelectItem>
                          <SelectItem value="AUTOMATIC">Tính tự động</SelectItem>
                          <SelectItem value="INTEGRATION_API">Kết nối API</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bonusThresholdDays"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs">Số ngày sớm</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bonusPerDay"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs">Thưởng/ngày</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="penaltyPerDay"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs">Phạt/ngày trễ</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="resize-none h-24 rounded-md" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Lưu cấu hình
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa tiêu chí KPI"
        description="Bạn có chắc chắn muốn xóa tiêu chí đánh giá này? Dữ liệu đã xóa không thể khôi phục."
        isDeleting={deleteMutation.isPending}
        requireReason={true}
      />
    </div>
  );
}
