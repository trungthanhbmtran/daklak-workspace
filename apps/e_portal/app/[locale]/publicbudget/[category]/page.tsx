'use client';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs"; // Giả định HeroUI có
import { Link } from "@heroui/link";
import { useParams } from "next/navigation";

export default function ArticleDetailPage( ) {
  const category = useParams().category;
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs>
        <BreadcrumbItem href="/">Trang chủ</BreadcrumbItem>
        <BreadcrumbItem href="/cong-khai-tinh">Công khai ngân sách</BreadcrumbItem>
        <BreadcrumbItem>Chi tiết báo cáo</BreadcrumbItem>
      </Breadcrumbs>

      {/* 2. Header Bài viết */}
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          Dự toán ngân sách nhà nước năm 2026 tỉnh Đắk Lắk
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-default-500">
          <span>📅 Đăng ngày: 01/01/2026</span>
          <span>👁️ 1,234 lượt xem</span>
          <span>📂 Chuyên mục: Dự toán ngân sách</span>
        </div>
      </header>

      <Divider />

      {/* 3. Nội dung tóm tắt */}
      <article className="prose prose-slate max-w-none text-justify">
        <p>Căn cứ Luật Ngân sách nhà nước, Sở Tài chính công bố dự toán ngân sách...</p>
        {/* Nội dung bài viết đổ từ CMS ở đây */}
      </article>

      {/* 4. Danh sách File đính kèm (Quan trọng nhất) */}
      <Card className="bg-default-50 border-none" shadow="sm">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tài liệu đính kèm</h3>
          <div className="space-y-3">
            {[ 
              { name: "Bao-cao-du-toan-2026.pdf", size: "1.2 MB", type: "PDF" },
              { name: "Phu-luc-so-lieu-chi-tiet.xlsx", size: "500 KB", type: "Excel" }
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-default-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 text-primary rounded font-bold text-xs">
                    {file.type}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-default-400">{file.size}</p>
                  </div>
                </div>
                <Button size="sm" variant="flat" color="primary">Tải về</Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 5. Footer bài viết & Liên quan */}
      <footer className="pt-10 space-y-6">
        <div className="flex justify-between items-center">
           <Button variant="light" startContent={<span>⬅️</span>}>Bài trước</Button>
           <Button variant="light" endContent={<span>➡️</span>}>Bài sau</Button>
        </div>
        
        <div className="bg-default-100 p-4 rounded-lg">
           <h4 className="font-bold mb-2">Các báo cáo liên quan:</h4>
           <ul className="list-disc list-inside text-sm space-y-1 text-primary">
              <li><Link href="#">Dự toán ngân sách năm 2025</Link></li>
              <li><Link href="#">Quyết toán ngân sách năm 2024</Link></li>
           </ul>
        </div>
      </footer>
    </div>
  );
}