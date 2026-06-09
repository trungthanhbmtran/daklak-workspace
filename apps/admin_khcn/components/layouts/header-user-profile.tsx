"use client";

import { LogOut, User, Settings } from "lucide-react";
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
import { useLogout } from "@/hooks/useLogout";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

interface HeaderUserProfileProps {
  showName?: boolean;
}

export function HeaderUserProfile({ showName = false }: HeaderUserProfileProps) {
  const { handleLogout, isPending } = useLogout();
  const { user } = useUser();

  const fullName = user?.fullName?.trim() || "Người dùng";
  const initial = fullName.charAt(0).toUpperCase() || "U";
  const email = user?.email || "user@daklak.gov.vn";

  // Extract role
  const roles = user?.roles || [];
  const primaryRole = roles.length > 0 ? roles[0].name : (user?.role || "Chưa cấp quyền");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative rounded-full focus-visible:ring-1 focus-visible:ring-ring",
            showName
              ? "h-11 flex items-center gap-3 pl-2 pr-4 hover:bg-muted/60 transition-colors"
              : "h-9 w-9"
          )}
        >
          <Avatar className={cn("border border-border", showName ? "h-8 w-8" : "h-9 w-9")}>
            <AvatarImage src="" alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>
          {showName && (
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold leading-none">{fullName}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-muted-foreground font-normal truncate max-w-[200px]">
                  {user?.jobTitleName && user?.unitName
                    ? `${user.jobTitleName} - ${user.unitName}`
                    : email}
                </span>
                <span className="text-[9px] font-semibold text-primary border border-primary/20 bg-primary/5 rounded px-1 py-0">{primaryRole}</span>
              </div>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {user?.jobTitleName && user?.unitName
                ? `${user.jobTitleName} - ${user.unitName}`
                : email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" /> Cài đặt
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
  );
}
