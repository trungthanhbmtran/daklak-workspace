"use client";

import { useState } from "react";
import {
  Boxes,
  Layers,
  Settings2,
  Plus,
  Trash2,
  ZoomIn,
  PanelLeftClose,
  Sparkles,
  UserRound,
  GitBranch,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationUnitSelector } from "./OrganizationUnitSelector";
import type { OrganizationUnitNode } from "@/features/system-admin/organization/types";
import type { WorkflowPhase } from "@/features/workflow/api";
import {
  NODE_OPTIONS,
  createCode,
  type CanvasNode,
} from "../utils/workflow-graph-utils";

interface WorkflowSidebarLeftProps {
  readOnly: boolean;
  isOpen: boolean;
  onToggle: () => void;
  name: string;
  setName: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  ownerUnitCode: string;
  setOwnerUnitCode: (v: string) => void;
  unitTree: OrganizationUnitNode[];
  isTreeLoading: boolean;
  isTreeError: boolean;
  phases: WorkflowPhase[];
  selectedPhaseId: string | null;
  newPhaseName: string;
  setNewPhaseName: (v: string) => void;
  onAddPhase: () => void;
  onUpdatePhase: (id: string, patch: Partial<WorkflowPhase>) => void;
  onRemovePhase: (id: string) => void;
  onFocusPhase: (id: string) => void;
  onAddNode: (type: string, label: string) => void;
  nodes: CanvasNode[];
}

