/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Widget } from "../../core/types";
import { NewsListData } from "./news-list.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesQuery } from "../../services/dataBinding";
import { Loader2, Settings2 } from "lucide-react";

interface NewsListEditorProps {
  widget: Widget<NewsListData>;
  onChangeData: (data: NewsListData) => void;
  activeLang: string;
}

// eslint-disable-next-line unused-imports/no-unused-vars
export const NewsListEditor: React.FC<NewsListEditorProps> = ({ widget, onChangeData, activeLang }) => {
  const { data: categories, isLoading } = useCategoriesQuery();

  const newsCategories = React.useMemo(() => {
    return Array.isArray(categories) ? categories.filter((c: any) => c.group === "NEWS_CATEGORY") : [];
  }, [categories]);

  const handleCategoryChange = (val: string) => {
    const limit = widget.data?.limit || 6;
    if (val === "all") {
      onChangeData({
        limit,
        categoryId: null,
        selectedCategoryName: "Tất cả tin tức",
      });
    } else {
      const selected = newsCategories.find((c: any) => c.id.toString() === val);
      onChangeData({
        limit,
        categoryId: parseInt(val),
        selectedCategoryName: selected?.name || "Chuyên mục",
      });
    }
  };

  const handleLimitChange = (val: string) => {
    const limit = parseInt(val) || 6;
    onChangeData({
      limit,
      categoryId: widget.data?.categoryId || null,
      selectedCategoryName: widget.data?.selectedCategoryName || "Tất cả tin tức",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          Chuyên mục nguồn tin
        </Label>
        {isLoading ? (
          <div className="h-12 flex items-center justify-center bg-slate-50 rounded-2xl">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          </div>
        ) : (
          <Select
            value={widget.data?.categoryId?.toString() || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-4 focus:ring-indigo-50/50">
              <SelectValue placeholder="Chọn chuyên mục..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
              <SelectItem value="all">Tất cả tin tức (Mặc định)</SelectItem>
              {newsCategories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          Số lượng bài viết hiển thị
        </Label>
        <Input
          type="number"
          min={1}
          max={20}
          value={widget.data?.limit ?? 6}
          onChange={(e) => handleLimitChange(e.target.value)}
          className="h-12 px-5 rounded-2xl border-slate-100 dark:border-slate-800 text-[13px] font-bold bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50/50"
        />
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex gap-3">
        <Settings2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase text-slate-500">Tự động đồng bộ</span>
          <span className="text-[10px] text-slate-400 font-bold leading-normal">
            Dữ liệu tin tức sẽ được kéo trực tiếp từ cơ sở dữ liệu dựa trên chuyên mục đã chọn ở môi trường Production.
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsListEditor;
