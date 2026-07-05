import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Globe, Info, ExternalLink, Image as ImageIcon, Type, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCategoryByGroup } from "@/features/system-admin/categories/hooks/useCategoryApi";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { portalLanguagesApi } from "@/features/portal-config/api";

interface BannerBasicInfoProps {
  form: UseFormReturn<any>;
  activeLangTab: string;
  setActiveLangTab: (tab: string) => void;
  watchedPosition: string;
  designType: "image" | "slogan";
  setDesignType: (type: "image" | "slogan") => void;
}

export function BannerBasicInfo({
  form,
  activeLangTab,
  setActiveLangTab,
  watchedPosition,
  designType,
  setDesignType
}: BannerBasicInfoProps) {
  const { data: categories = [] } = useGetCategoryByGroup("BANNER_POSITION");

  // Languages fetch moved inside component to prevent parent re-renders
  const { data: languages = [] } = useQuery({
    queryKey: ['portal-languages'],
    queryFn: async () => {
      const res: any = await portalLanguagesApi.getActive();
      const all = Array.isArray(res?.data) ? res.data : [];
      return all.filter((c: any) => c.active === 1);
    },
    staleTime: 5 * 60_000,
    placeholderData: [],
  });

  const renderPositions = React.useMemo(() => {
    return categories
      .filter((cat: any) => cat.group === "BANNER_POSITION" && cat.active !== 0)
      .map((cat: any) => ({
        code: cat.code.toLowerCase(),
        name: cat.name,
        sort: cat.sort || 0
      }))
      .sort((a: any, b: any) => a.sort - b.sort);
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Design Type Selector Card */}
      <Card className="shadow-sm border-none bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider flex items-center gap-2">
            🖌️ LỰA CHỌN PHƯƠNG THỨC THIẾT KẾ BANNER
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Chọn thiết kế tự động theo khẩu hiệu tuyên truyền hoặc tải lên ảnh đồ họa có sẵn
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDesignType("image")}
              className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${designType === "image"
                ? "border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-200 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
            >
              <div className={`p-3 rounded-lg ${designType === "image" ? "bg-blue-100 text-blue-600 dark:bg-blue-950" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Ảnh đồ họa thiết kế sẵn</p>
                <p className="text-[11px] opacity-80 mt-0.5">Tải lên tệp hình ảnh PNG, JPG hoặc WebP đã thiết kế hoàn chỉnh</p>
              </div>
              {designType === "image" && (
                <div className="absolute top-3 right-3 text-blue-600">
                  <CheckCircle2 className="h-5 w-5 fill-blue-50 dark:fill-blue-950" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDesignType("slogan")}
              className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${designType === "slogan"
                ? "border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-200 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
            >
              <div className={`p-3 rounded-lg ${designType === "slogan" ? "bg-amber-100 text-amber-600 dark:bg-amber-950" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                <Type className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Khẩu hiệu Tuyên truyền</p>
                <p className="text-[11px] opacity-80 mt-0.5">Thiết kế trực tiếp biểu ngữ dạng chữ đỏ vàng chìm trống đồng, sao vàng truyền thống</p>
              </div>
              {designType === "slogan" && (
                <div className="absolute top-3 right-3 text-amber-600">
                  <CheckCircle2 className="h-5 w-5 fill-amber-50 dark:fill-amber-950" />
                </div>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-slate-700 dark:text-slate-200 tracking-tight">
            <Info className="h-5 w-5 text-blue-500" /> Thông tin Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
              <TabsTrigger value="vi" className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> Tiếng Việt
              </TabsTrigger>
              {languages.filter((l: any) => l.code !== 'vi').map((lang: any) => (
                <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="vi" className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Tiêu đề Banner <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Banner Chào mừng năm mới..." className="text-lg py-6 focus-visible:ring-blue-500 bg-slate-50/50 dark:bg-slate-900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn gọn về mục đích hoặc vị trí sử dụng..."
                        className="min-h-[100px] resize-none bg-slate-50/50 dark:bg-slate-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {languages.filter((l: any) => l.code !== 'vi').map((lang: any) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-6 animate-in fade-in-50 duration-300">
                <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 mb-6 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg"><Globe className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Phiên bản dịch: {lang.name}</p>
                    <p className="text-xs text-blue-700/70 italic">Nhập tên và mô tả bằng {lang.name}</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`translations.${lang.code}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-blue-700">Tên Banner ({lang.name})</FormLabel>
                      <FormControl>
                        <Input placeholder={`Tên bằng ${lang.name}...`} className="text-lg py-6 border-blue-100 bg-blue-50/10 dark:bg-blue-950" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`translations.${lang.code}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-blue-700">Mô tả ({lang.name})</FormLabel>
                      <FormControl>
                        <Textarea placeholder={`Mô tả bằng ${lang.name}...`} className="min-h-[100px] resize-none border-blue-100 bg-blue-50/10 dark:bg-blue-950" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Mã định danh (Slug)</FormLabel>
                  <FormControl>
                    <Input placeholder="banner-homepage-top" className="font-mono bg-muted/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Vị trí hiển thị</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toLowerCase() || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50/50 dark:bg-slate-900">
                        <SelectValue placeholder="Chọn vị trí hiển thị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {renderPositions.map((p: any) => (
                        <SelectItem key={p.code} value={p.code}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-100/70 dark:border-rose-900/30 text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed flex items-start gap-2.5 mt-4 shadow-sm">
            <span className="text-xs shrink-0 mt-0.5 select-none">💡</span>
            <div>
              <p className="font-bold mb-0.5">Lưu ý về thiết kế:</p>
              Chế độ <span className="font-black text-amber-800 dark:text-amber-200 underline">Khẩu hiệu Tuyên truyền</span> sẽ tự động sinh giao diện biểu ngữ cổ động màu đỏ vàng rực rỡ với hoa văn trống đồng, mây sóng hoặc hoa sen nét vẽ chìm cực kỳ trang trọng, sử dụng Tiêu đề làm nhãn cổ động nhỏ và Mô tả làm Slogan chính.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b bg-slate-50/80 dark:bg-slate-900/80">
          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <ExternalLink className="h-4 w-4 text-blue-600" /> Liên kết & Điều hướng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="linkType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Loại liên kết</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="bg-slate-50/50 dark:bg-slate-900"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="internal">Trang nội bộ</SelectItem>
                      <SelectItem value="external">Liên kết bên ngoài</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Mở trang</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="bg-slate-50/50 dark:bg-slate-900"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="_self">Tại tab hiện tại</SelectItem>
                      <SelectItem value="_blank">Trong tab mới</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Đường dẫn liên kết (URL)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="https://..." className="pl-9 bg-slate-50/50 dark:bg-slate-900" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
