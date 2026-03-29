"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  LogOut,
  User,
  Loader2,
  Layers,
  type LucideIcon,
} from "lucide-react";

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
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLogout } from "@/hooks/useLogout";
import { useHubServices } from "@/hooks/useServiceMenus";

// 2. TÁCH HEADER COMPONENT: Cho code gọn gàng
function PortalHeader() {
  const { handleLogout, isPending } = useLogout();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      {/* Khung chứa bung full màn hình, cách lề 2 bên một chút cho đẹp */}
      <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
        
        {/* Logo & Tên cơ quan */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight tracking-tight">Cổng Ứng dụng Nội bộ</span>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">Sở Khoa học và Công nghệ tỉnh Đắk Lắk</span>
          </div>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Nav rộng rồi nên show luôn tên User ra ngoài cho xịn */}
            <Button variant="ghost" className="relative h-11 flex items-center gap-3 rounded-full pl-2 pr-4 hover:bg-muted/60 transition-colors">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">CB</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold leading-none">Cán bộ Quản trị</span>
                <span className="text-[10px] text-muted-foreground mt-1 font-normal">admin@daklak.gov.vn</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Cán bộ Quản trị</p>
                <p className="text-xs text-muted-foreground">admin@daklak.gov.vn</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer"><User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => handleLogout()}
              disabled={isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? "Đang đăng xuất…" : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}

type AppItem = {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  /** Màu icon từ cấu hình menu (hex); null = màu gốc primary */
  iconColor: string | null;
  disabled: boolean;
};

function AppCard({ app }: { app: AppItem }) {
  const Icon = app.icon;
  const iconBoxStyle = app.iconColor
    ? { color: app.iconColor, backgroundColor: `${app.iconColor}18` }
    : undefined;
  const iconBoxClass = app.iconColor ? "" : "bg-primary/10 text-primary";
  return (
    <Card className={`group relative flex flex-col transition-all duration-300 border border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-xl ${app.disabled ? "opacity-60 grayscale" : "hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-primary/5"}`}>
      <CardHeader className="flex-1 pb-2 min-h-[140px]">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBoxClass}`} style={iconBoxStyle}>
            <Icon className="h-7 w-7" />
          </div>
          {app.disabled && <Badge variant="secondary" className="font-normal">Bảo trì</Badge>}
        </div>
        <CardTitle className="text-xl font-semibold mb-2 leading-tight">{app.title}</CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-muted-foreground min-h-15">
          {app.desc}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-4 pb-5 border-t border-border/50 bg-muted/20">
        {app.disabled ? (
          <Button variant="secondary" disabled className="w-full cursor-not-allowed rounded-xl">Tạm khóa</Button>
        ) : (
          <Link href={app.href} className="w-full">
            <Button className="w-full rounded-xl shadow-sm group-hover:shadow-md transition-all">
              Truy cập <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default function HubPage() {
  const { apps, isLoading } = useHubServices();
  console.log("apps", apps);

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader />
      <main className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Xin chào, Cán bộ!</h1>
          <p className="text-muted-foreground mt-2">Vui lòng chọn phân hệ nghiệp vụ để bắt đầu làm việc.</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" /> Đang tải danh sách phân hệ...
          </div>
        ) : apps.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
            <p className="text-muted-foreground font-medium">Bạn chưa được gán quyền truy cập phân hệ nào.</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Vui lòng liên hệ quản trị viên hệ thống.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Workflow Builder Card */}
            <AppCard 
              app={{
                id: "workflow-builder",
                title: "Trình kéo thả Quy trình",
                desc: "Thiết kế và quản lý các quy trình nghiệp vụ tự động hóa giữa các phân hệ.",
                href: "/hub/workflow-builder",
                icon: Layers,
                iconColor: "#8b5cf6",
                disabled: false,
              }} 
            />
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
