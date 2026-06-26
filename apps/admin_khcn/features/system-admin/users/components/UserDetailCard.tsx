"use client";

import { useState } from "react";
import { Shield, Key, AlertTriangle, User, CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EditRolesModal } from "./EditRolesModal";
import { useUserPolicies } from "../hooks/useUserApi";
import type { UserDetail } from "../types";

interface UserDetailSheetProps {
  user: UserDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSetActive?: (userId: number, isActive: boolean) => void;
  isSettingActive?: boolean;
  onAssignRoles?: (payload: { id: number; roleIds: number[] }) => void;
  isAssigningRoles?: boolean;
}

export function UserDetailSheet({
  user,
  isOpen,
  isLoading,
  onClose,
  onSetActive,
  isSettingActive,
  onAssignRoles,
  isAssigningRoles,
}: UserDetailSheetProps) {
  const [editRolesOpen, setEditRolesOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);

  // Lazy load policies — chỉ fetch khi user mở collapsible
  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
  } = useUserPolicies(user?.id ?? null, policiesOpen && isOpen);

  const isActive = user ? (user.status === "ACTIVE" || user.isActive !== false) : false;
  const roles = user?.roles ?? [];
  const lastLogin = user?.lastLogin;

  const handleLockUnlock = () => {
    if (!user?.id || !onSetActive) return;
    onSetActive(user.id, !isActive);
  };

  // Reset khi đóng sheet
  const handleClose = () => {
    setPoliciesOpen(false);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="sm:max-w-[460px] p-0 flex flex-col w-full shadow-2xl">
          <SheetHeader className="p-5 border-b bg-muted/10 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              Chi tiết phân quyền
            </SheetTitle>
            <SheetDescription className="text-xs">
              Vai trò và chính sách áp dụng cho tài khoản này.
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
            </div>
          ) : !user ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Không tìm thấy thông tin người dùng.
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-5 space-y-5">

                  {/* Thông tin cơ bản */}
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold truncate">{user.fullName ?? user.email ?? "—"}</h4>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <Badge
                        variant={isActive ? "default" : "destructive"}
                        className="mt-1 text-xs px-2 py-0 h-5"
                      >
                        {isActive ? "Hoạt động" : "Đã khóa"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Roles */}
                  <section>
                    <h5 className="font-semibold mb-2.5 flex items-center gap-2 text-sm">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      Vai trò ({roles.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {roles.length > 0 ? roles.map((role, i) => {
                        const name = typeof role === "string" ? role
                          : (role as { name?: string; code?: string }).name
                          ?? (role as { code?: string }).code
                          ?? String(role);
                        const code = typeof role === "string" ? undefined : (role as { code?: string }).code;
                        return (
                          <Badge key={i} variant="secondary" className="px-2.5 py-0.5 font-medium border text-xs flex items-center gap-1">
                            {name}
                            {code && code !== name && (
                              <span className="text-muted-foreground font-mono opacity-70">({code})</span>
                            )}
                          </Badge>
                        );
                      }) : (
                        <span className="text-sm text-muted-foreground italic">Chưa gán vai trò nào.</span>
                      )}
                    </div>
                  </section>

                  <Separator />

                  {/* Policies — Collapsible lazy */}
                  <section>
                    <Collapsible open={policiesOpen} onOpenChange={setPoliciesOpen}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between group">
                          <span className="font-semibold flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Chính sách hiệu lực
                            {policiesData && policiesData.length > 0 && (
                              <Badge variant="outline" className="font-mono text-xs px-1.5 py-0 h-4">
                                {policiesData.length}
                              </Badge>
                            )}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${policiesOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-3">
                        <div className="bg-muted/30 rounded-lg border p-3">
                          {isPoliciesLoading ? (
                            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chính sách...
                            </div>
                          ) : !policiesData || policiesData.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic text-center py-4">
                              Chưa có chính sách nào được áp dụng.
                            </p>
                          ) : (
                            <ScrollArea className="max-h-[220px] pr-2">
                              <ul className="text-xs space-y-2.5">
                                {policiesData.map((policy, idx) => (
                                  <li key={idx} className="flex flex-col gap-1 pb-2 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                      <span className="font-medium flex-1 truncate">{policy.description ?? "—"}</span>
                                      {policy.effect && (
                                        <Badge
                                          variant={policy.effect === "ALLOW" ? "default" : "destructive"}
                                          className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                                        >
                                          {policy.effect}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 pl-3.5 text-muted-foreground">
                                      <span>
                                        Tài nguyên: <code className="bg-background px-1 py-0.5 rounded border text-[10px]">{policy.resource ?? "—"}</code>
                                      </span>
                                      {policy.action && (
                                        <span>
                                          Hành động: <code className="bg-background px-1 py-0.5 rounded border text-[10px]">{policy.action}</code>
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </section>

                  {/* Last login */}
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Đăng nhập lần cuối:{" "}
                    {lastLogin != null ? new Date(lastLogin).toLocaleString("vi-VN") : "Chưa từng đăng nhập"}
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}

          <SheetFooter className="p-4 border-t bg-muted/10 shrink-0 flex gap-2">
            <Button
              variant={isActive ? "outline" : "default"}
              className={`flex-1 text-sm ${isActive ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}`}
              onClick={handleLockUnlock}
              disabled={!user?.id || isSettingActive}
            >
              {isSettingActive ? "Đang xử lý..." : isActive ? "Khóa tài khoản" : "Mở khóa"}
            </Button>
            <Button
              className="flex-1 text-sm"
              variant="secondary"
              onClick={() => setEditRolesOpen(true)}
              disabled={!user?.id || isAssigningRoles}
            >
              {isAssigningRoles ? "Đang lưu..." : "Chỉnh sửa quyền"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <EditRolesModal
        user={user}
        isOpen={editRolesOpen}
        onClose={() => setEditRolesOpen(false)}
        onSave={(userId, roleIds) => onAssignRoles?.({ id: userId, roleIds })}
        isSaving={!!isAssigningRoles}
      />
    </>
  );
}
