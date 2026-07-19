"use client";

import React from "react";
import { PortalMenu } from "@/features/posts/types";
import { CategoryItem } from "@/features/system-admin/categories/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MenuTableRow } from "./MenuTableRow";
import { Loader2 } from "lucide-react";
import { Text } from "@/components/ui/typography";


interface MenuTableProps {
  menus: PortalMenu[];
  loading: boolean;
  expandedItems: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  displayLang: string;
  languages: CategoryItem[];
  onEdit: (menu: PortalMenu) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function MenuTable({
  menus,
  loading,
  expandedItems,
  toggleExpand,
  displayLang,
  languages,
  onEdit,
  onDelete,
  onToggleActive,
}: MenuTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <Text className="text-muted-foreground font-semibold">Đang tải danh sách menu...</Text>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground font-medium">
        Không có menu nào được định nghĩa cho vị trí này.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/30 border-b border-border">
          <TableRow>
            <TableHead className="w-[350px] font-bold text-foreground">Tên Menu / Mô tả</TableHead>
            <TableHead className="w-[120px] font-bold text-foreground">Bản dịch</TableHead>
            <TableHead className="w-[120px] font-bold text-foreground">Vị trí</TableHead>
            <TableHead className="w-[110px] font-bold text-foreground">Loại</TableHead>
            <TableHead className="font-bold text-foreground">Liên kết</TableHead>
            <TableHead className="w-[80px] text-center font-bold text-foreground">Thứ tự</TableHead>
            <TableHead className="w-[100px] font-bold text-foreground">Hiển thị</TableHead>
            <TableHead className="w-[100px] text-right font-bold text-foreground">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menus.map((menu) => (
            <MenuTableRow
              key={menu.id}
              menu={menu}
              depth={0}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
              displayLang={displayLang}
              languages={languages}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
