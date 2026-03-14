// sitemapData.js
'use client';
const siteMapData = [
  {
    category: "Giới thiệu chung",
    icon: "🏛️",
    items: [
      { label: "Chức năng, nhiệm vụ", href: "/gioi-thieu/chuc-nang" },
      { label: "Cơ cấu tổ chức", href: "/gioi-thieu/co-cau" },
      { label: "Lãnh đạo Sở", href: "/gioi-thieu/lanh-dao" },
    ]
  },
  {
    category: "Tin tức - Sự kiện",
    icon: "📰",
    items: [
      { label: "Hoạt động ngành", href: "/tin-tuc/nganh" },
      { label: "Tin chỉ đạo điều hành", href: "/tin-tuc/chi-dao" },
      { label: "Thông cáo báo chí", href: "/tin-tuc/thong-cao" },
    ]
  },
  {
    category: "Công khai Ngân sách & Giá",
    icon: "💰",
    isImportant: true, // Đánh dấu mục quan trọng
    items: [
      { label: "Dự toán ngân sách NN", href: "/ckns/du-toan" },
      { label: "Quyết toán ngân sách NN", href: "/ckns/quyet-toan" },
      { label: "Công bố giá vật liệu XD", href: "/ckns/gia-vat-lieu" },
      { label: "Tài sản công", href: "/ckns/tai-san" },
    ]
  },
  {
    category: "Văn bản Pháp quy",
    icon: "⚖️",
    items: [
      { label: "Văn bản Trung ương", href: "/van-ban/tw" },
      { label: "Văn bản của Tỉnh", href: "/van-ban/tinh" },
      { label: "Dự thảo lấy ý kiến", href: "/van-ban/du-thao", badge: "Mới" },
    ]
  },
  {
    category: "Dịch vụ công trực tuyến",
    icon: "🖥️",
    items: [
      { label: "Thủ tục hành chính", href: "/dvc/thu-tuc" },
      { label: "Tra cứu hồ sơ", href: "/dvc/tra-cuu" },
      { label: "Phản ánh kiến nghị", href: "/dvc/phan-anh" },
    ]
  },
  {
    category: "Hỗ trợ Doanh nghiệp",
    icon: "🤝",
    items: [
      { label: "Hỏi đáp chính sách", href: "/ho-tro/hoi-dap" },
      { label: "Tải biểu mẫu", href: "/ho-tro/bieu-mau" },
      { label: "Hướng dẫn quyết toán", href: "/ho-tro/huong-dan" },
    ]
  }
];

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
} from "@heroui/card";
import { Link } from '@heroui/link';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';


function SiteMap() {
  return (
    <div className="w-full p-6 bg-content1/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header của trang Sitemap */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Sơ Đồ Cổng Thông Tin 
          </h1>
          <p className="text-default-500 text-lg">
            Sở Tài chính Tỉnh Đắk Lắk
          </p>
        </div>

        {/* Grid Layout chứa các Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteMapData.map((section, index) => (
            <Card 
              key={index} 
              className={`border-none ${section.isImportant ? "border-2 border-primary ring-2 ring-primary/20" : ""}`}
              shadow="sm"
              isPressable={false}
            >
              <CardHeader className="flex gap-3 px-6 pt-6">
                <div className="text-3xl bg-primary/10 p-2 rounded-lg">
                  {section.icon}
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-bold uppercase text-default-800">
                    {section.category}
                  </p>
                  <p className="text-small text-default-500">
                    {section.items.length} mục
                  </p>
                </div>
              </CardHeader>
              
              <Divider className="my-2 bg-default-100" />
              
              <CardBody className="px-6 pb-6 pt-2">
                <ul className="flex flex-col gap-3">
                  {section.items.map((item : any, idx) => (
                    <li key={idx} className="flex items-center justify-between group">
                      <Link 
                        href={item.href} 
                        color="foreground"
                        className="text-default-600 group-hover:text-primary transition-colors text-sm md:text-base w-full block truncate"
                      >
                        • {item.label}
                      </Link>
                      
                      {/* Hiển thị Badge nếu có */}
                      {item.badge && (
                        <Chip size="sm" color="danger" variant="flat" className="ml-2 h-6 min-w-min px-1">
                          {item.badge}
                        </Chip>
                      )}
                    </li>
                  ))}
                </ul>
              </CardBody>

              {/* Footer tùy chọn cho các mục quan trọng */}
              {section.isImportant && (
                <CardFooter className="bg-primary/5 justify-end">
                   <Link 
                     href={section.items[0].href} 
                     size="sm" 
                     color="primary" 
                     showAnchorIcon
                   >
                     Xem tất cả
                   </Link>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {/* Phần liên hệ nhanh ở dưới cùng */}
        <div className="mt-12">
            <Card className="bg-primary text-primary-foreground p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold">Không tìm thấy thông tin?</h3>
                        <p className="text-primary-foreground/80">Liên hệ với bộ phận một cửa để được hỗ trợ trực tiếp.</p>
                    </div>
                    <div className="flex gap-4">
                        
                        <Button variant="bordered" className="border-white text-white">
                            Gửi câu hỏi
                        </Button>
                    </div>
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
}

export default SiteMap;