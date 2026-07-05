import React from "react";
import { Widget } from "../../core/types";
import { NewsListData } from "./news-list.schema";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";

interface NewsListRenderProps {
  widget: Widget<NewsListData>;
  activeLang: string;
}

export const NewsListRender: React.FC<NewsListRenderProps> = ({ widget, activeLang }) => {
  const limit = widget.data?.limit || 6;
  const categoryName = widget.data?.selectedCategoryName || "Tất cả tin tức";

  // Mock articles mapping to limit for high-fidelity CMS preview
  const mockArticles = Array.from({ length: limit }).map((_, i) => ({
    id: i + 1,
    title: {
      vi: `UBND tỉnh họp bàn về kế hoạch thúc đẩy nghiên cứu chuyển giao công nghệ lần thứ ${i + 1}`,
      en: `Provincial People's Committee discusses tech-transfer research acceleration plan #${i + 1}`
    },
    date: `1${i + 5}/05/2026`,
    desc: {
      vi: "Đại diện các sở ngành đã thảo luận và đề xuất các giải pháp gỡ vướng về nguồn vốn cho doanh nghiệp khởi nghiệp đổi mới sáng tạo...",
      en: "Representatives of departments discussed and proposed funding solutions for innovative startup businesses..."
    },
    img: `https://picsum.photos/400/250?random=${i + 10}`,
  }));

  return (
    <div className="w-full space-y-6">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tin tức & Sự kiện</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {widget.title?.[activeLang] || `Chuyên mục: ${categoryName}`}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">
          Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockArticles.map((art) => (
          <div
            key={art.id}
            className="group rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <img
                src={art.img}
                alt="News"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-xl text-[8px] font-black text-white uppercase tracking-widest">
                {categoryName}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{art.date}</span>
                </div>
                <h5 className="text-xs font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {art.title[activeLang as "vi" | "en"] || art.title.vi}
                </h5>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-3 leading-relaxed">
                  {art.desc[activeLang as "vi" | "en"] || art.desc.vi}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end text-[9px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest transition-colors gap-1">
                Chi tiết <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsListRender;
