"use client";

import Link from "next/link";
import { MessageSquare, HelpCircle, FileEdit, ArrowRight, ShieldCheck, Network } from "lucide-react";

const interactionModules = [
  {
    title: "Kiểm duyệt bình luận",
    description: "Quản lý và kiểm duyệt các bình luận của người dân trên các bài viết, tin tức.",
    href: "/services/posts/interactions/comments",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-50 to-white",
  },
  {
    title: "Hỏi đáp công dân",
    description: "Tiếp nhận và trả lời các câu hỏi, vướng mắc của người dân gửi đến hệ thống.",
    href: "/services/posts/interactions/questions",
    icon: HelpCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-50 to-white",
  },
  {
    title: "Góp ý dự thảo / dịch vụ",
    description: "Quản lý các ý kiến đóng góp của người dân cho các dự thảo văn bản hoặc dịch vụ công.",
    href: "/services/posts/interactions/feedbacks",
    icon: FileEdit,
    color: "text-green-600",
    bgColor: "bg-green-100",
    gradient: "from-green-50 to-white",
  },
];

const integrationModules = [
  {
    title: "Trục liên thông (LGSP)",
    description: "Nhận và gửi văn bản, hồ sơ thông qua trục liên thông quốc gia (LGSP).",
    href: "/services/posts/interactions/lgsp",
    icon: Network,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    gradient: "from-orange-50 to-white",
  },
  {
    title: "Phân quyền API Gateway",
    description: "Cấu hình động quyền truy cập (Roles/Permissions) cho các API Endpoint tại Gateway.",
    href: "/services/posts/interactions/api-permissions",
    icon: ShieldCheck,
    color: "text-red-600",
    bgColor: "bg-red-100",
    gradient: "from-red-50 to-white",
  },
];

export default function InteractionsDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Tương tác công dân & Hệ thống</h1>
        <p className="text-gray-500 text-lg max-w-3xl">
          Khu vực quản lý các kênh giao tiếp từ người dân (Nghị định 42 & 147) cũng như cấu hình bảo mật kết nối API và Trục liên thông quốc gia.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold border-b pb-2 mb-4 text-gray-800">1. Tương tác với Công dân</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {interactionModules.map((module) => (
              <Link key={module.href} href={module.href} className="group block h-full">
                <div className={`h-full rounded-2xl border bg-linear-to-br ${module.gradient} p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`w-14 h-14 rounded-xl ${module.bgColor} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className={`w-7 h-7 ${module.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {module.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-primary mt-auto">
                    Truy cập quản lý <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-xl font-bold border-b pb-2 mb-4 text-gray-800">2. Kết nối & Bảo mật Hệ thống (API)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrationModules.map((module) => (
              <Link key={module.href} href={module.href} className="group block h-full">
                <div className={`h-full rounded-2xl border bg-linear-to-br ${module.gradient} p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`w-14 h-14 rounded-xl ${module.bgColor} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className={`w-7 h-7 ${module.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {module.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-primary mt-auto">
                    Thiết lập ngay <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
