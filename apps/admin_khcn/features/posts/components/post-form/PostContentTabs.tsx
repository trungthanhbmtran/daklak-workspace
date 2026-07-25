import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Globe, Loader2, Sparkles, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { convertToSlug } from "@/lib/slug";
import { postsApi } from "../../api";
import { Category } from "../../types";

const LexicalEditorDynamic = dynamic(
  () => import("../editor/LexicalEditor").then((mod) => mod.LexicalEditor),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-xl border border-dashed flex items-center justify-center text-sm text-muted-foreground">Khởi tạo trình soạn thảo...</div>
  }
);

interface Props {
  languages: any[];
  categories: Category[];
  postData?: any;
}

export function PostContentTabs({ languages, categories, postData }: Props) {
  const { control, getValues, setValue, watch, formState } = useFormContext();
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newTitle = e.target.value;
    onChangeOriginal(newTitle);
    if (!formState.dirtyFields.slug) {
      setValue("slug", convertToSlug(newTitle), { shouldValidate: true });
    }
  };

  const handleTranslationTitleChange = (langCode: string, e: React.ChangeEvent<HTMLInputElement>, onChangeOriginal: (...event: any[]) => void) => {
    const newTitle = e.target.value;
    onChangeOriginal(newTitle);

    const slugName = `translations.${langCode}.slug` as any;
    const isSlugDirty = (formState.dirtyFields as any).translations?.[langCode]?.slug;

    if (!isSlugDirty) {
      setValue(slugName, convertToSlug(newTitle), { shouldValidate: true });
    }
  };

  const handleAutoTranslate = async (langCode: string) => {
    const title = getValues("title");
    const description = getValues("description");
    const content = getValues("content");

    if (!title) {
      toast.error("Vui lòng nhập tiêu đề tiếng Việt trước khi dịch");
      return;
    }

    setIsTranslating(prev => ({ ...prev, [langCode]: true }));
    try {
      const resTitle = await postsApi.translate(title, langCode);
      const translatedTitle = resTitle.translated_text;
      setValue(`translations.${langCode}.title`, translatedTitle, { shouldDirty: true });

      const translatedSlug = convertToSlug(translatedTitle);
      setValue(`translations.${langCode}.slug`, translatedSlug, { shouldDirty: true });

      if (description) {
        const resDesc = await postsApi.translate(description, langCode);
        setValue(`translations.${langCode}.description`, resDesc.translated_text, { shouldDirty: true });
      }

      if (content) {
        const resContent = await postsApi.translate(content, langCode);
        setValue(`translations.${langCode}.content`, resContent.translated_text, { shouldDirty: true });
      }

      toast.success(`Đã dịch xong sang ${languages.find(l => l.code === langCode)?.name}`);
    } catch (error) {
      console.error("Translation error:", error);
      toast.error((error as any)?.response?.data?.message || "Lỗi khi dịch tự động");
    } finally {
      setIsTranslating(prev => ({ ...prev, [langCode]: false }));
    }
  };

  return (
    <Card className="shadow-sm border-none bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-foreground tracking-tight">
          <FileText className="h-5 w-5 text-blue-500" /> Thông tin bài viết
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        {postData?.autoModerationStatus && (
          <div className={`p-4 rounded-xl border flex items-start gap-4 mb-2 ${postData.autoModerationStatus === 'SAFE'
            ? 'bg-green-50 border-green-100 text-green-800'
            : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
            {postData.autoModerationStatus === 'SAFE' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
            )}
            <div>
              <Text className="font-bold uppercase tracking-tight">Kiểm duyệt tự động: {postData.autoModerationStatus === 'SAFE' ? 'Hợp lệ' : 'Cảnh báo'}</Text>
              <Text className="mt-1 opacity-90">{postData.autoModerationNote}</Text>
            </div>
          </div>
        )}

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
            <FormField control={control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Tiêu đề chính <Text as="span" className="text-destructive">*</Text></FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: Bí quyết học lập trình hiệu quả..."
                    className="text-lg py-6 focus-visible:ring-blue-500 bg-muted/50"
                    {...field}
                    onChange={(e) => handleTitleChange(e, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Chuyên mục</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="bg-muted/50"><SelectValue placeholder="Chọn chuyên mục" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories?.map((cat: Category) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Đường dẫn tĩnh (Slug)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Text as="span" className="absolute left-3 top-2.5 text-muted-foreground font-mono">/</Text>
                      <Input className="font-mono text-sm bg-muted/30 pl-6" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Tóm tắt ngắn (Description)</FormLabel>
                <FormControl><Textarea placeholder="Mô tả nội dung bài viết trong khoảng 160 ký tự..." className="min-h-[80px] resize-none bg-muted/50" {...field} value={field.value ?? ""} /></FormControl>
                <FormDescription className="text-[11px]">Sẽ hiển thị trên kết quả tìm kiếm Google và danh sách bài viết.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="pt-4 border-t space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                <Label className="font-bold text-base text-slate-800">Nội dung chi tiết (TIẾNG VIỆT)</Label>
              </div>

              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <LexicalEditorDynamic key={`vi-wysiwyg-${field.value ? 'has-val' : 'empty'}`} value={field.value || ""} onChange={field.onChange} />
                )}
              />
              {formState.errors.content && <Text className="text-destructive font-medium">{formState.errors.content.message as string}</Text>}
            </div>
          </TabsContent>

          {languages.filter(l => l.code !== 'vi').map(lang => (
            <TabsContent key={lang.code} value={lang.code} className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <Text className="font-bold text-blue-900">Phiên bản dịch: {lang.name}</Text>
                    <Text className="text-blue-700/70 italic text-[11px]">Nhập nội dung tương ứng cho ngôn ngữ này</Text>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 gap-2 shadow-sm"
                  onClick={() => handleAutoTranslate(lang.code)}
                  disabled={isTranslating[lang.code]}
                >
                  {isTranslating[lang.code] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Dịch tự động (AI)
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={control} name={`translations.${lang.code}.title`} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-700">Tiêu đề ({lang.name})</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Nhập tiêu đề bằng ${lang.name}...`}
                        className="text-lg py-6 focus-visible:ring-blue-500 border-blue-100 bg-blue-50/10"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => handleTranslationTitleChange(lang.code, e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={control} name={`translations.${lang.code}.slug`} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-700">Slug / Đường dẫn ({lang.name})</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="news-and-events"
                        className="font-mono text-sm border-blue-100 bg-blue-50/10"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(convertToSlug(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={control} name={`translations.${lang.code}.description`} render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-blue-700">Tóm tắt ({lang.name})</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Mô tả ngắn bằng ${lang.name}...`}
                      className="min-h-[100px] resize-none focus-visible:ring-blue-500 border-blue-100 bg-blue-50/10"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="pt-4 border-t border-blue-100/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                  <Label className="font-bold text-base text-blue-700">Nội dung chi tiết ({lang.code.toUpperCase()})</Label>
                </div>

                <Controller
                  control={control}
                  name={`translations.${lang.code}.content`}
                  render={({ field }) => (
                    <LexicalEditorDynamic key={`${lang.code}-wysiwyg-${field.value ? 'has-val' : 'empty'}`} value={field.value || ""} onChange={field.onChange} />
                  )}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
