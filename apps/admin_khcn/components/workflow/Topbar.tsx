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
  onOpenPalette
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
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6 shadow-sm z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-muted/80 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="h-6 w-[1px] bg-border/60 mx-[-4px]" />
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-border/60 hover:bg-muted/60 transition-colors"
          onClick={onOpenPalette}
          title="Mở thanh Tác nhân"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
          <Layers className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="h-7 text-sm font-bold w-48 bg-muted/50 border-primary/20 focus-visible:ring-primary/20"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setIsEditingName(false)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1
                  className="text-base font-bold tracking-tight cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
                  onClick={() => setIsEditingName(true)}
                >
                  {workflowName}
                  <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                </h1>
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold px-1.5 py-0">
                  Draft
                </Badge>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sẵn sàng chỉnh sửa
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/60 font-medium hover:bg-muted/60 transition-all px-4"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2 text-primary" />}
          Lưu bản nháp
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl font-medium px-4 transition-all border-border/60 hover:bg-muted/60"
          onClick={onPublish}
        >
          <Send className="h-4 w-4 mr-2" />
          Kích hoạt
        </Button>

        {/* Nút Áp dụng nghiệp vụ (Publish + Bind module) */}
        {onPublishAndApply && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="rounded-xl font-bold px-4 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all border-none"
                disabled={isApplying}
              >
                {isApplying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Áp dụng nghiệp vụ
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/60 w-60">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                Chọn luồng nghiệp vụ
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workflowModules.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Chưa có workflow Published nào.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Hãy lưu và kích hoạt một workflow trước.
                  </p>
                </div>
              ) : (
                workflowModules.map((mod) => (
                  <DropdownMenuItem
                    key={mod.code}
                    className="rounded-lg cursor-pointer flex flex-col items-start gap-0.5 py-2"
                    onClick={() => handleApplyModule(mod.code)}
                  >
                    <span className="font-medium text-[12px]">{mod.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{mod.code}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="h-6 w-[1px] bg-border/60 mx-1" />
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted text-muted-foreground">
          <History className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-muted text-muted-foreground"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
