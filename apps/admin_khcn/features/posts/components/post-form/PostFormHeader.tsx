import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { useFormContext } from "react-hook-form";

interface Props {
  onBack: () => void;
  isEdit: boolean;
  isPending: boolean;
  onSubmitForm: () => void;
}

export function PostFormHeader({ onBack, isEdit, isPending, onSubmitForm }: Props) {
  const { watch, setValue } = useFormContext();
  const status = watch("status");

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm" iconStart={<ArrowLeft className="h-4 w-4" />}></Button>
        <div>
          <Heading level="h1" className="font-bold tracking-tight">{isEdit ? "Chỉnh sửa nội dung" : "Tạo bài viết mới"}</Heading>
          <Text className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Bản thảo nội dung & cấu hình</Text>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => {
            setValue("status", "DRAFT");
            onSubmitForm();
          }}
        >
          Lưu nháp
        </Button>

        {(!isEdit || status === "DRAFT" || status === "REJECTED") && (
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-500/20"
            disabled={isPending}
            onClick={() => {
              setValue("status", "SUBMITTED");
              onSubmitForm();
            }}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isEdit ? "Gửi lại phê duyệt" : "Gửi phê duyệt"}
          </Button>
        )}

        {isEdit && (status !== "DRAFT" && status !== "REJECTED") && (
          <Button
            type="button"
            onClick={onSubmitForm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] shadow-lg shadow-emerald-500/20"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu bài viết
          </Button>
        )}
      </div>
    </div>
  );
}