export function WorkflowSidebarLeft({
  readOnly,
  isOpen,
  onToggle,
  name,
  setName,
  code,
  setCode,
  description,
  setDescription,
  ownerUnitCode,
  setOwnerUnitCode,
  unitTree,
  isTreeLoading,
  isTreeError,
  phases,
  selectedPhaseId,
  newPhaseName,
  setNewPhaseName,
  onAddPhase,
  onUpdatePhase,
  onRemovePhase,
  onFocusPhase,
  onAddNode,
  nodes,
}: WorkflowSidebarLeftProps) {
  const [activeTab, setActiveTab] = useState<"components" | "phases" | "settings">("components");

  if (!isOpen) return null;

  return (
    <aside className="w-full lg:w-80 lg:shrink-0 border-r bg-card/60 backdrop-blur-xs flex flex-col min-w-0 h-full overflow-hidden transition-all z-10">
      {/* HEADER SIDEBAR */}
      <div className="flex items-center justify-between border-b px-3.5 py-2.5 bg-muted/20">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Boxes className="size-4 text-primary" /> Thiết lập quy trình
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
          title="Thu gọn cột trái"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {/* TABS CHUYỂN ĐỔI: THÀNH PHẦN - GIAI ĐOẠN - CẤU HÌNH */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="px-3 pt-2.5 pb-1 border-b bg-background/50">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="components" className="text-xs px-1">
              Thành phần
            </TabsTrigger>
            <TabsTrigger value="phases" className="text-xs px-1 relative">
              Giai đoạn
              {phases.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 text-primary text-[10px] px-1 font-mono">
                  {phases.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-1">
              Thông tin
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ==================== TAB 1: THÀNH PHẦN (NODE PALETTE) ==================== */}
        <TabsContent value="components" className="flex-1 overflow-y-auto p-3.5 space-y-4 m-0">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Kéo thả hoặc bấm để thêm bước
            </h3>
            <div className="space-y-2">
              {NODE_OPTIONS.map(({ type, label, icon: Icon, description: nodeDesc }) => (
                <div
                  key={type}
                  draggable={!readOnly}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("application/reactflow", type);
                    event.dataTransfer.setData("application/reactflow-label", label);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => !readOnly && onAddNode(type, label)}
                  className={`group flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    readOnly
                      ? "opacity-60 cursor-not-allowed bg-muted/30"
                      : "cursor-grab active:cursor-grabbing hover:border-primary/50 hover:bg-accent/40 hover:shadow-2xs bg-card"
                  }`}
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground truncate">{label}</span>
                      <Plus className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                      {nodeDesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/20 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground mb-1 flex items-center gap-1">
              💡 Hướng dẫn thao tác:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Kéo thả hoặc bấm vào thẻ để đưa bước lên canvas.</li>
              <li>Nối từ điểm chấm tròn (handle) sang bước kế tiếp.</li>
              <li>Bấm vào bước hoặc đường nối để mở bảng thuộc tính bên phải.</li>
            </ul>
          </div>
        </TabsContent>

        {/* ==================== TAB 2: CÁC ĐỢT / GIAI ĐOẠN (PHASES) ==================== */}
        <TabsContent value="phases" className="flex-1 overflow-y-auto p-3.5 space-y-3.5 m-0">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Các đợt / Giai đoạn ({phases.length})
              </h3>
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground mb-2.5">
              Nhóm các bước trên canvas theo từng giai đoạn xử lý quy trình.
            </p>

            {!readOnly && (
              <div className="flex gap-1.5 mb-3">
                <Input
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddPhase();
                    }
                  }}
                  placeholder="Nhập tên giai đoạn mới..."
                  className="h-8 text-xs min-w-0"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={onAddPhase}
                  disabled={!newPhaseName.trim()}
                  className="h-8 px-2.5 text-xs shrink-0"
                >
                  <Plus className="size-3.5 mr-1" /> Thêm
                </Button>
              </div>
            )}

            {phases.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                <Layers className="size-6 mx-auto mb-1.5 opacity-40" />
                <p>Chưa có giai đoạn nào.</p>
                <p className="text-[10px] mt-0.5">Thêm giai đoạn để tạo ranh giới trực quan trên sơ đồ.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {phases.map((phase, index) => {
                  const phaseNodeCount = nodes.filter((n) => n.data?.phaseId === phase.id).length;
                  const isSelected = selectedPhaseId === phase.id;

                  return (
                    <div
                      key={phase.id}
                      className={`space-y-2 rounded-lg border p-2.5 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border bg-card/80 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono shrink-0">
                          GĐ {index + 1}
                        </Badge>
                        <Input
                          value={phase.name}
                          onChange={(e) => onUpdatePhase(phase.id, { name: e.target.value })}
                          disabled={readOnly}
                          className="h-7 text-xs font-semibold flex-1 min-w-0"
                        />
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemovePhase(phase.id)}
                            className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                            title="Xóa giai đoạn"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>

                      <Input
                        value={phase.description || ""}
                        onChange={(e) => onUpdatePhase(phase.id, { description: e.target.value })}
                        disabled={readOnly}
                        placeholder="Mô tả phạm vi giai đoạn (tùy chọn)..."
                        className="h-7 text-[11px] text-muted-foreground"
                      />

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                        <span>{phaseNodeCount} bước được gán</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onFocusPhase(phase.id)}
                          className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 gap-1"
                        >
                          <ZoomIn className="size-3" /> Xem trên sơ đồ
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ==================== TAB 3: THÔNG TIN CHUNG (SETTINGS) ==================== */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-3.5 space-y-4 m-0">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tên quy trình</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quy trình Đánh giá KPI quý..."
              disabled={readOnly}
              className="text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Mã quy trình (Code)</Label>
              {!readOnly && !code && (
                <button
                  type="button"
                  onClick={() => name && setCode(createCode(name))}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="size-3" /> Tự sinh
                </button>
              )}
            </div>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
              placeholder="VD: WF_BTCTU_DANH_GIA_KPI"
              disabled={readOnly}
              className="text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              Mã định danh duy nhất trong toàn hệ thống.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Đơn vị sở hữu quy trình</Label>
            <OrganizationUnitSelector
              value={ownerUnitCode}
              onChange={(val) => setOwnerUnitCode(val)}
              unitTree={unitTree}
              disabled={readOnly}
              isLoading={isTreeLoading}
              error={isTreeError}
            />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Đơn vị sở hữu giới hạn phạm vi áp dụng và quyền phát hành quy trình.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="side-desc" className="text-xs font-semibold">
              Mô tả quy trình
            </Label>
            <Textarea
              id="side-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục đích, căn cứ pháp lý và phạm vi điều chỉnh..."
              disabled={readOnly}
              rows={4}
              className="text-xs leading-relaxed resize-none"
            />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
