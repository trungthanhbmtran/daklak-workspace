'use client';
import { useParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Link } from "@/i18n/routing";

export default function BudgetDetailPage() {
  const { category, slug } : any = useParams();

  // Giả lập nội dung fetch từ API theo slug
  const articleContent = {
    title: slug.toString().replace(/-/g, ' ').toUpperCase(),
    date: "01/01/2026",
    agency: "Sở Tài chính",
    content: "Đây là nội dung chi tiết của văn bản công khai ngân sách. Nội dung này thường bao gồm các căn cứ pháp lý, bảng tổng hợp thu chi và các thuyết minh chi tiết về tình hình tài chính địa phương...",
    files: [
      { name: "Văn bản chi tiết.pdf", size: "1,5 MB", type: "PDF" },
      { name: "Phụ lục số liệu.xlsx", size: "450 KB", type: "Excel" }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Điều hướng */}
      <Breadcrumbs color="primary">
        <BreadcrumbItem as={Link} href="/">Trang chủ</BreadcrumbItem>
        <BreadcrumbItem as={Link} href="/publicbudget">Ngân sách</BreadcrumbItem>
        <BreadcrumbItem className="capitalize">{category.toString()}</BreadcrumbItem>
        <BreadcrumbItem>Chi tiết văn bản</BreadcrumbItem>
      </Breadcrumbs>

      {/* Tiêu đề văn bản */}
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-default-800 leading-tight">
          {articleContent.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-default-500">
          <span>Ban hành: <b>{articleContent.agency}</b></span>
          <span>Ngày đăng: <b>{articleContent.date}</b></span>
        </div>
      </header>

      <Divider />

      {/* Nội dung văn bản */}
      <article className="prose prose-slate max-w-none py-4 text-default-700 leading-relaxed">
        <p className="whitespace-pre-line">{articleContent.content}</p>
        
        {/* Khu vực hiển thị bảng số liệu tóm tắt nếu có */}
        <Card className="my-8 bg-default-50 border-none shadow-none">
          <CardBody className="p-6">
            <h3 className="text-lg font-bold mb-4">Số liệu tóm tắt (Ví dụ)</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Chỉ tiêu</th>
                  <th className="py-2 text-right">Số tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Tổng thu ngân sách</td><td className="py-2 text-right font-semibold">1.500.000.000</td></tr>
                <tr className="border-b"><td className="py-2">Tổng chi ngân sách</td><td className="py-2 text-right font-semibold">1.250.000.000</td></tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </article>

      {/* Danh sách File đính kèm */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold">Tài liệu đính kèm</h3>
        <div className="grid gap-3">
          {articleContent.files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 text-primary flex items-center justify-center rounded-lg font-bold text-xs">
                  {file.type}
                </div>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-default-400">{file.size}</p>
                </div>
              </div>
              <Button size="sm" color="primary" variant="ghost">Tải xuống</Button>
            </div>
          ))}
        </div>
      </section>

      <footer className="pt-10">
        <Button as={Link} href="/publicbudget" variant="light" color="primary">
          ← Quay lại danh sách
        </Button>
      </footer>
    </div>
  );
}