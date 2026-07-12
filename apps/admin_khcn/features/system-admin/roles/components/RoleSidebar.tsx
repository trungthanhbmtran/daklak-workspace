"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, ShieldCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { roleApi } from "../api";
import { roleKeys } from "../keys";
import type { Role } from "../types";

const PAGE_SIZE = 10;

export function RoleSidebar() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  
  const [page, setPage] = useState(1);
  const selectedRoleId = params?.id ? Number(params.id) : null;
  // create mode could be indicated if pathname ends with /create
  // but we can just highlight it based on route if we want, or leave un-highlighted

  const { data: roles = [], isLoading } = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApi.getRoles(),
    staleTime: 2 * 60 * 1000,
  });

  const filteredRoles = useMemo(() => roles.filter((r: Role) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  ), [roles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const pagedRoles = useMemo(() => {
    const safePage = page > totalPages ? 1 : page;
    return filteredRoles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredRoles, page, totalPages]);

  const total = filteredRoles.length;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <Card className="w-full lg:w-[300px] flex flex-col h-full min-h-0 shadow-none border-border overflow-hidden shrink-0">
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
          <Button variant="outline" size="sm" className="h-7 px-2 font-bold text-[10px]" asChild>
            <Link href="/services/admin/roles/create">
              <Plus className="mr-1 h-3 w-3" /> Thêm mới
            </Link>
          </Button>
        </div>
        <Search placeholder="Tìm kiếm vai trò..." className="w-full" />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center items-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-xs">Đang tải...</span>
          </div>
        ) : pagedRoles.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground italic py-6">Không có vai trò nào.</p>
        ) : pagedRoles.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <Link
              key={role.id}
              href={`/services/admin/roles/${role.id}`}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-colors ${
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
            </Link>
          );
        })}
      </div>

      {/* Phân trang */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/10 shrink-0">
          <span className="text-[10px] text-muted-foreground">{start}–{end} / {total}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-medium px-1">{page}/{totalPages}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
