import { useFormContext } from "react-hook-form";
import { Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function BasicInfoFields() {
  const { control } = useFormContext();

  return (
    <>
      <div className="md:col-span-12">
        <FormField control={control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-black uppercase text-muted-foreground">Tiêu đề biên bản</FormLabel>
            <FormControl>
              <Input placeholder="BIÊN BẢN HỌP HỘI ĐỒNG KHOA HỌC..." className="font-bold text-lg border-primary/20 bg-primary/5 focus:bg-background" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="md:col-span-6">
        <FormField control={control} name="startTime" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thời gian bắt đầu</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type="datetime-local" {...field} className="pl-10" />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="md:col-span-6">
        <FormField control={control} name="location" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Địa điểm</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="VD: Phòng họp A" {...field} className="pl-10" />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="md:col-span-6">
        <FormField control={control} name="chairman" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Chủ trì cuộc họp</FormLabel>
            <FormControl><Input placeholder="Họ và tên..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="md:col-span-6">
        <FormField control={control} name="secretary" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thư ký ghi chép</FormLabel>
            <FormControl><Input placeholder="Họ và tên..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </>
  );
}
