"use client"

import { usePathname } from "next/navigation";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import Link from "next/link";
import { useMemo } from "react";
import { Home, ChevronRight } from "lucide-react"; // Cần cài lucide-react
import { useTranslations } from "next-intl";

// 1. Ánh xạ các slug URL sang Tiếng Việt (Nếu không dùng i18n file)
// Nếu bạn có file json ngôn ngữ, hãy dùng t(segment)
const routeLabels: Record<string, string> = {
  admin: "Quản trị",
  posts: "Bài viết",
  banners: "Quản lý Banner",
  articles: "Tin tức",
  "thong-bao": "Thông báo",
  create: "Thêm mới",
  edit: "Chỉnh sửa",
  settings: "Cài đặt",
  "site-map": "Sơ đồ trang",
  contacts: "Liên hệ",
};

export const Breadcrumb = () => {
  const pathname = usePathname();
  const t = useTranslations("Navigation"); // Tùy chọn nếu bạn dùng i18n

  const breadcrumbs = useMemo(() => {
    // Tách đường dẫn và loại bỏ phần tử rỗng + phần mã ngôn ngữ (vi/en) nếu có
    const pathSegments = pathname.split("/").filter((v) => v.length > 0);
    
    // Nếu project của bạn có /vi/ hoặc /en/ ở đầu, bỏ qua phần tử đầu tiên
    const filteredSegments = ["vi", "en"].includes(pathSegments[0]) 
      ? pathSegments.slice(1) 
      : pathSegments;

    return filteredSegments.map((segment, index) => {
      // Build lại href cho từng segment
      const href = "/" + filteredSegments.slice(0, index + 1).join("/");
      
      // Lấy nhãn từ mapping, nếu không có thì format lại segment
      const label = routeLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

      return { href, label };
    });
  }, [pathname]);

  // Không hiển thị nếu đang ở trang chủ
  if (breadcrumbs.length === 0) return null;

  return (
    <div className="py-3 px-4 bg-gray-50/50 border-b border-gray-100 mb-6 rounded-lg">
      <Breadcrumbs
        underline="hover"
        separator={<ChevronRight size={14} className="text-default-400" />}
        itemClasses={{
          item: "text-sm font-medium px-1",
          separator: "px-0"
        }}
      >
        {/* Item Trang chủ luôn cố định */}
        <BreadcrumbItem>
          <Link href="/" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors">
            <Home size={16} />
            <span>Trang chủ</span>
          </Link>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem 
              key={crumb.href} 
              isCurrent={isLast}
              classNames={{
                item: isLast ? "text-gray-500 font-bold cursor-default" : "text-blue-600"
              }}
            >
              {isLast ? (
                <span>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:underline">
                  {crumb.label}
                </Link>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};