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
import { Text } from "@/components/ui/typography";

interface HeaderUserProfileProps {
  showName?: boolean;
}

export function HeaderUserProfile({ showName = false }: HeaderUserProfileProps) {
  const { handleLogout, isPending } = useLogout();
  const { user } = useUser();

  const fullName = user?.fullName?.trim() || "Người dùng";
  const initial = fullName.charAt(0).toUpperCase() || "U";
  const email = user?.email || "user@daklak.gov.vn";

  return (
    <DropdownMenu>
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
      <DropdownMenuContent className="w-56 border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5 pb-1">
            <Text weight="semibold" className="leading-none">{fullName}</Text>
            <Text variant="muted" className="leading-none">{email}</Text>
            
            {(user?.jobTitleName || user?.unitName) && (
              <div className="mt-2 flex flex-col space-y-1 border-t border-border/50 pt-2">
                {user?.jobTitleName && (
                  <Text variant="small" weight="medium" className="text-foreground/80">{user.jobTitleName}</Text>
                )}
                {user?.unitName && (
                  <Text variant="small" className="text-muted-foreground leading-snug">{user.unitName}</Text>
                )}
              </div>
            )}
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
