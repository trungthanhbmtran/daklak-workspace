'use client';
import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Link } from "@/i18n/routing";

const BUDGET_DATA = [
  {
    id: "bao-cao",
    title: "Báo cáo chuyên đề",
    items: [
      { name: "Báo cáo NSNN cho công dân", slug: "bao-cao-nsnn-cho-cong-dan", year: "2026", status: "Mới" },
      { name: "Tài chính công", slug: "tai-chinh-cong", year: "2025", status: "Cập nhật" },
      { name: "Công bố nợ chính quyền địa phương", slug: "cong-bo-no-chinh-quyen-dia-phuong", year: "2026", status: "Mới" },
      { name: "Báo cáo thẩm tra ngân sách của HĐND tỉnh", slug: "bao-cao-tham-tra-ngan-sach-hdnd-tinh", year: "2025", status: "Đã duyệt" },
      { name: "Báo cáo kết quả thực hiện các kiến nghị kiểm toán", slug: "bao-cao-ket-qua-thuc-hien-kien-nghi-kiem-toan", year: "2025", status: "Hoàn thành" },
    ]
  },
  {
    id: "cong-khai-tinh",
    title: "Ngân sách cấp tỉnh",
    items: [
      { name: "Dự toán ngân sách", slug: "du-toan-ngan-sach-tinh", year: "2026", status: "Mới" },
      { name: "Thực hiện dự toán ngân sách", slug: "thuc-hien-du-toan-ngan-sach-tinh", year: "2026", status: "Đang thực hiện" },
      { name: "Thuyết minh quyết toán ngân sách", slug: "thuyet-minh-quyet-toan-ngan-sach-tinh", year: "2025", status: "Đã kết thúc" },
    ]
  },
  {
    id: "so-tai-chinh",
    title: "Sở Tài chính",
    items: [
      { name: "Dự toán ngân sách chi tiết", slug: "du-toan-ngan-sach-so", year: "2026", status: "Mới" },
      { name: "Tình hình thực hiện dự toán", slug: "tinh-hinh-thuc-hien-du-toan-ngan-sach-so", year: "2026", status: "Mới" },
    ]
  }
];

export default function PublicBudgetPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. Hero Section - Khẳng định tính chính thống */}
      <section className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                CÔNG KHAI <span className="text-primary">NGÂN SÁCH</span>
              </h1>
              <p className="text-slate-500 max-w-xl">
                Cung cấp dữ liệu minh bạch, kịp thời về tình hình thu chi và dự toán ngân sách nhà nước theo quy định hiện hành.
              </p>
            </div>
            {/* Thanh tìm kiếm nhanh */}
            <div className="w-full md:w-80">
              <Input
                placeholder="Tìm kiếm báo cáo..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                classNames={{ inputWrapper: "bg-white" }}
                startContent={<span className="text-slate-400">🔍</span>}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6">
        <Tabs 
          aria-label="Budget Categories" 
          color="primary" 
          variant="underlined"
          classNames={{
            tabList: "gap-8 relative rounded-none border-b border-divider p-0",
            cursor: "w-full bg-primary h-[3px]",
            tab: "max-w-fit px-0 h-14",
            tabContent: "group-data-[selected=true]:text-primary font-bold text-base"
          }}
        >
          {BUDGET_DATA.map((category) => (
            <Tab 
              key={category.id} 
              title={
                <div className="flex items-center gap-2">
                  <span>{category.title}</span>
                  <Chip size="sm" variant="flat" color="default">{category.items.length}</Chip>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {category.items
                  .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <Card 
                      key={item.slug} 
                      isPressable 
                      as={Link} 
                      href={`/publicbudget/${category.id}/${item.slug}`}
                      className="group border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader className="p-5 pb-0 flex-col items-start gap-3">
                        <div className="flex justify-between w-full items-center">
                          <Chip 
                            size="sm" 
                            variant="dot" 
                            color={item.status === "Mới" ? "success" : "primary"}
                            className="border-none p-0"
                          >
                            {item.status}
                          </Chip>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Năm {item.year}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg text-left leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {item.name}
                        </h4>
                      </CardHeader>
                      <CardBody className="px-5 py-4">
                        <p className="text-sm text-slate-500 line-clamp-2 italic">
                          Nhấp để xem chi tiết văn bản, số liệu và tải xuống các tệp đính kèm liên quan.
                        </p>
                      </CardBody>
                      <Divider className="opacity-50" />
                      <CardFooter className="px-5 py-3 flex justify-between items-center bg-slate-50/50">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          🕒 Cập nhật: 01/01/2026
                        </span>
                        <div className="text-primary font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                          CHI TIẾT ➔
                        </div>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            </Tab>
          ))}
        </Tabs>

        {/* 3. Footer Ghi chú được thiết kế lại như một Information Box */}
        <section className="mt-20 p-8 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="text-4xl">ℹ️</div>
          <div className="space-y-2">
            <h4 className="font-bold text-blue-900 text-lg">Hướng dẫn tra cứu công khai ngân sách</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm text-blue-800/80">
              <li className="flex items-start gap-2">✅ Chọn chuyên mục ở thanh menu phía trên để lọc dữ liệu.</li>
              <li className="flex items-start gap-2">✅ Sử dụng thanh tìm kiếm để tìm nhanh tên báo cáo.</li>
              <li className="flex items-start gap-2">✅ Mỗi báo cáo sẽ bao gồm nội dung văn bản và file đính kèm (PDF/Excel).</li>
              <li className="flex items-start gap-2">✅ Dữ liệu được cập nhật tự động từ hệ thống quản lý tài chính tỉnh.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}