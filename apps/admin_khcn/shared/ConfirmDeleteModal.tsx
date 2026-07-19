"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title?: string;
  description?: React.ReactNode;
  isDeleting?: boolean;
  requireReason?: boolean;
}

const formSchema = z.object({
  reason: z.string().min(5, { message: "Vui lòng nhập lý do (ít nhất 5 ký tự)." }),
});

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa dữ liệu",
  description = "Bạn có chắc chắn muốn xóa dữ liệu này? Hành động này không thể hoàn tác.",
  isDeleting = false,
  requireReason = false,
}: ConfirmDeleteModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      form.reset({ reason: "" });
    }
  }, [isOpen, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onConfirm(requireReason ? values.reason : undefined);
  }

  // Nếu không yêu cầu lý do, bỏ qua validate form
  const handleConfirmNoReason = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3 text-slate-600 text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireReason ? (
          <Form {...form}>
            <form id="delete-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Lý do xóa <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập lý do xóa dữ liệu..."
                        disabled={isDeleting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        ) : null}

        <AlertDialogFooter className="sm:justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl font-medium m-0 sm:m-0"
          >
            Hủy
          </Button>

          {requireReason ? (
            <Button
              type="submit"
              form="delete-form"
              variant="destructive"
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 m-0 sm:m-0"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmNoReason}
              className="rounded-xl bg-red-600 hover:bg-red-700 m-0 sm:m-0"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
