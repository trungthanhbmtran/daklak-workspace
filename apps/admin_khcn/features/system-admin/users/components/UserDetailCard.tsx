/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
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
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Text } from "@/components/ui/typography";
import { useUserPolicies } from "../hooks/useUserApi";
import type { UserDetail } from "../types";

interface UserDetailSheetProps {
  user: UserDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSetActive?: (userId: number, isActive: boolean) => void;
  isSettingActive?: boolean;
}

export function UserDetailSheet({
  user,
  isOpen,
  isLoading,
  onClose,
  onSetActive,
  isSettingActive,
}: UserDetailSheetProps) {
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef<HTMLLIElement>(null);

  // Lazy load policies — chỉ fetch khi user mở collapsible
  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
  } = useUserPolicies(user?.id ?? null, policiesOpen && isOpen);

  // Reset visible count khi đổi user
  useEffect(() => {
    setVisibleCount(20);
  }, [user?.id]);

  // Observer để load thêm khi cuộn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && policiesData && visibleCount < policiesData.length) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [policiesData, visibleCount]);

  const isActive = user ? (user.status === "ACTIVE" || user.isActive !== false) : false;
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
          <SheetHeader className="bg-muted/40 border-b py-4 px-6 shrink-0 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent text-accent-foreground border">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <SheetTitle className="text-base font-bold leading-none">
                  Chi tiết Người dùng
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <Text variant="small" className="text-muted-foreground uppercase tracking-tight">Quyền hạn:</Text>
                  <Badge variant="outline" className="text-[9px] h-4 font-mono uppercase bg-background border-primary/50 text-primary">
                    USER PBAC
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          {isLoading ? (
            <Text variant="muted" className="flex-1 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
            </Text>
          ) : !user ? (
            <Text variant="muted" className="flex-1 flex items-center justify-center">
              Không tìm thấy thông tin người dùng.
            </Text>
          ) : (
            <div className="flex-1 min-h-0 bg-background">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">

                  {/* Thông tin cơ bản */}
                  <div className="space-y-4">
                    <Text variant="small" className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 1. Định danh tài khoản
                    </Text>
                    
                    <div className="flex items-center gap-3 bg-muted/5 p-4 rounded-lg border border-border/50">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text weight="bold" className="truncate text-base">{user.fullName ?? user.email ?? "—"}</Text>
                        <Text variant="muted" className="truncate text-sm">{user.email}</Text>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={isActive ? "default" : "destructive"}
                            className="text-[10px] px-2 py-0 h-4"
                          >
                            {isActive ? "Hoạt động" : "Đã khóa"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Policies — Collapsible lazy */}
                  <section className="space-y-4">
                    <Collapsible open={policiesOpen} onOpenChange={setPoliciesOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full flex items-center justify-between group px-0 hover:bg-transparent h-auto py-1">
                          <Text variant="small" className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 2. Chính sách hiệu lực
                            {policiesData && policiesData.length > 0 && (
                              <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 h-4 bg-muted ml-1">
                                {policiesData.length}
                              </Badge>
                            )}
                          </Text>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${policiesOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-3">
                        <div className="bg-muted/5 rounded-lg border p-4 shadow-sm">
                          {isPoliciesLoading ? (
                            <Text variant="muted" className="flex items-center justify-center gap-2 py-6">
                              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chính sách...
                            </Text>
                          ) : !policiesData || policiesData.length === 0 ? (
                            <Text variant="small" className="text-muted-foreground italic text-center py-4">
                              Chưa có chính sách nào được áp dụng.
                            </Text>
                          ) : (
                            <div className="pt-1">
                              <ul className="text-xs space-y-3">
                                {policiesData.slice(0, visibleCount).map((policy, idx) => (
                                  <li key={idx} className="flex flex-col gap-1.5 pb-3 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                      <Text as="span" weight="medium" className="flex-1 truncate">{policy.description ?? "—"}</Text>
                                      {policy.effect && (
                                        <Badge
                                          variant={policy.effect === "ALLOW" ? "default" : "destructive"}
                                          className="text-[9px] font-mono px-1.5 py-0 h-4 shrink-0"
                                        >
                                          {policy.effect}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 pl-3.5 text-muted-foreground">
                                      <span>
                                        Tài nguyên: <code className="bg-background px-1.5 py-0.5 rounded border text-[10px] font-mono">{policy.resource ?? "—"}</code>
                                      </span>
                                      {policy.action && (
                                        <span>
                                          Hành động: <code className="bg-background px-1.5 py-0.5 rounded border text-[10px] font-mono">{policy.action}</code>
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                                {visibleCount < policiesData.length && (
                                  <li ref={observerTarget} className="py-2 text-center text-muted-foreground text-[10px] uppercase font-bold flex justify-center items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải thêm...
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </section>

                  {/* Last login */}
                  <div className="pt-4">
                    <Text variant="small" className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Đăng nhập lần cuối:{" "}
                      {lastLogin != null ? new Date(lastLogin).toLocaleString("vi-VN") : "Chưa từng đăng nhập"}
                    </Text>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          <SheetFooter className="p-4 border-t bg-muted/20 shrink-0 flex gap-3">
            <Button
              variant={isActive ? "outline" : "default"}
              className={`flex-1 text-xs font-bold h-9 shadow-sm ${isActive ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}`}
              onClick={handleLockUnlock}
              disabled={!user?.id || isSettingActive}
            >
              {isSettingActive ? "Đang xử lý..." : isActive ? "Khóa tài khoản" : "Mở khóa"}
            </Button>
            <Button variant="ghost" onClick={handleClose} className="text-xs font-semibold h-9 px-6">
              Đóng
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
