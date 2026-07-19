/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { ArrowRight, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHubServices } from "@/hooks/useServiceMenus";
import { useUser } from "@/hooks/useUser";

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

export function HubClient() {
  const { apps, isLoading } = useHubServices();
  const { user } = useUser();
  const displayName = user?.fullName?.trim() || 'Bạn';

  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Xin chào, {displayName}!</h1>
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
          {apps.map((app: any) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </main>
  );
}
