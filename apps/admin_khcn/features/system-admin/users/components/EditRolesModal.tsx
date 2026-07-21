 
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { roleApi } from "@/features/system-admin/roles/api";
import { roleKeys } from "@/features/system-admin/roles/keys";
import { cn } from "@/lib/utils";
import type { UserDetail } from "../types";

interface EditRolesModalProps {
  user: UserDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, roleIds: number[]) => void;
  isSaving: boolean;
}

export function EditRolesModal({ user, isOpen, onClose, onSave, isSaving }: EditRolesModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApi.getRoles(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen || !user || roles.length === 0) {
      if (!isOpen) setSelectedIds([]);
      return;
    }
    const names = Array.isArray(user.roles)
      ? (user.roles as (string | { name?: string; code?: string })[]).map((r) =>
          typeof r === "string" ? r : r?.name ?? r?.code ?? ""
        )
      : [];
    const ids = roles
      .filter((r) => names.includes(r.name) || names.includes(r.code))
      .map((r) => r.id);
    setSelectedIds(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id, roles.length, JSON.stringify(user?.roles)]);

  const handleToggle = (roleId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, roleId] : prev.filter((id) => id !== roleId)
    );
  };

  const handleSubmit = () => {
    if (!user?.id) return;
    onSave(user.id, selectedIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Chỉnh sửa vai trò
          </DialogTitle>
          <DialogDescription>
            Chọn vai trò áp dụng cho {user?.fullName ?? user?.email ?? "user"}. Lưu sẽ thay thế toàn bộ vai trò hiện tại.
          </DialogDescription>
        </DialogHeader>

        {rolesLoading ? (
          <Text variant="muted" className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Đang tải dữ liệu vai trò...
          </Text>
        ) : roles.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Chưa có vai trò nào. Thiết lập Roles trước (Chính sách phân quyền PBAC).
          </div>
        ) : (
          <ScrollArea className="max-h-[280px] rounded-md border p-2">
            <div className="grid gap-2">
              {roles.map((role) => {
                const checked = selectedIds.includes(role.id);
                return (
                  <div
                    key={role.id}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer p-2 rounded-lg border transition-colors",
                      checked ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`role-${role.id}`} 
                        checked={checked} 
                        onCheckedChange={(c) => handleToggle(role.id, c === true)} 
                      />
                      <div className="grid leading-tight cursor-pointer" onClick={() => handleToggle(role.id, !checked)}>
                        <Text as="span" variant="small" weight="medium">{role.name || role.code}</Text>
                        {role.name && role.code !== role.name && (
                          <Text as="span" variant="code" className="text-[10px] text-muted-foreground">{role.code}</Text>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={rolesLoading || roles.length === 0 || isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Lưu vai trò
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
