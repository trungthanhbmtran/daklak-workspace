import { useFormContext } from "react-hook-form";
import { UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function AccountInfoSection() {
  const { control } = useFormContext();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <UserCircle2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">2. Thông tin tài khoản</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <FormField control={control} name="fullName" render={({ field }) => (
          <FormItem>
            <FormLabel>Họ và tên</FormLabel>
            <FormControl><Input placeholder="Nguyễn Văn A" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="phoneNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Số điện thoại</FormLabel>
            <FormControl><Input placeholder="0901234567" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input type="email" placeholder="user@domain.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Tên đăng nhập <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input placeholder="nguyenvana" {...field} className="font-mono bg-muted/50" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="password" render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Mật khẩu</FormLabel>
            <FormControl><Input type="password" placeholder="Để trống nếu muốn hệ thống tạo ngẫu nhiên" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </section>
  );
}
