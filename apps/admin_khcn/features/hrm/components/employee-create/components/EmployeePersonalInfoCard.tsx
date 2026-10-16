"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { useWatch, type Control } from "react-hook-form";
import {
  User,
  Camera,
  Loader2,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  MapPin,
  X,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import type { EmployeeCreateFormValues } from "../types";

interface EmployeePersonalInfoCardProps {
  control: Control<EmployeeCreateFormValues>;
  setValue: (name: keyof EmployeeCreateFormValues, value: any, options?: any) => void;
}

/**
 * Sub-component cô lập hiệu năng: Chỉ re-render duy nhất huy hiệu xem trước họ tên khi gõ phím.
 * Tránh re-render toàn bộ thẻ thông tin và toàn trang.
 */
function FullNamePreviewBadge({ control }: { control: Control<EmployeeCreateFormValues> }) {
  const [firstname, lastname] = useWatch({
    control,
    name: ["firstname", "lastname"],
  });

  const preview = useMemo(() => {
    const fn = (firstname || "").trim();
    const ln = (lastname || "").trim();
    if (!fn && !ln) return "";
    return `${ln} ${fn}`.trim().toUpperCase();
  }, [firstname, lastname]);

  if (!preview) return null;

  return (
    <Badge
      variant="outline"
      className="hidden sm:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full max-w-[260px] truncate"
      title={preview}
    >
      <BadgeCheck className="h-3.5 w-3.5 mr-1 text-emerald-600 shrink-0" />
      <span className="truncate">{preview}</span>
    </Badge>
  );
}

export function EmployeePersonalInfoCard({ control, setValue }: EmployeePersonalInfoCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarValue = useWatch({ control, name: "avatar" });

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId, downloadUrl) => {
      setValue("avatar", downloadUrl || fileId, { shouldDirty: true });
    },
  });

  const displayImage = previewUrl || (avatarValue || null);

  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden min-w-0">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700 font-bold shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold text-slate-900 truncate">
                1. Thông tin cá nhân & Định danh
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 truncate">
                Họ tên, ảnh thẻ, căn cước công dân và thông tin liên lạc
              </CardDescription>
            </div>
          </div>
          <FullNamePreviewBadge control={control} />
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 min-w-0">
        {/* KHỐI ẢNH THẺ VÀ HỌ TÊN */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 min-w-0">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-28 w-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-blue-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-2xs"
              title="Nhấn để tải lên ảnh thẻ 3x4 hoặc 4x6"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Đang tải...
                  </span>
                </div>
              ) : displayImage ? (
                <>
                  <Image
                    src={displayImage}
                    alt="Ảnh thẻ"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="h-6 w-6" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 p-3 text-slate-400 group-hover:text-blue-600 transition-colors text-center">
                  <Camera className="h-7 w-7 stroke-1.5" />
                  <span className="text-[11px] font-semibold tracking-tight text-slate-600">
                    Tải ảnh thẻ
                  </span>
                  <span className="text-[9px] text-slate-400">JPG, PNG ≤ 5MB</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {displayImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                  setValue("avatar", "", { shouldDirty: true });
                }}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" /> Gỡ ảnh
              </button>
            )}
          </div>

          {/* Họ & Tên */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            <FormField
              control={control}
              name="lastname"
              render={({ field }) => (
                <FormItem className="space-y-1.5 min-w-0">
                  <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Họ và tên đệm <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ví dụ: Nguyễn Văn"
                      className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white font-medium text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="firstname"
              render={({ field }) => (
                <FormItem className="space-y-1.5 min-w-0">
                  <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Tên chính <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ví dụ: Hải"
                      className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white font-medium text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Giới tính */}
            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-1.5 min-w-0">
                  <FormLabel className="text-xs font-bold text-slate-700">Giới tính</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "male"}>
                    <FormControl>
                      <SelectTrigger
                        className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-medium truncate [&>span]:truncate"
                        title="Chọn giới tính"
                      >
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Ngày sinh */}
            <FormField
              control={control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="space-y-1.5 min-w-0">
                  <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" /> Ngày sinh
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
          </div>
        </div>

        {/* CĂN CƯỚC & LIÊN HỆ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <FormField
            control={control}
            name="identityCard"
            render={({ field }) => (
              <FormItem className="space-y-1.5 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-slate-500" /> Số CCCD / Định danh cá nhân
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="12 số căn cước công dân"
                    maxLength={12}
                    className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white font-mono text-sm focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1.5 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" /> Số điện thoại liên hệ
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="09xx xxx xxx"
                    className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5 sm:col-span-2 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" /> Hòm thư công vụ / Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="canbo@daklak.gov.vn hoặc email cá nhân"
                    className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem className="space-y-1.5 sm:col-span-2 min-w-0">
                <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" /> Địa chỉ thường trú / Nơi ở hiện nay
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Số nhà, đường, phường/xã, TP. Buôn Ma Thuột, tỉnh Đắk Lắk"
                    className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
