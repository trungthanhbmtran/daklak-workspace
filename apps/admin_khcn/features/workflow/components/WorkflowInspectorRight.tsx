"use client";

import {
  CircleHelp,
  GitBranch,
  Layers,
  PanelRightClose,
  Settings2,
  Trash2,
  UserRound,
  Workflow as WorkflowIcon,
  X,
  FileSpreadsheet,
} from "lucide-react";
import type { Edge } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { WorkflowNodeData, WorkflowPhase, WorkflowRole } from "@/features/workflow/api";
import {
  NODE_LABELS,
  EDGE_ACTION_LABELS,
  getNodeRoleInfo,
  type CanvasNode,
} from "../utils/workflow-graph-utils";

interface WorkflowInspectorRightProps {
  readOnly: boolean;
  isOpen: boolean;
  onToggle: () => void;
  currentNode?: CanvasNode;
  currentEdge?: Edge;
  phases: WorkflowPhase[];
  roles: { data?: WorkflowRole[]; isPending: boolean; isError: boolean };
  onUpdateNode: (patch: Partial<WorkflowNodeData>) => void;
  onUpdateEdge: (patch: Partial<Edge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onCloseSelection: () => void;
}

const FORM_PRESETS = [
  { code: "MAU_01", label: "MẪU 01 — Đăng ký danh mục công việc đầu kỳ" },
  { code: "MAU_02", label: "MẪU 02 — Cá nhân tự chấm điểm KPI" },
  { code: "MAU_04", label: "MẪU 04 — Kê khai nhiệm vụ đột xuất / nổi trội" },
  { code: "MAU_03", label: "MẪU 03 — Tập thể phòng họp nhận xét & thẩm định" },
  { code: "MAU_05", label: "MẪU 05 — Quyết định công nhận kết quả xếp loại" },
  { code: "MAU_2C", label: "MẪU 2C — Sơ yếu lý lịch cán bộ (TCCB)" },
];

export function WorkflowInspectorRight({
  readOnly,
  isOpen,
  onToggle,
  currentNode,
  currentEdge,
  phases,
  roles,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onCloseSelection,
}: WorkflowInspectorRightProps) {
  if (!isOpen) return null;

  const isUserTask = currentNode?.type === "user_task" || currentNode?.type === "userTask";
  const isServiceTask = currentNode?.type === "service_task" || currentNode?.type === "serviceTask";
  const nodeRole = currentNode ? getNodeRoleInfo(currentNode.id, currentNode.type, currentNode.data) : null;

  return (
    <aside className="w-84 shrink-0 border-l bg-card/70 backdrop-blur-xs flex flex-col min-w-0 h-full overflow-hidden transition-all z-10">
      {/* HEADER INSPECTOR */}
      <div className="flex items-center justify-between border-b px-3.5 py-2.5 bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <Settings2 className="size-4 text-primary shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {currentNode ? "Thuộc tính bước" : currentEdge ? "Thuộc tính nhánh" : "Thuộc tính"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(currentNode || currentEdge) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={onCloseSelection}
              title="Bỏ chọn"
            >
              <X className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={onToggle}
            title="Thu gọn cột phải"
          >
            <PanelRightClose className="size-4" />
          </Button>
        </div>
      </div>

      {/* BODY CUỘN */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* ==================== 1. KHI ĐANG CHỌN NODE ==================== */}
        {currentNode && (
          <div className="space-y-4">
            {/* THẺ TỔNG QUAN NODE */}
            <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono text-muted-foreground truncate" title={currentNode.id}>
                  ID: {currentNode.id}
                </span>
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {NODE_LABELS[currentNode.type || ""] || currentNode.type}
                </Badge>
              </div>
              {nodeRole && (
                <div className="pt-1">
                  <span className={`inline-flex items-center rounded-xs border px-1.5 py-0.5 text-[10px] font-semibold ${nodeRole.badgeClass}`}>
                    {nodeRole.label}
                  </span>
                </div>
              )}
            </div>

            {/* THÔNG TIN BƯỚC */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tên bước thực hiện</Label>
              <Input
                value={String(currentNode.data?.label || "")}
                onChange={(e) => onUpdateNode({ label: e.target.value })}
                disabled={readOnly}
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Thuộc giai đoạn / đợt</Label>
              <Select
                value={String(currentNode.data?.phaseId || "__unassigned__")}
                onValueChange={(val) => onUpdateNode({ phaseId: val === "__unassigned__" ? undefined : val })}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Chọn giai đoạn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Chưa gán giai đoạn</SelectItem>
                  {phases.map((phase, idx) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      GĐ {idx + 1}: {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {phases.length === 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Chưa có giai đoạn nào. Thêm giai đoạn ở cột bên trái để nhóm bước này.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mô tả nghiệp vụ</Label>
              <Textarea
                value={String(currentNode.data?.description || "")}
                onChange={(e) => onUpdateNode({ description: e.target.value })}
                disabled={readOnly}
                rows={2}
                placeholder="Nhiệm vụ, căn cứ hoặc lưu ý thực thi..."
                className="text-xs resize-none"
              />
            </div>

            {/* PHÂN CÔNG & THẨM QUYỀN (CHO USER TASK) */}
            {isUserTask && (
              <div className="rounded-lg border bg-card p-3 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <UserRound className="size-3.5 text-primary" /> Phân công & Thẩm quyền
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Chiến lược phân công</Label>
                  <Select
                    value={String(currentNode.data?.assignmentStrategy || "BY_ROLE")}
                    onValueChange={(val) => onUpdateNode({ assignmentStrategy: val })}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BY_ROLE">Theo chức danh / Vị trí việc làm</SelectItem>
                      <SelectItem value="CREATOR">Người tạo hồ sơ</SelectItem>
                      <SelectItem value="PREVIOUS_ACTOR">Người xử lý bước trước</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(currentNode.data?.assignmentStrategy === "BY_ROLE" || !currentNode.data?.assignmentStrategy) && (
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Chức danh phê duyệt</Label>
                    <Select
                      value={String(currentNode.data?.targetRole || "")}
                      onValueChange={(val) => onUpdateNode({ targetRole: val })}
                      disabled={readOnly || roles.isPending}
                    >
                      <SelectTrigger className="w-full text-xs h-8">
                        <SelectValue placeholder="Chọn chức danh từ API..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(roles.data ?? []).map((role) => (
                          <SelectItem key={role.code} value={role.code}>
                            {role.name} ({role.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {roles.isError && (
                      <p className="text-[10px] text-destructive">Không tải được danh sách chức danh từ backend.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MẪU BIỂU & DATA SCHEMA */}
            <div className="rounded-lg border bg-card p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="size-3.5 text-teal-600" /> Biểu mẫu nghiệp vụ
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Mẫu biểu áp dụng</Label>
                <Select
                  value={String(currentNode.data?.formPreset || "__none__")}
                  onValueChange={(val) => {
                    const preset = FORM_PRESETS.find((p) => p.code === val);
                    onUpdateNode({
                      formPreset: val === "__none__" ? undefined : val,
                      formSchema: preset ? preset.code : currentNode.data?.formSchema,
                    });
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder="Chọn mẫu biểu chuẩn..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Không áp dụng mẫu biểu</SelectItem>
                    {FORM_PRESETS.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* BƯỚC TỰ ĐỘNG (SERVICE TASK) */}
            {isServiceTask && (
              <div className="rounded-lg border bg-cyan-50/50 dark:bg-cyan-950/20 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
                  <Settings2 className="size-3.5" /> Mã hành động tự động (Action Code)
                </div>
                <Input
                  value={String(currentNode.data?.actionCode || "")}
                  onChange={(e) => onUpdateNode({ actionCode: e.target.value })}
                  disabled={readOnly}
                  placeholder="VD: AUDIT_08_SOURCES, APPLY_CAPS_20"
                  className="text-xs font-mono h-8"
                />
                <p className="text-[10px] text-muted-foreground leading-snug">
                  Mã định danh tác vụ mà Worker hoặc Rule Engine sẽ kích hoạt tự động.
                </p>
              </div>
            )}

            {/* NÚT XÓA BƯỚC */}
            {!readOnly && (
              <Button
                type="button"
                variant="destructive"
                className="w-full text-xs h-8 mt-2"
                onClick={() => onDeleteNode(currentNode.id)}
              >
                <Trash2 className="mr-1.5 size-3.5" /> Xóa bước này
              </Button>
            )}
          </div>
        )}

        {/* ==================== 2. KHI ĐANG CHỌN EDGE ==================== */}
        {currentEdge && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Nhánh nối:</span>
                <Badge variant="outline" className="text-[10px]">
                  {currentEdge.id}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {currentEdge.source} → {currentEdge.target}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nhãn hiển thị trên nhánh</Label>
              <Input
                value={
                  currentEdge.data?.workflowGeneratedLabel === currentEdge.label
                    ? ""
                    : typeof currentEdge.label === "string"
                    ? currentEdge.label
                    : ""
                }
                onChange={(e) => onUpdateEdge({ label: e.target.value })}
                disabled={readOnly}
                placeholder="VD: Hợp lệ, Duyệt, Có vi phạm..."
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mã Action chuyển trạng thái</Label>
              <Input
                value={String((currentEdge as any).action || currentEdge.data?.action || "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const label = EDGE_ACTION_LABELS[val] || val;
                  onUpdateEdge({
                    label: currentEdge.label ? currentEdge.label : label,
                    data: { ...(currentEdge.data || {}), action: val },
                  });
                }}
                disabled={readOnly}
                placeholder="VD: APPROVE, RETURN, SUBMIT_MAU_01"
                className="text-xs font-mono h-8"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Biểu thức điều kiện (Condition)</Label>
              <Input
                value={String(currentEdge.data?.condition || (currentEdge as any).condition || "")}
                onChange={(e) =>
                  onUpdateEdge({
                    data: { ...(currentEdge.data || {}), condition: e.target.value },
                  })
                }
                disabled={readOnly}
                placeholder="VD: score >= 80 && !hasViolation"
                className="text-xs font-mono h-8"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground flex gap-2">
              <CircleHelp className="size-4 shrink-0 text-primary mt-0.5" />
              <span>
                Điều kiện nghiệp vụ áp dụng cho các nhánh rẽ từ Exclusive Gateway hoặc kiểm soát luồng OCC.
              </span>
            </div>

            {!readOnly && (
              <Button
                type="button"
                variant="destructive"
                className="w-full text-xs h-8 mt-2"
                onClick={() => onDeleteEdge(currentEdge.id)}
              >
                <Trash2 className="mr-1.5 size-3.5" /> Xóa nhánh này
              </Button>
            )}
          </div>
        )}

        {/* ==================== 3. KHI CHƯA CHỌN GÌ ==================== */}
        {!currentNode && !currentEdge && (
          <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
            <WorkflowIcon className="size-8 mx-auto text-muted-foreground/50 mb-1" />
            <p className="font-medium text-foreground">Chưa chọn thành phần nào</p>
            <p className="text-[11px] leading-relaxed">
              Bấm vào bất kỳ bước nghiệp vụ (node) hoặc nhánh chuyển tiếp (edge) trên sơ đồ để xem và chỉnh sửa thuộc tính.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
