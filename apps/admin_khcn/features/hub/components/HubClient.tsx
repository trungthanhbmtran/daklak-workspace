"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  LucideIcon,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHubServices } from "@/hooks/useServiceMenus";
import { useUser } from "@/hooks/useUser";
import { HeaderUserProfile } from "@/components/layouts/header-user-profile";

function PortalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/40 backdrop-blur-xl supports-backdrop-filter:bg-background/20 shadow-sm">
      <div className="flex h-20 w-full items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 tracking-tight">Cổng Ứng dụng Nội bộ</span>
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block tracking-wide uppercase mt-0.5">Sở Khoa học & Công nghệ Đắk Lắk</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Hệ thống hoạt động bình thường</span>
          </div>
          <HeaderUserProfile showName />
        </div>
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
  iconColor: string | null;
  disabled: boolean;
};

function AppCard({ app, index }: { app: AppItem, index: number }) {
  const Icon = app.icon;
  const iconColor = app.iconColor || "#3b82f6";
  
  return (
    <Card 
      className={`group relative flex flex-col transition-all duration-500 border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-${iconColor}/20 ${app.disabled ? "opacity-60 grayscale" : "hover:-translate-y-2"}`}
      style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}
    >
      {/* Decorative background glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: iconColor }}
      />
      
      <CardHeader className="flex-1 pb-4 min-h-[160px] relative z-10 px-8 pt-8">
        <div className="flex justify-between items-start mb-6">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
            style={{ backgroundColor: iconColor, color: "#fff", boxShadow: `0 10px 25px -5px ${iconColor}66` }}
          >
            <Icon className="h-8 w-8" strokeWidth={2} />
          </div>
          {app.disabled && (
            <Badge variant="secondary" className="font-medium bg-slate-200 dark:bg-slate-800 border-none px-3 py-1">
              Bảo trì
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl font-bold mb-3 tracking-tight text-slate-800 dark:text-slate-100">{app.title}</CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          {app.desc}
        </CardDescription>
      </CardHeader>
      
      <CardFooter className="px-8 pb-8 pt-4 relative z-10">
        {app.disabled ? (
          <Button variant="secondary" disabled className="w-full h-12 rounded-xl text-base font-semibold bg-slate-100 dark:bg-slate-800">
            Tạm khóa
          </Button>
        ) : (
          <Link href={app.href} className="w-full">
            <Button 
              className="w-full h-12 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 text-base font-semibold overflow-hidden relative"
              style={{ backgroundColor: iconColor }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center justify-center">
                Mở phân hệ 
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
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
  const displayName = user?.fullName?.split(' ').pop() || 'Bạn';

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <PortalHeader />
      
      <main className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 backdrop-blur-md mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Không gian làm việc số</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Chào mừng trở lại, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{displayName}</span>!
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium">
            Chọn một phân hệ nghiệp vụ bên dưới để truy cập vào không gian làm việc của bạn. Hệ thống đã được cá nhân hóa theo quyền hạn.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Đang đồng bộ dữ liệu hệ thống...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="max-w-xl mx-auto rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Chưa có phân hệ nào</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">Tài khoản của bạn hiện chưa được phân quyền truy cập vào bất kỳ phân hệ nghiệp vụ nào.</p>
            <Button variant="outline" className="rounded-xl border-slate-300 dark:border-slate-700 font-semibold" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app: any, idx: number) => (
              <div key={app.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                <AppCard app={app} index={idx} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
