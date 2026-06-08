"use client";

import Link from "next/link";
import { MessageSquare, HelpCircle, FileEdit, ArrowRight, ShieldCheck, Network, Activity, Settings2 } from "lucide-react";

const interactionModules = [
  {
    title: "Kiểm duyệt bình luận",
    description: "Hệ thống tự động lọc và quản lý luồng ý kiến đa chiều từ người dân trên các cổng thông tin.",
    href: "/services/posts/interactions/comments",
    icon: MessageSquare,
    theme: "blue",
  },
  {
    title: "Hỏi đáp trực tuyến",
    description: "Tiếp nhận, phân luồng và giải đáp thắc mắc của người dân với tốc độ phản hồi tối ưu.",
    href: "/services/posts/interactions/questions",
    icon: HelpCircle,
    theme: "violet",
  },
  {
    title: "Góp ý chính sách",
    description: "Thu thập ý kiến đóng góp cho các dự thảo văn bản pháp luật và dịch vụ hành chính công.",
    href: "/services/posts/interactions/feedbacks",
    icon: FileEdit,
    theme: "emerald",
  },
];

const integrationModules = [
  {
    title: "Trục liên thông LGSP",
    description: "Đồng bộ hóa luồng dữ liệu văn bản, hồ sơ hai chiều qua Trục liên thông văn bản Quốc gia.",
    href: "/services/posts/interactions/lgsp",
    icon: Network,
    theme: "amber",
  },
  {
    title: "API Gateway & Phân quyền",
    description: "Trung tâm quản trị kết nối API. Giám sát lưu lượng và cấp quyền truy cập thời gian thực.",
    href: "/services/posts/interactions/api-permissions",
    icon: ShieldCheck,
    theme: "rose",
  },
];

const themeStyles: Record<string, any> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-600 dark:text-blue-400", hover: "hover:border-blue-500/50 hover:shadow-blue-500/20" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-600 dark:text-violet-400", hover: "hover:border-violet-500/50 hover:shadow-violet-500/20" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400", hover: "hover:border-emerald-500/50 hover:shadow-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-600 dark:text-amber-400", hover: "hover:border-amber-500/50 hover:shadow-amber-500/20" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "text-rose-600 dark:text-rose-400", hover: "hover:border-rose-500/50 hover:shadow-rose-500/20" },
};

export default function IntegrationHubDashboard() {
  return (
    <div className="-mx-4 -mt-6 -mb-4 md:-mx-8 md:-mt-6 md:-mb-8 min-h-[calc(100vh-64px)] bg-slate-50/50 dark:bg-[#0B1120] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-16">
        
        {/* Hero Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 backdrop-blur-md text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm mb-4">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Hệ thống đang hoạt động ổn định</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trung tâm <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Liên thông & Tương tác</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Quản trị toàn diện các luồng giao tiếp hành chính điện tử. Từ việc tiếp nhận phản hồi công dân đến giám sát kết nối API Gateway và Trục liên thông Quốc gia (LGSP).
          </p>
        </div>

        <div className="space-y-12">
          
          {/* Section 1: Integration & Gateway (Prioritized) */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cổng Kết nối Hệ thống (Integration Hub)</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrationModules.map((module) => {
                const style = themeStyles[module.theme];
                return (
                  <Link key={module.href} href={module.href} className="group block h-full outline-none">
                    <div className={`h-full relative overflow-hidden rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border ${style.border} p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${style.hover}`}>
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      
                      <div className="relative z-10 flex items-start gap-6">
                        <div className={`w-16 h-16 shrink-0 rounded-2xl ${style.bg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ease-out`}>
                          <module.icon className={`w-8 h-8 ${style.icon}`} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{module.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {module.description}
                          </p>
                          <div className="pt-2 flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Cấu hình ngay
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Section 2: Citizen Interaction */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Kênh Giao tiếp Công dân</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interactionModules.map((module) => {
                const style = themeStyles[module.theme];
                return (
                  <Link key={module.href} href={module.href} className="group block h-full outline-none">
                    <div className={`h-full rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border ${style.border} p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${style.hover}`}>
                      <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <module.icon className={`w-6 h-6 ${style.icon}`} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{module.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                        {module.description}
                      </p>
                      <div className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-auto">
                        Truy cập
                        <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
