import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Heading, Text } from "@/components/ui/typography";


interface BannerConfigProps {
  form: UseFormReturn<any>;
  customStyles?: any;
  updateStyle?: (key: string, value: any) => void;
}

export function BannerConfig({ form, customStyles, updateStyle }: BannerConfigProps) {
  return (
    <Card className="shadow-sm overflow-hidden bg-card">
      <CardHeader className="py-3 px-5 border-b bg-slate-50/80 dark:bg-slate-900/80">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Monitor className="h-4 w-4 text-blue-600" /> Cấu hình hiển thị
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        <FormField
          control={form.control}
          name="orderIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Thứ tự ưu tiên</FormLabel>
              <FormControl>
                <Input type="number" className="bg-slate-50/50 dark:bg-slate-900" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Kích hoạt</Label>
                <Text className="text-[10px] text-muted-foreground italic">Hiển thị trên trang chủ</Text>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
