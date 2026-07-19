import { Card } from "@/components/ui/card";
import { FileText, CheckCircle2, BarChart3, Star } from "lucide-react";

import { usePostStats } from "../../hooks/usePostStats";
import { Text } from "@/components/ui/typography";


export function PostListStats() {
  const { data: serverStats } = usePostStats();
  
  const totalPostsCount = serverStats?.total ?? 0;
  const publishedCount = serverStats?.published ?? 0;
  const totalViewsCount = serverStats?.totalViews ?? 0;
  const submittedCount = serverStats?.pending ?? 0;
  const draftCount = serverStats?.draft ?? 0;
  const featuredCount = 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1 */}
      <Card className="p-5 border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-blue-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tổng bài viết</Text>
            <Text className="font-black text-foreground tracking-tight">{totalPostsCount}</Text>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[10.5px] text-muted-foreground font-bold">
          <Text as="span" className="flex items-center gap-1"><Text as="span" className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Bản nháp: {draftCount}</Text>
          <Text as="span" className="flex items-center gap-1"><Text as="span" className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Chờ duyệt: {submittedCount}</Text>
        </div>
      </Card>

      {/* Card 2 */}
      <Card className="p-5 border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-emerald-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Đã xuất bản</Text>
            <Text className="font-black text-emerald-500 tracking-tight">{publishedCount}</Text>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-border text-[10.5px] text-muted-foreground font-bold flex items-center gap-1">
          <Text as="span" className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <Text as="span">Tỷ lệ xuất bản: {totalPostsCount > 0 ? Math.round((publishedCount / totalPostsCount) * 100) : 0}%</Text>
        </div>
      </Card>

      {/* Card 3 */}
      <Card className="p-5 border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-indigo-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tổng lượt xem</Text>
            <Text className="font-black text-indigo-500 tracking-tight">{totalViewsCount.toLocaleString('vi-VN')}</Text>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-border text-[10.5px] text-muted-foreground font-bold flex items-center gap-1">
          <Text as="span" className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <Text as="span">Trung bình: {totalPostsCount > 0 ? Math.round(totalViewsCount / totalPostsCount).toLocaleString('vi-VN') : 0} lượt/bài</Text>
        </div>
      </Card>

      {/* Card 4 */}
      <Card className="p-5 border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-amber-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Bài viết nổi bật</Text>
            <Text className="font-black text-amber-500 tracking-tight">{featuredCount}</Text>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-border text-[10.5px] text-muted-foreground font-bold flex items-center gap-1">
          <Text as="span" className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <Text as="span">Được đánh dấu ưu tiên hiển thị</Text>
        </div>
      </Card>
    </div>
  );
}
