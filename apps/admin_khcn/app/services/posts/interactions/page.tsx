"use client";

import Link from "next/link";
import { MessageSquare, HelpCircle, FileEdit, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const interactionModules = [
  {
    title: "Kiểm duyệt bình luận",
    description: "Quản lý và kiểm duyệt các bình luận của người dân trên các bài viết, tin tức.",
    href: "/services/posts/interactions/comments",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Hỏi đáp công dân",
    description: "Tiếp nhận và trả lời các câu hỏi, vướng mắc của người dân gửi đến hệ thống.",
    href: "/services/posts/interactions/questions",
    icon: HelpCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Góp ý dự thảo / dịch vụ",
    description: "Quản lý các ý kiến đóng góp của người dân cho các dự thảo văn bản hoặc dịch vụ công.",
    href: "/services/posts/interactions/feedbacks",
    icon: FileEdit,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

export default function InteractionsDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Tương tác công dân</h1>
      <p className="text-gray-500 mb-8">Quản lý các kênh giao tiếp và phản hồi từ người dân theo Nghị định 42 & 147.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {interactionModules.map((module) => (
          <Card key={module.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                <module.icon className={`w-6 h-6 ${module.color}`} />
              </div>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={module.href}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Truy cập quản lý <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
