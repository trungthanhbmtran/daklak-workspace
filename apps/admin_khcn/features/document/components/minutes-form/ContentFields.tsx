import { useFormContext } from "react-hook-form";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ContentFields() {
  const { control } = useFormContext();

  return (
    <>
      <div className="md:col-span-12">
        <FormField control={control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Nội dung & Diễn biến cuộc họp
            </FormLabel>
            <FormControl>
              <Textarea placeholder="Ghi nhận chi tiết các ý kiến phát biểu và thảo luận..." className="min-h-[250px] leading-relaxed resize-none bg-muted/5 border-primary/10 focus:bg-background" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="md:col-span-12">
        <FormField control={control} name="conclusion" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kết luận & Nghị quyết
            </FormLabel>
            <FormControl>
              <Textarea placeholder="Các quyết định cuối cùng được thống nhất..." className="min-h-[100px] border-emerald-100 bg-emerald-50/10 focus:bg-background" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </>
  );
}
