"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Save,
  Send,
  History,
  Settings,
  Layers,
  Edit3,
  Check,
  Loader2,
  PanelLeft,
  Link2,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


interface TopbarProps {
  onSave: () => void;
  onPublish: () => void;
  onPublishAndApply?: (moduleCode: string) => Promise<void>;
  workflowModules?: { id?: string; code: string; name: string }[];
  onBack: () => void;
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isSaving: boolean;
  onOpenSettings?: () => void;
  onOpenPalette?: () => void;
  onOpenHistory?: () => void;
}

export const Topbar = ({
  onSave,
  onPublish,
  onPublishAndApply,
  workflowModules = [],
  onBack,
  workflowName,
  setWorkflowName,
  isSaving,
  onOpenSettings,
  onOpenPalette,
  onOpenHistory
}: TopbarProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyModule = async (moduleCode: string) => {
    if (!onPublishAndApply) return;
    setIsApplying(true);
    try {
      await onPublishAndApply(moduleCode);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <header className="pointer-events-auto h-16 w-full max-w-6xl rounded-full border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 transition-all">
        
        {/* Left Section: Back, Palette Toggle, Icon, Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={onOpenPalette}
            title="Mở thanh Tác nhân"
          >
            <PanelLeft className="h-4 w-4 text-muted-foreground" />
          </Button>

          <div className="h-6 w-[1px] bg-border/40 mx-1" />

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <Wand2 className="h-5 w-5" />
          </div>

          <div className="flex flex-col ml-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="h-7 text-sm font-bold w-48 bg-black/5 dark:bg-white/10 border-transparent focus-visible:ring-primary/40 rounded-md"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/20"
                    onClick={() => setIsEditingName(false)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h1
                    className="text-sm sm:text-base font-bold tracking-tight cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
                    onClick={() => setIsEditingName(true)}
                  >
                    {workflowName}
                    <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </h1>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold px-1.5 py-0 hidden sm:inline-flex">
                    Draft
                  </Badge>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đã kết nối với Canvas
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          <Button
            variant="ghost"
            size="sm"
            className="h-10 rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-all px-3"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden md:inline ml-2">Lưu bản nháp</span>
          </Button>

          {/* Nút Áp dụng nghiệp vụ */}
          {onPublishAndApply && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 rounded-full font-semibold px-3 sm:px-4 shadow-sm hover:shadow border-white/20 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4 text-indigo-500" />
                  )}
                  <span className="hidden sm:inline ml-2 text-indigo-600 dark:text-indigo-400">Áp dụng</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-border/50 w-64 p-2 shadow-xl backdrop-blur-xl bg-background/90">
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold px-2 py-1.5">
                  Gắn quy trình vào Modules
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-1" />
                {workflowModules.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Chưa có workflow nào.
                    </p>
                  </div>
                ) : (
                  workflowModules.map((mod) => (
                    <DropdownMenuItem
                      key={mod.code}
                      className="rounded-xl cursor-pointer flex flex-col items-start gap-1 p-3 focus:bg-primary/10"
                      onClick={() => handleApplyModule(mod.code)}
                    >
                      <span className="font-semibold text-sm">{mod.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded-md">{mod.code}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            size="sm"
            className="h-10 rounded-full font-bold px-4 sm:px-5 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary/80"
            onClick={onPublish}
          >
            <Send className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Kích hoạt</span>
          </Button>

          <div className="h-6 w-[1px] bg-border/40 mx-1 hidden sm:block" />

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors hidden sm:flex" 
            onClick={onOpenHistory}
            title="Lịch sử chỉnh sửa"
          >
            <History className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors hidden sm:flex"
            onClick={onOpenSettings}
            title="Cài đặt quy trình"
          >
            <Settings className="h-4 w-4" />
          </Button>

        </div>
      </header>
    </div>
  );
};

export default Topbar;
