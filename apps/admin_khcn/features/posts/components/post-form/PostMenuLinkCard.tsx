import { Link2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";

interface Props {
  isEdit: boolean;
  editId?: string | null;
}

export function PostMenuLinkCard({ isEdit, editId }: Props) {
  const { watch } = useFormContext();
  
  const currentSlug = watch("slug") || editId || "";
  const currentEnSlug = (watch("translations.en.slug") as string) || currentSlug;

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-5 border-b bg-muted/80">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Link2 className="h-4 w-4 text-blue-600" /> Đường dẫn cấu hình Menu
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {isEdit && editId ? (
          <div className="space-y-4">
            <Text className="text-muted-foreground leading-relaxed">
              Tùy thuộc vào mục đích sử dụng, hãy sao chép đường dẫn tương ứng dưới đây để gán vào Menu:
            </Text>

            <div className="space-y-3">
              <div className="border-t pt-3 first:border-0 first:pt-0">
                <Text as="span" className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-2">
                  1. Dạng Trang tĩnh CMS (Giới thiệu, Liên hệ...)
                </Text>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                    <Text as="span" className="font-semibold text-foreground">Tiếng Việt</Text>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <code className="text-[11px] font-mono text-muted-foreground break-all">/trang/{currentSlug}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                        onClick={() => {
                          void navigator.clipboard.writeText(`/trang/${currentSlug}`);
                          toast.success("Đã sao chép đường dẫn trang tĩnh tiếng Việt!");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                    <Text as="span" className="font-semibold text-foreground">Tiếng Anh (English)</Text>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <code className="text-[11px] font-mono text-muted-foreground break-all">/en/page/{currentEnSlug}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                        onClick={() => {
                          void navigator.clipboard.writeText(`/en/page/${currentEnSlug}`);
                          toast.success("Đã sao chép đường dẫn trang tĩnh tiếng Anh!");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <Text as="span" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  2. Dạng Tin tức / Bài viết thông thường
                </Text>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                    <Text as="span" className="font-semibold text-foreground">Tiếng Việt</Text>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <code className="text-[11px] font-mono text-muted-foreground break-all">/tin-tuc/{currentSlug}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                        onClick={() => {
                          void navigator.clipboard.writeText(`/tin-tuc/${currentSlug}`);
                          toast.success("Đã sao chép đường dẫn tin tức tiếng Việt!");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 bg-muted p-2 rounded border border-slate-100 text-xs">
                    <Text as="span" className="font-semibold text-foreground">Tiếng Anh (English)</Text>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <code className="text-[11px] font-mono text-muted-foreground break-all">/en/news/{currentEnSlug}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-blue-600 shrink-0"
                        onClick={() => {
                          void navigator.clipboard.writeText(`/en/news/${currentEnSlug}`);
                          toast.success("Đã sao chép đường dẫn tin tức tiếng Anh!");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground italic text-center py-2">
            Đường dẫn liên kết cấu hình Menu sẽ khả dụng sau khi lưu bài viết lần đầu.
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
