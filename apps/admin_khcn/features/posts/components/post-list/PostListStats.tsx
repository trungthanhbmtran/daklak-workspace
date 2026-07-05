import { Card } from "@/components/ui/card";
import { FileText, CheckCircle2, BarChart3, Star } from "lucide-react";

import { usePostStats } from "../../hooks/usePostStats";

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
      <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-blue-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng bài viết</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">{totalPostsCount}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-100/30 dark:border-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Bản nháp: {draftCount}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Chờ duyệt: {submittedCount}</span>
        </div>
      </Card>

      {/* Card 2 */}
      <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-emerald-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đã xuất bản</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{publishedCount}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <span>Tỷ lệ xuất bản: {totalPostsCount > 0 ? Math.round((publishedCount / totalPostsCount) * 100) : 0}%</span>
        </div>
      </Card>

      {/* Card 3 */}
      <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-indigo-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng lượt xem</p>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{totalViewsCount.toLocaleString('vi-VN')}</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span>Trung bình: {totalPostsCount > 0 ? Math.round(totalViewsCount / totalPostsCount).toLocaleString('vi-VN') : 0} lượt/bài</span>
        </div>
      </Card>

      {/* Card 4 */}
      <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-amber-500 min-h-[120px]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bài viết nổi bật</p>
            <p className="text-3xl font-black text-amber-500 dark:text-amber-400 tracking-tight">{featuredCount}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-100/30 dark:border-amber-900/20 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>Được đánh dấu ưu tiên hiển thị</span>
        </div>
      </Card>
    </div>
  );
}
