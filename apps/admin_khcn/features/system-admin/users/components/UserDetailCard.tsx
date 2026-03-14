import { useState } from "react";
import { Shield, Key, AlertTriangle, User, CalendarDays } from "lucide-react";
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
import { EditRolesModal } from "./EditRolesModal";
import type { UserDetail } from "../types";

interface UserDetailSheetProps {
  user: UserDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  /** Khóa/mở tài khoản: (userId, isActive) */
  onSetActive?: (userId: number, isActive: boolean) => void;
  isSettingActive?: boolean;
  /** Gán lại vai trò: (userId, roleIds) */
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
  const isActive = user ? (user.status === "ACTIVE" || user.isActive !== false) : false;
  const roles = user?.roles ?? [];
  const policies = user?.policies ?? [];
  const lastLogin = user?.lastLogin;

  const handleLockUnlock = () => {
    if (!user?.id || !onSetActive) return;
    onSetActive(user.id, !isActive);
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Kích thước rộng rãi (max-w-[500px]) để đọc rõ các chính sách PBAC */}
      <SheetContent className="sm:max-w-[500px] p-0 flex flex-col w-full shadow-2xl">
        <SheetHeader className="p-6 border-b bg-muted/10 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-primary" />
            Chi tiết phân quyền User
          </SheetTitle>
          <SheetDescription>
            Xem và quản lý các vai trò, chính sách áp dụng cho tài khoản này.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 p-6 text-center text-muted-foreground flex items-center justify-center">
            Đang tải thông tin...
          </div>
        ) : !user ? (
          <div className="flex-1 p-6 text-center text-muted-foreground flex items-center justify-center">
            Không tìm thấy thông tin người dùng.
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 pb-6">
              
              {/* Thông tin cá nhân */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">{user.fullName ?? user.email ?? "—"}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{user.email ?? "—"}</p>
                  <div className="flex gap-2">
                    <Badge variant={isActive ? "default" : "destructive"} className="shadow-sm">
                      {isActive ? "Đang hoạt động" : "Đã khóa"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danh sách Role */}
              <section>
                <h5 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Key className="w-4 h-4 text-muted-foreground" /> Vai trò được gán (Roles)
                </h5>
                <div className="flex flex-wrap gap-2">
                  {roles.length > 0 ? roles.map((role, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 font-medium border">
                      {typeof role === "string" ? role : (role as { name?: string }).name ?? String(role)}
                    </Badge>
                  )) : <span className="text-sm text-muted-foreground italic">Chưa gán vai trò nào.</span>}
                </div>
              </section>

              {/* Danh sách Policy */}
              <section>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <h5 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Chính sách hiệu lực (Policies)
                  </h5>
                  <ul className="text-sm space-y-3">
                    {policies.length > 0 ? policies.map((policy, idx) => (
                      <li key={idx} className="flex flex-col gap-1 pb-2 border-b last:border-0 last:pb-0 border-primary/5">
                        <div className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="font-medium">{policy.description ?? "—"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground pl-3.5">
                          Tài nguyên: <code className="bg-background px-1.5 py-0.5 rounded border">{policy.resource ?? "—"}</code>
                        </span>
                      </li>
                    )) : (
                      <li className="text-muted-foreground text-xs italic">
                        Người dùng chưa có chính sách quyền hạn nào được áp dụng.
                      </li>
                    )}
                  </ul>
                </div>
              </section>
              
              <section className="text-xs text-muted-foreground flex items-center gap-2 pt-2">
                <CalendarDays className="w-4 h-4" /> Đăng nhập lần cuối: {lastLogin != null ? new Date(lastLogin).toLocaleString() : "Chưa từng đăng nhập"}
              </section>
            </div>
          </ScrollArea>
        )}

        <SheetFooter className="p-4 border-t bg-muted/10 shrink-0 flex gap-2">
          <Button
            variant={isActive ? "outline" : "default"}
            className={isActive ? "flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" : "flex-1"}
            onClick={handleLockUnlock}
            disabled={!user?.id || isSettingActive}
          >
            {isSettingActive ? "Đang xử lý..." : isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </Button>
          <Button
            className="flex-1"
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
