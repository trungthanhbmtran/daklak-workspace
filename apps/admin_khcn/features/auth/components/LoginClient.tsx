/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import apiClient, { clearBrowserSession, loginBrowserSession } from "@/lib/axiosInstance";
import { safeAuthCallback } from "@/lib/auth-navigation";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { scheduleToast } from "@/hooks/useToastBridge";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Tên đăng nhập không được để trống." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

export function LoginClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const result = await loginBrowserSession({
        username: values.username,
        password: values.password,
      });
      try {
        // A successful login response is insufficient if the new cookie/JWT cannot be used.
        await apiClient.get("/auth/me", { skipSessionRecovery: true });
      } catch (error: any) {
        if (error.response?.status === 401)
          await clearBrowserSession().catch(() => undefined);
        throw error;
      }
      return result;
    },

    onSuccess: () => {
      queryClient.clear();
      setIsRedirecting(true);
      // Schedule toast TRƯỚC khi navigate — ToastBridgeRenderer sẽ hiện sau khi mount
      // Không gọi toast.success() trực tiếp vì page sẽ remount và toast biến mất
      scheduleToast({
        type: "success",
        message: "Đăng nhập thành công! Chào mừng bạn quay trở lại.",
        duration: 4000,
      });
      router.replace(safeAuthCallback(callbackUrl));
      router.refresh();
    },

    onError: (error: any) => {
      setIsRedirecting(false);
      // Frontend KHÔNG phân loại lỗi — chỉ đọc message và errorType từ backend
      // Backend (AllExceptionsFilter) đã xử lý hoàn toàn logic phân loại
      const data = error.response?.data;
      const message = data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";

      // Chỉ đọc duration từ server nếu có (vd: RATE_LIMITED trả retryAfterSec)
      const duration =
        data?.errorType === "RATE_LIMITED"
          ? 8000 // Giữ toast lâu hơn để user đọc kịp
          : 4000;

      toast.error(message, { duration });
    },
  });

  const isPending = loginMutation.isPending || isRedirecting;

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đăng nhập hệ thống
          </CardTitle>
          <CardDescription>
            Sở Khoa học và Công nghệ tỉnh Đắk Lắk
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên tài khoản..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          disabled={isPending}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors"
                          disabled={isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isPending}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang chuyển hướng...
                  </>
                ) : loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center border-t p-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Cần hỗ trợ?{" "}
            <a href="#" className="font-semibold text-primary hover:underline">
              Liên hệ Quản trị viên
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
