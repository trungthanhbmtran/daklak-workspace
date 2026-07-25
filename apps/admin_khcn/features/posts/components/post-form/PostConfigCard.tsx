import { Globe, Star, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/typography";
import { useFormContext } from "react-hook-form";

export function PostConfigCard() {
  const { control } = useFormContext();

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-5 border-b bg-muted/80">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" /> Cấu hình hiển thị
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        <FormField control={control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Trạng thái xuất bản</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger className="font-medium"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="DRAFT" className="text-muted-foreground">Lưu bản nháp</SelectItem>
                <SelectItem value="SUBMITTED" className="text-orange-600 font-medium">Chờ phê duyệt</SelectItem>
                <SelectItem value="UNDER_REVIEW" className="text-blue-600 font-medium">Đang thẩm định</SelectItem>
                <SelectItem value="APPROVED" className="text-indigo-600 font-medium">Đã phê duyệt</SelectItem>
                <SelectItem value="PUBLISHED" className="text-emerald-600 font-medium">Đã xuất bản</SelectItem>
                <SelectItem value="REJECTED" className="text-rose-600">Bị từ chối</SelectItem>
                <SelectItem value="UNPUBLISHED" className="text-muted-foreground">Đã gỡ bài</SelectItem>
                <SelectItem value="ARCHIVED" className="text-muted-foreground">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )} />

        <Separator />

        <div className="space-y-4">
          <FormField control={control} name="isFeatured" render={({ field }) => (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="f-mode">
                  <Star className={`h-3.5 w-3.5 ${field.value ? 'fill-yellow-400 text-yellow-500' : ''}`} /> Tin nổi bật
                </Label>
                <Text className="text-[10px] text-muted-foreground italic">Ghim lên đầu trang chủ</Text>
              </div>
              <Switch id="f-mode" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )} />

          <FormField control={control} name="isNotification" render={({ field }) => (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" htmlFor="n-mode">
                  <Bell className={`h-3.5 w-3.5 ${field.value ? 'fill-blue-400 text-blue-500' : ''}`} /> Gửi thông báo
                </Label>
                <Text className="text-[10px] text-muted-foreground italic">Gửi Notify cho khách hàng</Text>
              </div>
              <Switch id="n-mode" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
