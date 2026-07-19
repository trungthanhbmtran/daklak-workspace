/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";

interface BannerScheduleProps {
  form: UseFormReturn<any>;
}

export function BannerSchedule({ form }: BannerScheduleProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" /> Lịch trình
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <FormField
          control={form.control}
          name="startAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Ngày bắt đầu</FormLabel>
              <FormControl><Input type="date" className="bg-slate-50/50" {...field} /></FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold text-muted-foreground uppercase">Ngày kết thúc</FormLabel>
              <FormControl><Input type="date" className="bg-slate-50/50" {...field} /></FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
