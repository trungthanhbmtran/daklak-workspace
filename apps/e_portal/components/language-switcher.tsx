"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo } from "react";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Xác định ngôn ngữ hiện tại an toàn hơn
  const currentLangCode = pathname.split("/")[1];

  // Danh sách ngôn ngữ
  const languages = [
    { code: "vi", label: "Tiếng Việt", flag: "/flags/vietnam.png" },
    { code: "en", label: "English", flag: "/flags/united-kingdom.png" },
  ];

  // Tìm ngôn ngữ hiện tại, mặc định là 'vi' nếu không tìm thấy
  const currentLang = useMemo(() => {
    return languages.find((l) => l.code === currentLangCode) || languages[0];
  }, [currentLangCode]);

  const handleAction = (key: string) => {
    if (key === currentLang.code) return; // Không làm gì nếu chọn lại ngôn ngữ cũ
    const segments = pathname.split("/");
    segments[1] = key;
    router.push(segments.join("/"));
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        {/* Nút bấm hiển thị ngôn ngữ hiện tại */}
        <Button
          variant="bordered"
          className="min-w-[140px] justify-between bg-transparent border-default-200 hover:border-default-400 text-foreground"
        >
          <div className="flex items-center gap-2">
            <Image
              src={currentLang.flag}
              alt={currentLang.code}
              width={20}
              height={15}
              className="rounded-sm object-cover"
            />
            <span className="font-medium text-small">{currentLang.label}</span>
          </div>
          {/* Mũi tên nhỏ chỉ xuống (SVG) */}
          <svg className="w-3 h-3 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Language Actions"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={new Set([currentLang.code])}
        onAction={(key) => handleAction(key as string)}
      >
        {languages.map((lang) => (
          <DropdownItem key={lang.code} textValue={lang.label}>
            <div className="flex items-center gap-2">
              <Image
                src={lang.flag}
                alt={lang.code}
                width={20}
                height={15}
              />
              <span>{lang.label}</span>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}