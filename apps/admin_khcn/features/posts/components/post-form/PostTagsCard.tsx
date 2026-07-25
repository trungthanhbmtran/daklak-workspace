import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { useFormContext } from "react-hook-form";

export function PostTagsCard() {
  const { watch, getValues, setValue } = useFormContext();
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !getValues("tags").includes(val)) {
      setValue("tags", [...getValues("tags"), val]);
      setTagInput("");
    }
  };

  const tags = watch("tags") || [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-5 border-b bg-muted/80">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-600" /> Nhãn gắn (Tags)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nhập và nhấn Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="h-9 focus-visible:ring-blue-500"
          />
          <Button type="button" size="sm" variant="secondary" onClick={addTag}>
            Thêm
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.length > 0 ? (
            tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-default">
                {tag}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setValue("tags", getValues("tags").filter((t: string) => t !== tag))} />
              </Badge>
            ))
          ) : (
            <Text className="text-[11px] text-muted-foreground italic px-1 text-center w-full">Thêm từ khóa để SEO bài viết tốt hơn</Text>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
