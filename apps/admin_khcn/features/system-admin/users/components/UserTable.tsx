"use client";

import { Loader2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { UserItem } from "../types";

interface UserTableProps {
  isLoading: boolean;
  isError: boolean;
  data: UserItem[];
  onViewDetail: (item: UserItem) => void;
}

export function UserTable({
  isLoading,
  isError,
  data,
  onViewDetail,
}: UserTableProps) {
  return (
    <div className="rounded-md border bg-background shadow-sm overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[60px] text-center h-10">ID</TableHead>
              <TableHead className="w-[180px] h-10">Email</TableHead>
              <TableHead className="w-[140px] h-10">Tên đăng nhập</TableHead>
              <TableHead className="h-10">Họ tên</TableHead>
              <TableHead className="w-[120px] h-10">Số điện thoại</TableHead>
              <TableHead className="w-[100px] text-center h-10">Trạng thái</TableHead>
              <TableHead className="text-right w-[100px] h-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-destructive">
                  Lỗi tải dữ liệu.
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-muted-foreground font-mono text-sm">
                    {item.id}
                  </TableCell>
                  <TableCell className="font-medium">{item.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.username ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.fullName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.phoneNumber ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.isActive ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 font-normal">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        Tạm khóa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => onViewDetail(item)}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserIcon className="h-10 w-10 opacity-50" />
                    <p>Chưa có người dùng nào.</p>
                    <p className="text-xs">
                      API danh sách user có thể chưa được bật — thử thêm mới.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
