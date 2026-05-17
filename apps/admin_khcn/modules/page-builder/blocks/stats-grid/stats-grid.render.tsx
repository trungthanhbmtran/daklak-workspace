import React from "react";
import { Widget } from "../../core/types";
import { StatsGridData } from "./stats-grid.schema";
import { Award, Target, TrendingUp, Users } from "lucide-react";

interface StatsGridRenderProps {
  widget: Widget<StatsGridData>;
  activeLang: string;
}

export const StatsGridRender: React.FC<StatsGridRenderProps> = ({ widget, activeLang }) => {
  const items = widget.data?.items || [];

  // Reusable icons for visual richness
  const icons = [<Award className="w-5 h-5 text-indigo-500" />, <Target className="w-5 h-5 text-emerald-500" />, <TrendingUp className="w-5 h-5 text-blue-500" />, <Users className="w-5 h-5 text-amber-500" />];

  return (
    <div className="w-full">
      {widget.title?.[activeLang] && (
        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 border-l-4 border-indigo-600 pl-3">
          {widget.title[activeLang]}
        </h4>
      )}

      {items.length === 0 ? (
        <div className="py-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
          <p className="text-xs font-bold text-slate-350 dark:text-slate-600 uppercase tracking-widest">Chưa thiết lập số liệu thống kê</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden group p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col items-center text-center space-y-3"
            >
              {/* Soft decorative blur circle */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-xl group-hover:scale-125 transition-transform" />

              {/* Icon Container */}
              <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-950/50 flex items-center justify-center border border-slate-100/50 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {icons[idx % icons.length]}
              </div>

              <div className="space-y-1 z-10">
                <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-indigo-500 transition-colors">
                  {item.value}
                </span>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                  {item.label[activeLang as "vi" | "en"] || item.label.vi}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsGridRender;
