// components/MobileMenu.tsx
"use client";

import React from "react";
import {
  Button
} from "@heroui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter
} from "@heroui/drawer";
import { Link } from "@heroui/link";
import {
  useDisclosure,
} from "@heroui/modal";

interface MenuItem {
  name: string;
  active: boolean;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
}

// Icon 3 gạch (Hamburger) cho nút menu
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

export default function MobileMenu({ menuItems }: MobileMenuProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {/* Nút mở Menu (chỉ hiện khi màn hình nhỏ trong Header cha) */}
      <Button 
        onPress={onOpen} 
        variant="light" 
        className="text-white font-bold"
        startContent={<MenuIcon />}
      >
        MENU
      </Button>

      {/* Phần Drawer hiển thị nội dung */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1 border-b">
                DANH MỤC
              </DrawerHeader>
              <DrawerBody className="pt-4">
                <div className="flex flex-col gap-4">
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={
                        item.name === "TRANG CHỦ"
                          ? "/"
                          : `/${item.name.toLowerCase().replace(/ /g, "-")}`
                      }
                      onPress={onClose} // Đóng drawer khi click vào link
                      className={`text-lg font-semibold py-2 border-b border-divider ${
                        item.active ? "text-blue-600" : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Đóng
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}