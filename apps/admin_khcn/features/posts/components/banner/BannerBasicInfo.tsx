import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Globe, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface BannerBasicInfoProps {
  form: UseFormReturn<any>;
  languages: any[];
  activeLangTab: string;
  setActiveLangTab: (tab: string) => void;
  watchedPosition: string;
}

export function BannerBasicInfo({
  form,
  languages,
  activeLangTab,
  setActiveLangTab,
  watchedPosition
}: BannerBasicInfoProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-none bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-slate-700 tracking-tight">
            <Info className="h-5 w-5 text-blue-500" /> Thông tin Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
              <TabsTrigger value="vi" className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> Tiếng Việt
              </TabsTrigger>
              {languages.filter(l => l.code !== 'vi').map(lang => (
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
                      <Input placeholder="Ví dụ: Banner Chào mừng năm mới..." className="text-lg py-6 focus-visible:ring-blue-500 bg-slate-50/50" {...field} />
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
                        className="min-h-[100px] resize-none bg-slate-50/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {languages.filter(l => l.code !== 'vi').map(lang => (
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
                        <Input placeholder={`Tên bằng ${lang.name}...`} className="text-lg py-6 border-blue-100 bg-blue-50/10" {...field} />
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
                        <Textarea placeholder={`Mô tả bằng ${lang.name}...`} className="min-h-[100px] resize-none border-blue-100 bg-blue-50/10" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="bg-slate-50/50"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="top">Phía trên (Top Header)</SelectItem>
                      <SelectItem value="middle">Giữa trang (Body)</SelectItem>
                      <SelectItem value="bottom">Phía dưới (Footer)</SelectItem>
                      <SelectItem value="custom">Khẩu hiệu Tuyên truyền (Patriotic Slogan)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
                    * Vị trí &quot;Khẩu hiệu Tuyên truyền&quot; sẽ sinh giao diện cờ đỏ sao vàng cực kỳ sang trọng trên Cổng thông tin, sử dụng Tiêu đề làm khẩu hiệu nhỏ, và Nội dung mô tả làm Slogan chính. Không cần tải ảnh lên.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b bg-slate-50/80">
          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
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
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                    <Input placeholder="https://..." className="pl-9 bg-slate-50/50" {...field} />
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
