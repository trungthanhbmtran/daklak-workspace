import { Plus, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Role } from "../types";

interface RoleSidebarProps {
  roles: Role[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  selectedRoleId?: number;
  onSelect: (role: Role) => void;
  onAdd: () => void;
}

export function RoleSidebar({
  roles, total, page, totalPages, pageSize, onPageChange,
  selectedRoleId, onSelect, onAdd,
}: RoleSidebarProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <Card className="w-full lg:w-[300px] flex flex-col h-full shadow-none border-border overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 space-y-3 border-b bg-muted/10 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Danh sách Vai trò
            </h3>
            {total > 0 && (
              <Badge variant="outline" className="mt-1 text-[10px] font-mono h-4 px-1.5">
                {total} vai trò
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-7 px-2 font-bold text-[10px]" onClick={onAdd}>
            <Plus className="mr-1 h-3 w-3" /> Thêm mới
          </Button>
        </div>
        <Search placeholder="Tìm kiếm vai trò..." className="w-full" />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {roles.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground italic py-6">Không có vai trò nào.</p>
        ) : roles.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <div
              key={role.id}
              onClick={() => onSelect(role)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted text-foreground border border-transparent"
              }`}
            >
              <ShieldCheck className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate leading-tight ${isSelected ? "text-primary" : ""}`}>
                  {role.name}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{role.code}</p>
              </div>
              {role.active === 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" title="Đang khóa" />
              )}
            </div>
          );
        })}
      </div>

      {/* Phân trang */}
      {total > pageSize && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/10 shrink-0">
          <span className="text-[10px] text-muted-foreground">{start}–{end} / {total}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-medium px-1">{page}/{totalPages}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
