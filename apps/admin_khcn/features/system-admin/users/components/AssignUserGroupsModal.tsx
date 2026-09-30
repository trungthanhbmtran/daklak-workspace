"use client";

import { useState } from "react";
import { Shield, Loader2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

import { policyApi } from "../../policies/api";
import { policyKeys } from "../../policies/keys";
import { useAssignUserGroups } from "../hooks/useUserApi";
import type { UserItem, UserDetail } from "../types";

export function AssignUserGroupsModal({
  user,
  isOpen,
  onClose,
}: {
  user: UserItem | UserDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const assignUserGroups = useAssignUserGroups();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch tất cả user groups
  const { data: userGroups = [], isLoading: isLoadingUserGroups } = useQuery({
    queryKey: policyKeys.lists(),
    queryFn: () => policyApi.getPolicys(), // api trả về user groups (bị đặt tên cũ)
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const [prevUser, setPrevUser] = useState(user);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (user !== prevUser || isOpen !== prevIsOpen) {
    setPrevUser(user);
    setPrevIsOpen(isOpen);
    if (isOpen && user && "userGroupIds" in user) {
      setSelectedIds((user as UserDetail).userGroupIds || []);
    } else if (isOpen) {
      setSelectedIds([]);
    }
  }

  const toggleGroup = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSave = () => {
    if (!user) return;
    assignUserGroups.mutate(
      { id: user.id, userGroupIds: selectedIds },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const isSaving = assignUserGroups.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden shadow-xl border-primary/20">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Thiết lập Nhóm quyền (PBAC)
          </DialogTitle>
          <DialogDescription>
            Tài khoản: <strong className="text-foreground">{user?.fullName || user?.email}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 py-4 max-h-[60vh] bg-background">
          {isLoadingUserGroups ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
              <Text variant="muted">Đang tải danh sách nhóm quyền...</Text>
            </div>
          ) : userGroups.length === 0 ? (
            <div className="text-center py-8">
              <Text variant="muted">Chưa có nhóm quyền nào được tạo trên hệ thống.</Text>
            </div>
          ) : (
            <div className="space-y-3">
              {userGroups.map((group) => {
                const isSelected = selectedIds.includes(group.id!);
                return (
                  <div
                    key={group.id}
                    onClick={() => toggleGroup(group.id!)}
                    className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <Text weight="semibold" className="text-sm">
                          {group.name}
                        </Text>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 h-4 py-0">
                        {group.code}
                      </Badge>
                    </div>
                    {group.description && (
                      <Text variant="small" className="text-muted-foreground ml-6 line-clamp-2">
                        {group.description}
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[100px]"
            disabled={isSaving}
          >
            Hủy bỏ
          </Button>
          <Button onClick={onSave} disabled={isSaving || isLoadingUserGroups} className="min-w-[160px]">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
