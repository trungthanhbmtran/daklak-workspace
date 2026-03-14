'use client';
import React from 'react';
import { Accordion, AccordionItem } from '@heroui/accordion';
import { Badge } from '@heroui/badge';
import { useParams, useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { useLocale } from 'next-intl';

const MenuLeft = ({ className }: any) => {
  const router = useRouter();
  const locale = useLocale();
  const { data }: any = useFetch("/posts/categories", {
    params: { id: "e8c2dc7a-7826-46c1-bab3-807e8780d923", mode: "tree" }
  });


  // console.log("data", data)

  const menuItems = data?.data[0]?.children || [];

  // console.log("menuItems",menuItems)

  const navigateCategory = (item: any) => {
    const { linkType, slug, customUrl, target } = item;

    switch (linkType) {
      case "standard":
        // 4. Luôn gắn prefix locale vào trước đường dẫn
        router.push(`/${locale}/articles/${slug}`);
        break;

      case "static":
        if (customUrl?.startsWith("/")) {
          // Xử lý link tĩnh nội bộ (ví dụ: /about)
          // Kiểm tra xem customUrl đã có locale chưa để tránh lặp (vd: /vi/vi/about)
          if (customUrl.startsWith(`/${locale}/`)) {
            router.push(customUrl);
          } else {
            // Nối locale vào trước: /about -> /vi/about
            router.push(`/${locale}${customUrl}`);
          }
        }
        break;

      case "external":
        // Link ngoài (http...) giữ nguyên, không thêm locale
        if (customUrl) window.open(customUrl, target || "_self");
        break;

      default:
        break;
    }
  };


  return (
    <div className={`w-full overflow-y-auto ${className ?? "bg-transparent"} dark:bg-gray-900`}>
      <Accordion variant="bordered" selectionMode="multiple">

        {menuItems.map((item: any, idx: number) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;

          return (
            <AccordionItem
              key={idx}
              hideIndicator={!hasChildren}
              title={
                <div
                  className={`flex items-center justify-between w-full ${!hasChildren ? "cursor-pointer" : ""}`}
                  onClick={() => !hasChildren && navigateCategory(item)}
                >
                  <span className="text-gray-700 dark:text-gray-200 hover:text-blue-600">
                    {item.name}
                  </span>

                  {item.badge && <Badge color="danger" size="sm">{item.badge}</Badge>}
                </div>
              }
            >
              {hasChildren && (
                <ul className="pl-4 space-y-2">
                  {item.children.map((sub: any, sidx: number) => (
                    <li key={sidx}>
                      <div
                        className="hover:text-blue-500 cursor-pointer text-sm py-1"
                        onClick={() => navigateCategory(sub)}
                      >
                        {sidx + 1}. {sub.name}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

            </AccordionItem>
          );
        })}

      </Accordion>
    </div>
  );
};

export default MenuLeft;
