"use client";

import React, { useCallback } from "react";
import {
  Loader2, User as UserIcon, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Text } from "@/components/ui/typography";
import type { UserItem } from "../types";

// ─── UserRow — memoized ───────────────────────────────────────────────────────

interface UserRowProps {
  item: UserItem;
  onViewDetail: (item: UserItem) => void;
}

const UserRow = React.memo(function UserRow({ item, onViewDetail }: UserRowProps) {
  const handleClick = useCallback(() => onViewDetail(item), [item, onViewDetail]);

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="text-center text-muted-foreground font-mono text-sm">{item.id}</TableCell>
      <TableCell className="font-medium">{item.email || "—"}</TableCell>
      <TableCell className="text-muted-foreground hidden sm:table-cell">{item.username ?? "—"}</TableCell>
      <TableCell className="font-medium hidden md:table-cell">{item.fullName ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">{item.phoneNumber ?? "—"}</TableCell>
      <TableCell className="text-center">
        {item.isActive ? (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 font-normal text-xs">Hoạt động</Badge>
        ) : (
          <Badge variant="secondary" className="font-normal text-xs">Tạm khóa</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleClick}>
          Chi tiết
        </Button>
      </TableCell>
    </TableRow>
  );
});

// ─── UserTable — memoized ─────────────────────────────────────────────────────

interface UserTableProps {
  isLoading: boolean;
  isError: boolean;
  data: UserItem[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onViewDetail: (item: UserItem) => void;
}

export const UserTable = React.memo(function UserTable({
  isLoading, isError, data, total, page, totalPages, pageSize,
  onPageChange, onViewDetail,
}: UserTableProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const handlePrev = useCallback(() => onPageChange(page - 1), [page, onPageChange]);
  const handleNext = useCallback(() => onPageChange(page + 1), [page, onPageChange]);

  return (
    <div className="flex-1 min-h-0 rounded-md border bg-background shadow-sm overflow-hidden flex flex-col">
      <ScrollArea className="w-full flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[56px] text-center h-10">ID</TableHead>
              <TableHead className="h-10">Email</TableHead>
              <TableHead className="w-[140px] h-10 hidden sm:table-cell">Tên đăng nhập</TableHead>
              <TableHead className="h-10 hidden md:table-cell">Họ tên</TableHead>
              <TableHead className="w-[120px] h-10 hidden lg:table-cell">Số điện thoại</TableHead>
              <TableHead className="w-[100px] text-center h-10">Trạng thái</TableHead>
              <TableHead className="text-right w-[90px] h-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <Text variant="muted" className="flex flex-col items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-primary" />
                    Đang tải...
                  </Text>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-destructive">
                  Lỗi tải dữ liệu.
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item) => (
                <UserRow key={item.id} item={item} onViewDetail={onViewDetail} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Text variant="muted" className="flex flex-col items-center gap-2">
                    <UserIcon className="h-9 w-9 opacity-40" />
                    <span>Không có người dùng nào.</span>
                  </Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination */}
      {!isLoading && !isError && total > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/20 shrink-0">
          <Text as="span" variant="small" className="text-muted-foreground">
            {start}–{end} / {total} người dùng
          </Text>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={handlePrev}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Text as="span" variant="small" weight="medium" className="px-2 min-w-[60px] text-center">
              {page} / {totalPages}
            </Text>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={handleNext}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
