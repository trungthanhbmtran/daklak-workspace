"use client";

import type { Control } from "react-hook-form";
import {
  Briefcase,
  Hash,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import type { EmployeeCreateFormValues } from "../types";

interface EmployeeEmploymentCardProps {
  control: Control<EmployeeCreateFormValues>;
  rankTitles?: Array<{ id: number; name: string }>;
}

export function EmployeeEmploymentCard({ control, rankTitles = [] }: EmployeeEmploymentCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden min-w-0">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100/80 text-indigo-700 font-bold shrink-0">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-bold text-slate-900 truncate">
              2. Chế độ công tác & Thiết lập hồ sơ
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 truncate">
              Mã nhân sự hệ thống, ngày gia nhập cơ quan và tình trạng làm việc
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <FormField
            control={control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem className="space-y-1.5 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-slate-500" /> Mã cán bộ / nhân viên
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Để trống hệ thống sẽ tự sinh (E...)"
                    className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-slate-50/60 font-mono text-sm uppercase focus:bg-white focus:border-blue-500"
                  />
                </FormControl>
                <Text variant="small" className="text-[11px] text-slate-400 break-words">
                  Mã định danh liên thông các phần mềm quản lý cán bộ
                </Text>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="space-y-1.5 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" /> Ngày tiếp nhận / Bắt đầu công tác
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-medium"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem className="space-y-1.5 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700">Trạng thái công tác</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "active"}>
                  <FormControl>
                    <SelectTrigger
                      className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-medium truncate [&>span]:truncate"
                      title="Chọn trạng thái công tác"
                    >
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Đang công tác chính thức</SelectItem>
                    <SelectItem value="probation">Tập sự / Thử việc</SelectItem>
                    <SelectItem value="seconded">Biệt phái / Tăng cường</SelectItem>
                    <SelectItem value="leave">Tạm hoãn / Nghỉ chế độ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Ngạch công chức/viên chức nếu có */}
          {rankTitles.length > 0 && (
            <FormField
              control={control}
              name="civilServantRankId"
              render={({ field }) => (
                <FormItem className="space-y-1.5 min-w-0">
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Ngạch công chức / viên chức
                  </FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-medium truncate [&>span]:truncate"
                        title="Chọn ngạch công chức / viên chức"
                      >
                        <SelectValue placeholder="-- Chọn ngạch công chức --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rankTitles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          <span className="truncate" title={r.name}>{r.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
