import React, { useCallback } from "react";
import { Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryItem } from "../types";

// ─── CategoryRow — memoized ────────────────────────────────────────────────────

interface CategoryRowProps {
  item: CategoryItem;
  onEdit: (item: CategoryItem) => void;
  onDelete: (item: CategoryItem) => void;
}

const CategoryRow = React.memo(function CategoryRow({ item, onEdit, onDelete }: CategoryRowProps) {
  const handleEdit = useCallback(() => onEdit(item), [item, onEdit]);
  const handleDelete = useCallback(() => onDelete(item), [item, onDelete]);

  return (
    <TableRow>
      <TableCell className="text-center text-muted-foreground">{item.sort}</TableCell>
      <TableCell className="font-medium text-foreground">{item.code}</TableCell>
      <TableCell className="font-semibold text-primary">{item.name}</TableCell>
      <TableCell className="text-center">
        {item.active === 1 ? (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 font-normal">Sử dụng</Badge>
        ) : (
          <Badge variant="secondary" className="font-normal">Tạm ẩn</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" iconStart={<MoreHorizontal className="h-4 w-4" />}></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa dòng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

// ─── CategoryTable — memoized, nhận stable callbacks từ parent ───────────────

interface TableProps {
  isLoading: boolean;
  isError: boolean;
  data: CategoryItem[];
  onEdit: (item: CategoryItem) => void;
  onDelete: (item: CategoryItem) => void;
}

export const CategoryTable = React.memo(function CategoryTable({
  isLoading, isError, data, onEdit, onDelete,
}: TableProps) {
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => a.sort - b.sort),
    [data],
  );

  return (
    <div className="flex-1 overflow-y-auto rounded-md border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[80px] text-center h-10">STT</TableHead>
            <TableHead className="w-[150px] h-10">Mã (Code)</TableHead>
            <TableHead className="h-10">Tên giá trị</TableHead>
            <TableHead className="h-10 w-[120px] text-center">Trạng thái</TableHead>
            <TableHead className="text-right h-10 w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  Đang đồng bộ...
                </div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-destructive">
                Lỗi tải dữ liệu.
              </TableCell>
            </TableRow>
          ) : sortedData.length > 0 ? (
            sortedData.map((item) => (
              <CategoryRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                Không tìm thấy dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});
