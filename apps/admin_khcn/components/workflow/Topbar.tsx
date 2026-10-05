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
  readOnly?: boolean;
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
  onOpenHistory,
  readOnly = false,
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
    <header className="h-16 w-full border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shadow-sm z-30 shrink-0">
      {/* Left Section: Back, Palette Toggle, Icon, Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="font-medium"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        
        <div className="h-6 w-[1px] bg-border mx-1" />

        <Button
          variant="secondary"
          size="sm"
          className="font-medium border border-border"
          onClick={onOpenPalette}
        >
          <PanelLeft className="h-4 w-4 mr-2 text-primary" />
          Khay tác nhân
        </Button>

        <div className="flex flex-col ml-4 border-l pl-4 border-border/50">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="h-8 text-sm font-semibold w-[300px] border-primary"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                  onClick={() => setIsEditingName(false)}
                >
                  <Check className="h-4 w-4 mr-1" /> Lưu tên
                </Button>
              </div>
            ) : (
              <>
                <h1
                  className={cn(
                    "text-base font-bold tracking-tight flex items-center gap-2 group",
                    !readOnly && "cursor-pointer hover:text-primary transition-colors"
                  )}
                  onClick={() => !readOnly && setIsEditingName(true)}
                  title={!readOnly ? "Nhấn để đổi tên" : undefined}
                >
                  {workflowName}
                  {!readOnly && <Edit3 className="h-4 w-4 opacity-50 group-hover:opacity-100 text-muted-foreground" />}
                </h1>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                  {readOnly ? "Chỉ xem" : "Bản nháp"}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="font-medium text-muted-foreground"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Cài đặt luồng
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="font-medium text-muted-foreground" 
          onClick={onOpenHistory}
        >
          <History className="h-4 w-4 mr-2" />
          Lịch sử
        </Button>

        {!readOnly && (
          <>
            <div className="h-6 w-[1px] bg-border mx-2" />

            <Button
              variant="outline"
              size="sm"
              className="font-medium border-primary/20 text-primary hover:bg-primary/5"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu thiết kế
            </Button>

            {/* Nút Áp dụng nghiệp vụ */}
            {onPublishAndApply && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-medium border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    Gắn vào Form
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] p-2">
                  <DropdownMenuLabel className="font-semibold text-sm">
                    Chọn Form / Luồng nghiệp vụ để gắn
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {workflowModules.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Chưa có Form nào. Hãy tạo Form trước.
                      </p>
                    </div>
                  ) : (
                    workflowModules.map((mod) => (
                      <DropdownMenuItem
                        key={mod.code}
                        className="cursor-pointer flex flex-col items-start gap-1 p-3"
                        onClick={() => handleApplyModule(mod.code)}
                      >
                        <span className="font-medium">{mod.name}</span>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{mod.code}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              size="sm"
              className="font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={onPublish}
            >
              <Send className="h-4 w-4 mr-2" />
              Kích hoạt & Đưa vào sử dụng
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Topbar;
