"use client";

import { useState } from "react";
import { LogOut, User, Settings, Sparkles, Bot, Shield, Building2, Briefcase, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLogout } from "@/hooks/useLogout";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/typography";
import { PersonalAiRouterConfig } from "@/features/system-admin/users/components/settings/PersonalAiRouterConfig";
import { PersonalAiAssistants } from "@/features/system-admin/users/components/settings/PersonalAiAssistants";

interface HeaderUserProfileProps {
  showName?: boolean;
}

export function HeaderUserProfile({ showName = false }: HeaderUserProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("ai-router");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["ai-router"]));

  const { handleLogout, isPending } = useLogout();
  const { user } = useUser();

  const fullName = user?.fullName?.trim() || "Người dùng";
  const initial = fullName.charAt(0).toUpperCase() || "U";
  const email = user?.email || "user@daklak.gov.vn";

  const handleTabChange = (value: string) => {
    setActiveSettingsTab(value);
    setVisitedTabs((prev) => new Set(prev).add(value));
  };

  const handleOpenProfile = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(true);
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "relative rounded-full focus-visible:ring-1 focus-visible:ring-ring",
              showName
                ? "h-11 flex items-center gap-2 pl-2 pr-4 hover:bg-muted/60 transition-colors"
                : "h-9 w-9"
            )}
          >
            <Avatar className={cn("border border-border", showName ? "h-8 w-8" : "h-9 w-9")}>
              <AvatarImage src={user?.avatarUrl || ""} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                {initial}
              </AvatarFallback>
            </Avatar>
            {showName && (
              <div className="hidden md:flex flex-col items-start text-left">
                <Text variant="muted" weight="medium" className="mb-1 leading-none">
                  Xin chào,
                </Text>
                <Text weight="semibold" className="leading-none truncate max-w-[200px]">
                  {fullName}
                </Text>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 max-w-[calc(100vw-2rem)] border-border" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex min-w-0 flex-col space-y-1.5 pb-1">
              <Text weight="semibold" className="leading-none">{fullName}</Text>
              <Text variant="muted" className="min-w-0 max-w-full wrap-break-word text-xs leading-normal">{email}</Text>
              
              {(user?.jobTitleName || user?.unitName) && (
                <div className="mt-2 flex flex-col space-y-1 border-t border-border/50 pt-2">
                  {user?.jobTitleName && (
                    <Text variant="small" weight="medium" className="text-foreground/80 leading-tight">
                      {user.jobTitleName}
                    </Text>
                  )}
                  {user?.unitName && (
                    <Text variant="small" className="text-muted-foreground leading-snug text-xs">
                      {user.unitName}
                    </Text>
                  )}
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem className="cursor-pointer" onSelect={handleOpenProfile}>
            <User className="mr-2 h-4 w-4 text-muted-foreground" /> Hồ sơ cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> Cài đặt AI & Ứng dụng
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={() => handleLogout()}
            disabled={isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isPending ? "Đang đăng xuất…" : "Đăng xuất"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MODAL CÀI ĐẶT CÁ NHÂN & AI */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Settings className="h-5 w-5 text-primary" />
              Cài đặt Cá nhân & Trí tuệ Nhân tạo (AI)
            </DialogTitle>
            <DialogDescription>
              Quản lý khóa API, cấu hình đa nhà cung cấp thông minh và khởi tạo trợ lý AI chuyên biệt cho công việc.
            </DialogDescription>
          </DialogHeader>

          {isSettingsOpen && (
            <Tabs value={activeSettingsTab} onValueChange={handleTabChange} className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-router" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Định tuyến AI (Smart Router)
                </TabsTrigger>
                <TabsTrigger value="ai-assistants" className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  Trợ lý AI Chuyên biệt ({user?.aiAssistantsCount || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-router" className="pt-4 focus-visible:outline-none">
                {visitedTabs.has("ai-router") && <PersonalAiRouterConfig />}
              </TabsContent>

              <TabsContent value="ai-assistants" className="pt-4 focus-visible:outline-none">
                {visitedTabs.has("ai-assistants") && <PersonalAiAssistants />}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL HỒ SƠ CÁ NHÂN */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Thông tin Hồ sơ Cá nhân
            </DialogTitle>
            <DialogDescription>
              Chi tiết tài khoản định danh cán bộ trên hệ thống Tỉnh Đắk Lắk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={user?.avatarUrl || ""} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base truncate">{fullName}</h4>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[11px] px-2 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">
                    Đang hoạt động
                  </Badge>
                  {user?.role && (
                    <Badge variant="secondary" className="text-[11px] px-2 py-0">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Chi tiết thông tin */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground font-medium">Chức danh / Vị trí việc làm</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {user?.jobTitleName || "Chưa thiết lập"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground font-medium">Cơ quan / Đơn vị trực thuộc</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {user?.unitName || "UBND Tỉnh Đắk Lắk"}
                  </div>
                </div>
              </div>

              {user?.employeeCode && (
                <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-medium">Mã định danh cán bộ</div>
                    <div className="font-mono text-sm font-semibold text-foreground mt-0.5">
                      {user.employeeCode}
                    </div>
                  </div>
                </div>
              )}

              {user?.phoneNumber && (
                <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-medium">Số điện thoại liên hệ</div>
                    <div className="font-semibold text-foreground mt-0.5">
                      {user.phoneNumber}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
