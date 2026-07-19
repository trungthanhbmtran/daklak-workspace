import React from "react";
import { Widget } from "../../core/types";
import { LeadershipData } from "./leadership.schema";
import { User, Mail, Phone, ShieldCheck } from "lucide-react";

interface LeadershipRenderProps {
  widget: Widget<LeadershipData>;
  activeLang: string;
}

export const LeadershipRender: React.FC<LeadershipRenderProps> = ({ widget, activeLang }) => {
  const leaders = widget.data?.leaders || [];

  return (
    <div className="w-full space-y-6">
      {widget.title?.[activeLang] && (
        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 border-l-4 border-indigo-600 pl-3">
          {widget.title[activeLang]}
        </h4>
      )}

      {leaders.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
          <p className="text-xs font-bold text-slate-350 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
            Chưa lựa chọn thành viên ban lãnh đạo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {leaders.map((leader) => (
            <div 
              key={leader.id} 
              className="group p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center space-y-4"
            >
              {/* Profile Avatar Wrapper */}
              <div className="relative w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-950 p-1 border border-slate-100 dark:border-slate-800/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {leader.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={leader.avatarUrl} 
                    alt={leader.fullName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                )}
                {/* Official verified badge */}
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 text-white border-2 border-white dark:border-slate-900 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Leader Meta Data */}
              <div className="space-y-1 w-full">
                <h5 className="text-xs font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">
                  {leader.fullName}
                </h5>
                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider leading-relaxed min-h-[36px] flex items-center justify-center px-2">
                  {leader.positionName || "Lãnh đạo đơn vị"}
                </p>
              </div>

              {/* Contact Information */}
              {(leader.email || leader.phoneNumber) && (
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 w-full flex flex-col gap-2 text-[10px] text-slate-450 dark:text-slate-550 font-bold items-start px-2">
                  {leader.phoneNumber && (
                    <div className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors truncate w-full">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{leader.phoneNumber}</span>
                    </div>
                  )}
                  {leader.email && (
                    <div className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors truncate w-full">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{leader.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadershipRender;
