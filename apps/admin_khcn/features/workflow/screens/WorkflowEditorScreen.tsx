"use client";
import { memo, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Background, BackgroundVariant, Controls, Handle, MarkerType, MiniMap, Panel, Position, ReactFlow, ReactFlowProvider, addEdge, useReactFlow, useViewport, type Connection, type Edge, type Node, type NodeProps, useEdgesState, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowDownWideNarrow, ArrowLeft, Check, CircleHelp, GitBranch, Layers, Loader2, Plus, Save, Send, Settings2, Trash2, UserRound, Workflow as WorkflowIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePublishWorkflow, useSaveWorkflow, useWorkflowDefinition, useWorkflowRoles } from "@/features/workflow/hooks";
import type { Workflow, WorkflowGraph, WorkflowNodeData, WorkflowPhase } from "@/features/workflow/api";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
import { organizationApi } from "@/features/system-admin/organization/api";
import type { OrganizationUnitNode } from "@/features/system-admin/organization/types";
import { OrganizationUnitSelector } from "@/features/workflow/components/OrganizationUnitSelector";

type CanvasNode = Node<WorkflowNodeData>;
const START_NODES: CanvasNode[] = [{ id: "start-1", type: "start", position: { x: 80, y: 180 }, data: { label: "Bắt đầu" } }];
const NODE_OPTIONS = [
  { type: "user_task", label: "Bước phê duyệt", icon: UserRound },
  { type: "service_task", label: "Bước tự động", icon: Settings2 },
  { type: "exclusive_gateway", label: "Rẽ nhánh", icon: GitBranch },
  { type: "parallel_gateway", label: "Song song", icon: GitBranch },
  { type: "gateway", label: "Điều phối", icon: GitBranch },
  { type: "end", label: "Kết thúc", icon: Check },
] as const;
const NODE_LABELS: Record<string, string> = {
  start: "Bắt đầu",
  end: "Kết thúc",
  user_task: "Bước phê duyệt",
  userTask: "Bước phê duyệt",
  service_task: "Bước tự động",
  serviceTask: "Bước tự động",
  exclusive_gateway: "Rẽ nhánh",
  exclusiveGateway: "Rẽ nhánh",
  parallel_gateway: "Song song",
  parallelGateway: "Song song",
  gateway: "Điều phối",
};

const EDGE_ACTION_LABELS: Record<string, string> = {
  ASSIGN_START: "Khởi tạo & Giao việc",
  DISPATCH_TO_DEPT: "Phân luồng về phòng chuyên môn",
  ROUTED_TO_DEPT: "Tiếp nhận nhiệm vụ cấp phòng",
  ASSIGN_OFFICER: "Giao Chuyên viên 22 VTVL chủ trì",
  SUBMIT_FOR_REVIEW: "Nộp sản phẩm kèm minh chứng",
  CHECK_QUALITY: "Thẩm định chất lượng (3 mức lỗi)",
  RETURN: "Có lỗi · Trả lại sửa (-5% / -15% / -35%)",
  SUBMIT_TO_BAN: "Đạt chuẩn · Ký nháy trình Lãnh đạo Ban",
  EVALUATE_DECISION: "Xem xét & Phê duyệt Tờ trình",
  BAN_REQUEST_REVIEW: "Chỉ đạo rà soát lại",
  BAN_APPROVE: "Phê duyệt (Ký số CA) / Trình BTVTU",
  BAN_CANCEL: "Đình chỉ / Hủy nhiệm vụ",
  KPI_COMPLETED: "Tính điểm KPI 4 thành tố & Lưu trữ ATTT Cấp 3",
  INITIATE_PERIOD: "Kích hoạt kỳ đánh giá quý",
  SUBMIT_MAU_01: "Đăng ký danh mục (Mẫu 01)",
  SUBMIT_MAU_02: "Tự chấm điểm (Mẫu 02)",
  SUBMIT_MAU_04: "Kê khai nổi trội (Mẫu 04)",
  SUBMIT_MAU_03: "Họp phòng & Thẩm định (Mẫu 03)",
  CHECK_AUDIT: "Đối soát 08 nguồn CSDL & Rà soát kỷ luật",
  HAS_VIOLATION: "Có vi phạm (Kỷ luật / Lọt lộ bí mật)",
  NO_VIOLATION: "Không vi phạm (Đủ điều kiện xét)",
  FORWARD_DEMOTION: "Chuyển danh sách ấn định hạ bậc",
  CAPS_APPLIED: "Áp trần 20% & Trần người đứng đầu",
  COUNCIL_REVIEW: "Hội đồng Ban họp xét duyệt",
  REQUEST_REWORK: "Yêu cầu phòng rà soát lại",
  COUNCIL_APPROVED: "Hội đồng thông qua kết quả",
  PUBLISH_RESULTS: "Ban hành QĐ (Mẫu 05) & Công khai",
  CHECK: "Kiểm tra tính hợp lệ",
  INVALID: "Không hợp lệ · Từ chối",
  VALID: "Hợp lệ · Chuyển xác minh",
  VERIFIED: "Đã xác minh · Trình phê duyệt",
  APPROVE: "Phê duyệt",
  SUBMIT: "Trình duyệt hồ sơ / văn bản",
  REVIEW: "Thẩm định / Xem xét",
  PUBLISH: "Ban hành văn bản",
  REJECT: "Từ chối tiếp nhận",
  ASSIGN: "Phân công xử lý",
  ACCEPT: "Tiếp nhận xử lý",
  SUBMIT_REPORT: "Báo cáo kết quả",
  EVALUATE: "Đánh giá kết quả",
  REWORK: "Yêu cầu làm lại",
};

function getNodeRoleInfo(nodeId: string, nodeType?: string, data?: WorkflowNodeData) {
  const isGateway = nodeType?.toLowerCase().includes("gateway") ?? false;
  const isService = nodeType?.toLowerCase().includes("service") ?? false;
  const isStart = nodeType === "start";
  const isEnd = nodeType === "end";

  if (isStart) return { label: "KHỞI TẠO LUỒNG", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/60" };
  if (isEnd) return { label: "KẾT THÚC LUỒNG", badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60" };
  if (isGateway) return { label: "ĐIỀU PHỐI / RẼ NHÁNH", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/60" };
  if (isService) return { label: "HỆ THỐNG / RULE ENGINE", badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300/60" };

  const roleCode = String(data?.targetRole || "");
  const desc = String(data?.description || "");
  const label = String(data?.label || "");
  const id = nodeId.toLowerCase();

  if (id.startsWith("btv_") || label.includes("BTV") || desc.includes("BTV") || label.includes("Thường vụ") || desc.includes("Thường vụ")) {
    return { label: "BTV TỈNH ỦY", badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/70" };
  }
  if (id.startsWith("ldb_") || roleCode === "LANH_DAO_BAN" || label.includes("Lãnh đạo Ban") || desc.includes("Lãnh đạo Ban") || label.includes("Trưởng ban")) {
    return { label: "LÃNH ĐẠO BAN", badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-300/70" };
  }
  if (id.startsWith("ldp_") || roleCode === "LANH_DAO_PHONG" || label.includes("Lãnh đạo Phòng") || desc.includes("Lãnh đạo Phòng") || label.includes("Trưởng phòng") || id.includes("phong_hop")) {
    return { label: "LÃNH ĐẠO PHÒNG", badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/70" };
  }
  if (id.startsWith("cv_") || roleCode === "CHUYEN_VIEN" || label.includes("Chuyên viên") || desc.includes("Chuyên viên") || id.includes("officer") || id.includes("tucham") || id.includes("dangky") || id.includes("noitroi")) {
    return { label: "CHUYÊN VIÊN 22 VTVL", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/70" };
  }
  if (label.includes("Hội đồng") || id.includes("hoidong") || desc.includes("Hội đồng")) {
    return { label: "HỘI ĐỒNG THẨM ĐỊNH", badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/70" };
  }
  if (label.includes("MẪU") || label.includes("Mẫu")) {
    return { label: "MẪU BIỂU ĐÁNH GIÁ", badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300/70" };
  }

  return { label: "BƯỚC PHÊ DUYỆT", badgeClass: "bg-muted text-muted-foreground border-border" };
}

function extractFormBadge(label?: string, description?: string, formSchema?: unknown): string | null {
  const text = `${label || ""} ${description || ""} ${typeof formSchema === "string" ? formSchema : ""}`;
  const match = text.match(/MẪU\s*0[1-5]|Mẫu\s*0[1-5]|Mẫu\s*2C/i);
  return match ? match[0].toUpperCase() : null;
}

function CanvasNodeCard({ id, data, type, selected }: NodeProps<CanvasNode>) {
  const isGateway = type?.toLowerCase().includes("gateway") ?? false;
  const isService = type?.toLowerCase().includes("service") ?? false;
  const isStart = type === "start";
  const isEnd = type === "end";
  const inputHandles = data.inputHandles ?? [];
  const outputHandles = data.outputHandles ?? [];
  const roleInfo = getNodeRoleInfo(id, type, data);
  const formBadge = extractFormBadge(data.label, typeof data.description === "string" ? data.description : undefined, data.formSchema);

  const tone = isStart
    ? "border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40"
    : isEnd
    ? "border-slate-300 bg-slate-100/90 dark:bg-slate-800/60"
    : isGateway
    ? "border-amber-300 bg-amber-50/80 dark:bg-amber-950/40"
    : isService
    ? "border-cyan-300 bg-cyan-50/80 dark:bg-cyan-950/40"
    : "border-primary/25 bg-card/95";

  return (
    <div
      className={`min-w-48 max-w-64 rounded-xl border-2 p-3 shadow-md backdrop-blur-xs transition-all ${tone} ${
        selected ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : "hover:shadow-lg"
      }`}
    >
      {/* CÁC ĐIỂM NỐI VÀO (TARGET HANDLES) TRÊN, DƯỚI, TRÁI */}
      {type !== "start" && (
        <>
          <Handle
            id="target-top"
            type="target"
            position={Position.Top}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          <Handle
            id="target-bottom"
            type="target"
            position={Position.Bottom}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          {inputHandles.length > 0 ? (
            inputHandles.map((handleId, index) => (
              <Handle
                key={handleId}
                id={handleId}
                type="target"
                position={Position.Left}
                style={{ top: `${((index + 1) / (inputHandles.length + 1)) * 100}%` }}
                className="!size-3 !border-2 !border-background !bg-primary"
              />
            ))
          ) : (
            <Handle
              type="target"
              id="target-left"
              position={Position.Left}
              className="!size-3 !border-2 !border-background !bg-primary"
            />
          )}
        </>
      )}

      {/* HEADER: BADGE THẨM QUYỀN / LÀN BƯỚC */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-border/50 pb-1.5">
        <span
          className={`inline-flex items-center rounded-xs border px-1.5 py-0 text-[9px] font-semibold tracking-wider ${roleInfo.badgeClass}`}
        >
          {roleInfo.label}
        </span>
        {formBadge && (
          <span className="inline-flex items-center rounded-xs border border-teal-300 bg-teal-500/10 px-1 py-0 text-[9px] font-mono font-medium text-teal-700 dark:text-teal-300">
            {formBadge}
          </span>
        )}
      </div>

      {/* TIÊU ĐỀ BƯỚC */}
      <p className="mt-1.5 whitespace-normal break-words [overflow-wrap:anywhere] text-xs font-semibold leading-snug text-foreground">
        {data.label || NODE_LABELS[type ?? ""] || "Bước mới"}
      </p>

      {/* MÔ TẢ TÓM TẮT BƯỚC NGHIỆP VỤ */}
      {typeof data.description === "string" && data.description.trim() && (
        <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
          {data.description}
        </p>
      )}

      {/* CÁC ĐIỂM NỐI RA (SOURCE HANDLES) PHẢI, TRÊN, DƯỚI */}
      {type !== "end" && (
        <>
          <Handle
            id="source-top"
            type="source"
            position={Position.Top}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          <Handle
            id="source-bottom"
            type="source"
            position={Position.Bottom}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          {outputHandles.length > 0 ? (
            outputHandles.map((handleId, index) => (
              <Handle
                key={handleId}
                id={handleId}
                type="source"
                position={Position.Right}
                style={{ top: `${((index + 1) / (outputHandles.length + 1)) * 100}%` }}
                className="!size-3 !border-2 !border-background !bg-primary"
              />
            ))
          ) : (
            <Handle
              type="source"
              id="source-right"
              position={Position.Right}
              className="!size-3 !border-2 !border-background !bg-primary"
            />
          )}
        </>
      )}
    </div>
  );
}

const WorkflowCanvasOverlay = memo(function WorkflowCanvasOverlay({
  workflowCode,
  workflowName,
  phases,
  nodes,
}: {
  workflowCode?: string;
  workflowName?: string;
  phases: WorkflowPhase[];
  nodes: CanvasNode[];
}) {
  const { x, y, zoom } = useViewport();
  const searchKey = `${workflowCode || ""} ${workflowName || ""}`.toUpperCase();

  const isBtctuTaskManagement =
    searchKey.includes("QUAN_LY_CONG_VIEC") ||
    searchKey.includes("TASK_MANAGEMENT") ||
    searchKey.includes("QUẢN LÝ CÔNG VIỆC");

  if (!isBtctuTaskManagement && phases.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible select-none z-0"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
        transformOrigin: "0 0",
        willChange: "transform",
        contain: "paint layout",
      }}
    >
      {isBtctuTaskManagement && (
        <>
          {/* LÀN 1: BAN THƯỜNG VỤ TỈNH ỦY */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-purple-400/50 bg-purple-500/[0.04] dark:border-purple-600/40 dark:bg-purple-950/[0.12]"
            style={{ left: 20, top: 20, width: 2850, height: 190 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-purple-800 dark:text-purple-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-purple-500/20 text-[11px]">🏛️</span>
              <span>LÀN 1: BAN THƯỜNG VỤ TỈNH ỦY / THƯỜNG TRỰC TỈNH ỦY</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Giao nhiệm vụ, phê duyệt chủ trương, đề án & ban hành kết luận
              </span>
            </div>
          </div>

          {/* LÀN 2: LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-rose-400/50 bg-rose-500/[0.04] dark:border-rose-600/40 dark:bg-rose-950/[0.12]"
            style={{ left: 20, top: 230, width: 2850, height: 230 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-rose-800 dark:text-rose-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-[11px]">🔴</span>
              <span>LÀN 2: LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY (Trưởng ban & 4 Phó ban)</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Tiếp nhận chỉ đạo, phân công cấp Phòng, thẩm định Tờ trình, ký số CA & tự động tính KPI
              </span>
            </div>
          </div>

          {/* LÀN 3: LÃNH ĐẠO PHÒNG CHUYÊN MÔN */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-blue-400/50 bg-blue-500/[0.04] dark:border-blue-600/40 dark:bg-blue-950/[0.12]"
            style={{ left: 20, top: 480, width: 2850, height: 210 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-blue-800 dark:text-blue-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-[11px]">🔵</span>
              <span>LÀN 3: LÃNH ĐẠO PHÒNG CHUYÊN MÔN (Trưởng / Phó 05 Phòng)</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Phân rã việc, gán hệ số K & trọng số A/B/C/D, kiểm soát 3 mức lỗi (-5%, -15%, -35%), ký nháy Tờ trình
              </span>
            </div>
          </div>

          {/* LÀN 4: CHUYÊN VIÊN NGHIỆP VỤ 22 VTVL */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-emerald-400/50 bg-emerald-500/[0.04] dark:border-emerald-600/40 dark:bg-emerald-950/[0.12]"
            style={{ left: 20, top: 710, width: 2850, height: 200 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-emerald-800 dark:text-emerald-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-[11px]">🟢</span>
              <span>LÀN 4: CHUYÊN VIÊN NGHIỆP VỤ (22 Vị trí việc làm & Người phối hợp)</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Thực thi chuyên môn (TCCB Mẫu 2C, TCĐ-ĐV LGSP, BVCTNB Mức 3, Văn phòng ATTT Cấp 3), nộp minh chứng
              </span>
            </div>
          </div>
        </>
      )}

      {phases.map((phase, index) => {
        const phaseNodes = nodes.filter((node) => node.data.phaseId === phase.id);
        if (!phaseNodes.length) return null;
        const left = Math.min(...phaseNodes.map((node) => node.position.x)) - 36;
        const top = Math.min(...phaseNodes.map((node) => node.position.y)) - 54;
        const right = Math.max(...phaseNodes.map((node) => node.position.x)) + 260;
        const bottom = Math.max(...phaseNodes.map((node) => node.position.y)) + 150;
        return (
          <div
            key={phase.id}
            className="absolute rounded-2xl border-2 border-dashed border-primary/35 bg-primary/[0.025]"
            style={{ left, top, width: Math.max(320, right - left + 36), height: Math.max(190, bottom - top + 36) }}
          >
            <div className="flex flex-col gap-0.5 px-4 py-2.5 text-xs font-semibold text-primary">
              <span>ĐỢT {index + 1}: {phase.name} <span className="font-normal text-muted-foreground">· {phaseNodes.length} bước</span></span>
              {phase.description && <span className="text-[10px] font-normal text-muted-foreground">{phase.description}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
});


const nodeTypes = {
  start: CanvasNodeCard,
  end: CanvasNodeCard,
  user_task: CanvasNodeCard,
  userTask: CanvasNodeCard,
  service_task: CanvasNodeCard,
  serviceTask: CanvasNodeCard,
  exclusive_gateway: CanvasNodeCard,
  exclusiveGateway: CanvasNodeCard,
  parallel_gateway: CanvasNodeCard,
  parallelGateway: CanvasNodeCard,
  gateway: CanvasNodeCard,
};

function asGraph(workflow?: Workflow): WorkflowGraph | undefined {
  const definition = workflow?.definition;
  if (definition && "nodes" in definition && Array.isArray(definition.nodes)) return definition as WorkflowGraph;
  if (definition && "graph" in definition && definition.graph) return definition.graph;
  if (workflow?.bpmnLogic && Array.isArray(workflow.bpmnLogic.nodes)) return workflow.bpmnLogic;
  return undefined;
}
function edgeEndpoint(primary?: string, legacy?: string) {
  return primary?.trim() || legacy?.trim() || "";
}
function edgeHandleIds(workflow: Workflow | undefined, nodeId: string, side: "source" | "target"): string[] {
  const graph = asGraph(workflow);
  const handleIds = new Set<string>();
  for (const edge of graph?.edges ?? []) {
    const endpoint = side === "source"
      ? edgeEndpoint(edge.source, edge.sourceNodeId)
      : edgeEndpoint(edge.target, edge.targetNodeId);
    const handleId = side === "source" ? edge.sourceHandle : edge.targetHandle;
    if (endpoint !== nodeId) continue;
    if (handleId?.trim()) handleIds.add(handleId.trim());
  }
  const fixedHandleIds = new Set([`${side}-top`, `${side}-bottom`, side === "source" ? "source-right" : "target-left"]);
  const sortedHandles = [...handleIds].sort((left, right) => {
    const order = (value: string) => value === "true" ? 0 : value === "false" ? 1 : 2;
    return order(left) - order(right) || left.localeCompare(right);
  });
  return sortedHandles.filter((id) => !fixedHandleIds.has(id));
}
function readPosition(value: unknown): { x: number; y: number } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const position = value as Record<string, unknown>;
  const readCoordinate = (coordinate: unknown) => {
    if (typeof coordinate === "number") return coordinate;
    if (typeof coordinate === "string" && coordinate.trim()) return Number(coordinate);
    return Number.NaN;
  };
  const x = readCoordinate(position.x);
  const y = readCoordinate(position.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined;
}
function metadataPositions(metadata: unknown): Map<string, { x: number; y: number }> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return new Map();
  const value = metadata as Record<string, unknown>;
  const graph = value.graph && typeof value.graph === "object" ? value.graph as Record<string, unknown> : undefined;
  const nodes = Array.isArray(value.nodes) ? value.nodes : Array.isArray(graph?.nodes) ? graph.nodes : [];
  return new Map(nodes.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const node = item as Record<string, unknown>;
    const id = typeof node.id === "string" ? node.id : "";
    const position = readPosition(node.position) ?? readPosition(node.positionAbsolute);
    return id && position ? [[id, position] as const] : [];
  }));
}

function layeredPositions(nodes: WorkflowGraph["nodes"], edges: WorkflowGraph["edges"]): Map<string, { x: number; y: number }> {
  const outgoing = new Map(nodes.map((node) => [node.id, [] as Array<{ id: string; priority: number; index: number }>]));
  const incomingCount = new Map(nodes.map((node) => [node.id, 0]));
  edges.forEach((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);
    if (!outgoing.has(source) || !incomingCount.has(target)) return;
    const handle = (edge.sourceHandle || "").toLowerCase();
    const priority = handle === "true" || handle === "yes" ? 0 : handle === "false" || handle === "no" ? 2 : 1;
    outgoing.get(source)?.push({ id: target, priority, index });
    incomingCount.set(target, (incomingCount.get(target) ?? 0) + 1);
  });
  for (const children of outgoing.values()) children.sort((left, right) => left.priority - right.priority || left.index - right.index);

  const ranks = new Map<string, number>();
  const discoveryOrder = new Map<string, number>();
  let nextOrder = 0;
  const placeReachableNodes = (rootId: string, rootRank: number) => {
    if (ranks.has(rootId)) return;
    ranks.set(rootId, rootRank);
    discoveryOrder.set(rootId, nextOrder++);
    const queue = [rootId];
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const source = queue[cursor];
      for (const child of outgoing.get(source) ?? []) {
        if (ranks.has(child.id)) continue;
        ranks.set(child.id, (ranks.get(source) ?? rootRank) + 1);
        discoveryOrder.set(child.id, nextOrder++);
        queue.push(child.id);
      }
    }
  };
  const roots = nodes
    .filter((node) => incomingCount.get(node.id) === 0)
    .sort((left, right) => Number(right.type === "start") - Number(left.type === "start"));
  for (const root of roots) placeReachableNodes(root.id, 0);
  if (ranks.size === 0 && nodes[0]) placeReachableNodes(nodes[0].id, 0);
  let nextComponentRank = Math.max(0, ...ranks.values()) + 1;
  for (const node of nodes) {
    if (ranks.has(node.id)) continue;
    placeReachableNodes(node.id, nextComponentRank);
    nextComponentRank = Math.max(nextComponentRank, ...ranks.values()) + 1;
  }

  const layers = new Map<number, string[]>();
  for (const node of nodes) {
    const rank = ranks.get(node.id) ?? 0;
    layers.set(rank, [...(layers.get(rank) ?? []), node.id]);
  }
  for (const ids of layers.values()) ids.sort((left, right) => (discoveryOrder.get(left) ?? 0) - (discoveryOrder.get(right) ?? 0));

  const positions = new Map<string, { x: number; y: number }>();
  for (const [rank, ids] of layers) {
    ids.forEach((id, index) => positions.set(id, {
      x: 80 + rank * 280,
      y: 120 + (index - (ids.length - 1) / 2) * 190,
    }));
  }
  return positions;
}
function autoLayoutPositions(nodes: WorkflowGraph["nodes"], edges: WorkflowGraph["edges"]): Map<string, { x: number; y: number }> {
  const children = new Map(nodes.map((node) => [node.id, [] as Array<{ id: string; priority: number; index: number }>]));
  const parents = new Map(nodes.map((node) => [node.id, new Set<string>()]));
  edges.forEach((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);
    if (!children.has(source) || !parents.has(target) || parents.get(target)?.has(source)) return;
    const handle = (edge.sourceHandle || "").toLowerCase();
    const priority = handle === "true" || handle === "yes" ? 0 : handle === "false" || handle === "no" ? 2 : 1;
    children.get(source)?.push({ id: target, priority, index });
    parents.get(target)?.add(source);
  });
  for (const items of children.values()) items.sort((left, right) => left.priority - right.priority || left.index - right.index);

  const roots = nodes
    .filter((node) => parents.get(node.id)?.size === 0)
    .sort((left, right) => Number(right.type === "start") - Number(left.type === "start"));
  const remainingParents = new Map(nodes.map((node) => [node.id, parents.get(node.id)?.size ?? 0]));
  const queue = roots.map((node) => node.id);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    for (const child of children.get(queue[cursor]) ?? []) {
      const remaining = (remainingParents.get(child.id) ?? 0) - 1;
      remainingParents.set(child.id, remaining);
      if (remaining === 0) queue.push(child.id);
    }
  }

  // A tree gives each node at most one parent. Put each leaf on its own row,
  // then center each parent over its child branches. Use layered layout for joins and cycles.
  const isTree = queue.length === nodes.length && nodes.every((node) => (parents.get(node.id)?.size ?? 0) <= 1);
  if (!isTree) return layeredPositions(nodes, edges);

  const positions = new Map<string, { x: number; y: number }>();
  let leafIndex = 0;
  const placeSubtree = (nodeId: string, depth: number): number => {
    const childIds = (children.get(nodeId) ?? []).map((child) => child.id);
    const childRows = childIds.map((childId) => placeSubtree(childId, depth + 1));
    const y = childRows.length
      ? (childRows[0] + childRows[childRows.length - 1]) / 2
      : 100 + leafIndex++ * 190;
    positions.set(nodeId, { x: 80 + depth * 280, y });
    return y;
  };
  for (const root of roots) placeSubtree(root.id, 0);
  return positions;
}

function nextNodeId(type: string, nodes: CanvasNode[]) {
  let sequence = nodes.length + 1;
  let id = `${type}-${sequence}`;
  while (nodes.some((node) => node.id === id)) {
    sequence += 1;
    id = `${type}-${sequence}`;
  }
  return id;
}
function graphNodes(workflow?: Workflow): CanvasNode[] {
  const graph = asGraph(workflow);
  if (!graph?.nodes.length) return START_NODES;
  const graphMetadata = (graph as WorkflowGraph & { _uiMetadata?: unknown })._uiMetadata;
  const positionSources = [
    new Map(graph.nodes.flatMap((node) => { const position = readPosition(node.position); return position ? [[node.id, position] as const] : []; })),
    new Map(graph.nodes.flatMap((node) => { const position = readPosition(node.positionAbsolute); return position ? [[node.id, position] as const] : []; })),
    metadataPositions(workflow?.uiMetadata),
    metadataPositions(graphMetadata),
  ];
  // Giữ nguyên 100% tọa độ thiết kế của đồ thị (Swimlane / Phân cấp)
  let positions = positionSources.find((source) => source.size === graph.nodes.length);
  if (!positions) {
    const combined = new Map<string, { x: number; y: number }>();
    for (const source of positionSources) {
      for (const [nodeId, position] of source) {
        if (!combined.has(nodeId)) combined.set(nodeId, position);
      }
    }
    positions = combined.size === graph.nodes.length ? combined : autoLayoutPositions(graph.nodes, graph.edges ?? []);
  }
  return graph.nodes.map((node, index) => {
    const assignment = node.assignments?.[0];
    const nodeType = node.type || "user_task";
    return {
      ...node,
      type: nodeType,
      position: positions.get(node.id) ?? { x: 80 + (index % 3) * 260, y: 100 + Math.floor(index / 3) * 180 },
      data: {
        ...(node.data || {}),
        label: String(node.data?.label || node.name || node.type || "Bước"),
        description: node.data?.description || node.description,
        formSchema: node.data?.formSchema,
        targetStatus: node.data?.targetStatus,
        assignmentStrategy: node.data?.assignmentStrategy || assignment?.type || "BY_ROLE",
        targetRole: node.data?.targetRole || (assignment?.type === "BY_ROLE" ? assignment.value : undefined),
        inputHandles: edgeHandleIds(workflow, node.id, "target"),
        outputHandles: edgeHandleIds(workflow, node.id, "source"),
      },
    };
  }) as unknown as CanvasNode[];
}
function graphEdges(workflow?: Workflow): Edge[] {
  const graph = asGraph(workflow);
  return (graph?.edges ?? []).map((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);
    const sourceHandle = edge.sourceHandle?.trim() || "source-right";
    const targetHandle = edge.targetHandle?.trim() || "target-left";
    const action = edge.action || (typeof edge.data?.action === "string" ? edge.data.action : "");
    const actionLabel = action ? (EDGE_ACTION_LABELS[action] || action) : "";
    const branchLabel = sourceHandle === "true" ? "Đúng" : sourceHandle === "false" ? "Sai" : "";
    const condition = edge.condition ?? edge.data?.condition ?? edge.data?.expression;
    const rawLabel = edge.label?.trim() || (typeof edge.data?.label === "string" ? edge.data.label.trim() : "");
    const displayLabel = rawLabel || [actionLabel, branchLabel].filter(Boolean).join(" · ") || branchLabel || actionLabel || undefined;
    const generatedLabel = !rawLabel && Boolean(displayLabel);
    return {
      ...edge,
      id: edge.id || `edge-${index}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: "smoothstep",
      label: displayLabel,
      data: {
        ...(edge.data ?? {}),
        ...(condition === undefined ? {} : { condition }),
        ...(generatedLabel ? { workflowGeneratedLabel: displayLabel } : {}),
      },
      style: { ...(edge.style ?? {}), stroke: "var(--primary)", strokeWidth: 2.25 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" },
      labelStyle: { fill: "var(--foreground)", fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: "var(--background)", fillOpacity: 0.95 },
      labelBgPadding: [5, 3],
      labelBgBorderRadius: 4,
    };
  }) as Edge[];
}
function createCode(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}

function WorkflowEditor({ id, workflow, forceReadOnly = false }: { id?: string; workflow?: Workflow; forceReadOnly?: boolean }) {
  const router = useRouter();
  const roles = useWorkflowRoles();
  const save = useSaveWorkflow();
  const publish = usePublishWorkflow();
  const [workflowId, setWorkflowId] = useState(id);
  const [name, setName] = useState(workflow?.name || "");
  const [code, setCode] = useState(workflow?.code || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [ownerUnitCode, setOwnerUnitCode] = useState(workflow?.ownerUnitCode || "");
  const [phases, setPhases] = useState<WorkflowPhase[]>(() => asGraph(workflow)?.phases ?? []);
  const [newPhaseName, setNewPhaseName] = useState("");
  const organizationTree = useQuery({ queryKey: ["organizations", "tree"], queryFn: () => organizationApi.getTree() });
  const unitTreeData = organizationTree.data as unknown;
  const unitTree = Array.isArray(unitTreeData)
    ? unitTreeData as OrganizationUnitNode[]
    : unitTreeData && typeof unitTreeData === "object" && Array.isArray((unitTreeData as { data?: unknown }).data)
      ? (unitTreeData as { data: OrganizationUnitNode[] }).data
      : [];
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(graphNodes(workflow));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(graphEdges(workflow));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const { screenToFlowPosition, fitView: fitWorkflowView } = useReactFlow();
  const readOnly = forceReadOnly;
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const currentNode = useMemo(() => nodes.find((node) => node.id === selectedNode), [nodes, selectedNode]);
  const currentEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdge), [edges, selectedEdge]);
  const updateNode = (patch: Partial<WorkflowNodeData>) => setNodes((items) => items.map((node) => node.id === selectedNode ? { ...node, data: { ...node.data, ...patch } } : node));
  const updateEdge = (patch: Partial<Edge>) => setEdges((items) => items.map((edge) => edge.id === selectedEdge ? { ...edge, ...patch } : edge));
  function addNode(type: string, label: string) {
    const node: CanvasNode = { id: nextNodeId(type, nodes), type, position: { x: 100 + (nodes.length % 3) * 240, y: 130 + Math.floor(nodes.length / 3) * 150 }, data: { label } };
    setNodes((items) => [...items, node]); setSelectedNode(node.id); setSelectedEdge(null);
  }
  function arrangeWorkflow() {
    const positions = autoLayoutPositions(nodes as unknown as WorkflowGraph["nodes"], edges as unknown as WorkflowGraph["edges"]);
    setNodes((items) => items.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position })));
    requestAnimationFrame(() => void fitWorkflowView({ padding: 0.18, duration: 350, minZoom: 0.3, maxZoom: 1.1 }));
    toast.success("Đã sắp xếp các bước theo luồng xử lý");
  }
  function addWorkflowPhase() {
    const phaseName = newPhaseName.trim();
    if (!phaseName) return;
    const id = `phase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setPhases((items) => [...items, { id, name: phaseName, order: items.length + 1 }]);
    setNewPhaseName("");
    setSelectedPhaseId(id);
  }
  function updateWorkflowPhase(phaseId: string, patch: Partial<WorkflowPhase>) {
    setPhases((items) => items.map((phase) => phase.id === phaseId ? { ...phase, ...patch } : phase));
  }
  function removeWorkflowPhase(phaseId: string) {
    setPhases((items) => items.filter((phase) => phase.id !== phaseId).map((phase, index) => ({ ...phase, order: index + 1 })));
    setNodes((items) => items.map((node) => node.data.phaseId === phaseId
      ? { ...node, data: { ...node.data, phaseId: undefined } }
      : node));
    if (selectedPhaseId === phaseId) setSelectedPhaseId(null);
  }
  function focusWorkflowPhase(phaseId: string) {
    const phaseNodes = nodes.filter((node) => node.data.phaseId === phaseId);
    if (!phaseNodes.length) {
      setSelectedPhaseId(phaseId);
      toast.info("Chưa gán bước nào vào đợt này. Chọn đợt ở thuộc tính của từng bước.");
      return;
    }
    setSelectedPhaseId(phaseId);
    void fitWorkflowView({ nodes: phaseNodes, padding: 0.28, duration: 450, minZoom: 0.35, maxZoom: 1.1 });
  }
  function graphForSave(): WorkflowGraph {
    return {
      nodes: nodes.map(({ selected: _selected, dragging: _dragging, measured: _measured, ...node }) => ({
        ...node,
        type: node.type || "user_task",
        ...(node.type === "user_task" ? { assignments: [{ id: `${node.id}:assignment`, type: String(node.data.assignmentStrategy || "BY_ROLE"), value: String(node.data.targetRole || "") }] } : {}),
      })),
      edges: edges.map(({ selected: _selected, label, ...edge }) => {
        const data = { ...(edge.data ?? {}) };
        const generatedLabel = data.workflowGeneratedLabel === label;
        delete data.workflowGeneratedLabel;
        const normalizedLabel = typeof label === "string" && label.trim() ? label.trim() : undefined;
        return {
          ...edge,
          data: {
            ...data,
            ...(normalizedLabel ? { label: normalizedLabel } : {}),
          },
          label: normalizedLabel,
          source: edge.source,
          target: edge.target,
          ...(data.condition === undefined ? {} : { condition: data.condition }),
        };
      }),
      phases: phases.map((phase, index) => ({ ...phase, order: index + 1 })),
    };
  }
  async function saveDraft() {
    if (!name.trim()) { toast.error("Nhập tên quy trình trước khi lưu"); return; }
    const nextCode = code.trim() || createCode(name);
    if (!nextCode) { toast.error("Nhập mã quy trình"); return; }
    try {
      const result = await save.mutateAsync({ id: workflowId, data: { name: name.trim(), code: nextCode, description: description.trim() || undefined, ownerUnitCode: ownerUnitCode || undefined, definition: graphForSave() } });
      setWorkflowId(result.id); setCode(result.code); toast.success("Đã lưu bản nháp vào workflow API");
      if (!id) router.replace(WORKFLOW_ROUTES.edit(result.id));
    } catch { toast.error("Backend không thể lưu bản nháp. Kiểm tra dữ liệu bắt buộc và quyền truy cập."); }
  }
  async function publishWorkflow() {
    if (!workflowId) { toast.error("Lưu bản nháp trước khi phát hành"); return; }
    if (!ownerUnitCode) { toast.error("Chọn đơn vị sở hữu quy trình trước khi phát hành"); return; }
    try { await publish.mutateAsync(workflowId); toast.success("Backend đã kiểm tra và phát hành phiên bản"); }
    catch { toast.error("Backend chưa thể phát hành. Kiểm tra cấu trúc, kết nối và thông báo API."); }
  }
  return <div className="flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-xl border bg-background">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b p-3"><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => router.push(WORKFLOW_ROUTES.list)} aria-label="Quay lại"><ArrowLeft /></Button><div><div className="flex items-center gap-2"><Input className="h-8 w-64 font-semibold" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên quy trình" disabled={readOnly} aria-label="Tên quy trình" />{workflow && <Badge variant={workflow.status === "PUBLISHED" ? "default" : "secondary"}>{workflow.status === "PUBLISHED" ? "Đã phát hành · lưu sẽ tạo nháp" : "Bản nháp"} · v{workflow.version ?? 1}</Badge>}</div><p className="ml-1 mt-1 text-xs text-muted-foreground">{code || "Mã sẽ được tạo từ tên quy trình"}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" onClick={() => void saveDraft()} disabled={readOnly || save.isPending}><Save />{save.isPending ? "Đang lưu…" : "Lưu nháp"}</Button><Button onClick={() => void publishWorkflow()} disabled={readOnly || publish.isPending || !workflowId || !ownerUnitCode}><Send />{publish.isPending ? "Đang phát hành…" : "Phát hành"}</Button></div></header>
    <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside className="space-y-5 overflow-y-auto border-b p-4 xl:border-b-0 xl:border-r">
        <section>
          <h2 className="mb-3 text-sm font-semibold">Thành phần</h2>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">{NODE_OPTIONS.map(({ type, label, icon: Icon }) => <Button key={type} variant="outline" size="sm" className="justify-start cursor-grab active:cursor-grabbing" draggable={!readOnly} onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', type); event.dataTransfer.setData('application/reactflow-label', label); event.dataTransfer.effectAllowed = 'move'; }} disabled={readOnly} onClick={() => addNode(type, label)}><Icon />{label}</Button>)}</div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Kéo thả hoặc bấm để thêm bước. Nối từ handle nguồn sang bước kế tiếp.</p>
        </section>
        <section className="space-y-2 rounded-lg border p-3">
          <div><h2 className="text-sm font-semibold">Các đợt xử lý</h2><p className="text-xs text-muted-foreground">Tạo đợt theo quy trình và gán từng bước ở phần thuộc tính node.</p></div>
          {!readOnly && <div className="flex gap-2"><Input value={newPhaseName} onChange={(event) => setNewPhaseName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addWorkflowPhase(); } }} placeholder="Tên đợt mới" aria-label="Tên đợt mới" /><Button type="button" size="icon" onClick={addWorkflowPhase} disabled={!newPhaseName.trim()} aria-label="Thêm đợt"><Plus className="size-4" /></Button></div>}
          {phases.length === 0 ? <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">Chưa có đợt nào. Thêm đợt để nhóm các bước trên canvas.</p> : <div className="space-y-2">{phases.map((phase, index) => <div key={phase.id} className="space-y-1.5 rounded-md bg-muted/40 p-2"><div className="flex items-center gap-1.5"><Badge variant="outline">{index + 1}</Badge><Input value={phase.name} onChange={(event) => updateWorkflowPhase(phase.id, { name: event.target.value })} disabled={readOnly} aria-label={`Tên đợt ${index + 1}`} />{!readOnly && <Button type="button" variant="ghost" size="icon" onClick={() => removeWorkflowPhase(phase.id)} aria-label={`Xóa đợt ${phase.name}`}><Trash2 className="size-4 text-destructive" /></Button>}</div><Input value={phase.description || ""} onChange={(event) => updateWorkflowPhase(phase.id, { description: event.target.value })} disabled={readOnly} placeholder="Mô tả (không bắt buộc)" aria-label={`Mô tả đợt ${index + 1}`} /><p className="text-[11px] text-muted-foreground">{nodes.filter((node) => node.data.phaseId === phase.id).length} bước được gán</p></div>)}</div>}
        </section>
        <section className="space-y-2"><Label>Đơn vị sở hữu quy trình</Label><OrganizationUnitSelector value={ownerUnitCode} onChange={(value) => setOwnerUnitCode(value)} unitTree={unitTree} disabled={readOnly} isLoading={organizationTree.isPending} error={organizationTree.isError} /><p className="text-[11px] leading-relaxed text-muted-foreground">Đơn vị sở hữu dùng để giới hạn quy trình và mẫu biểu đánh giá được gán.</p></section>
        <section className="space-y-2"><Label htmlFor="workflow-description">Mô tả quy trình</Label><Textarea id="workflow-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mục đích và phạm vi áp dụng" disabled={readOnly} /></section>
      </aside>
      <div className="relative h-[60vh] min-h-[440px] xl:h-auto" onDrop={readOnly ? undefined : (event) => { event.preventDefault(); const type = event.dataTransfer.getData('application/reactflow'); const label = event.dataTransfer.getData('application/reactflow-label'); if (!type) return; const position = screenToFlowPosition({ x: event.clientX, y: event.clientY }); const newNode: CanvasNode = { id: nextNodeId(type, nodes), type, position, data: { label } }; setNodes((nds) => nds.concat(newNode)); setSelectedNode(newNode.id); setSelectedEdge(null); }} onDragOver={readOnly ? undefined : (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}>
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-lg border bg-background/95 p-1.5 shadow-sm backdrop-blur">
          <span className="hidden px-2 text-xs text-muted-foreground md:inline">Bố cục sơ đồ</span>
          <Button type="button" size="sm" variant="outline" onClick={arrangeWorkflow} disabled={nodes.length < 2}>
            <ArrowDownWideNarrow className="size-4" />
            Sắp xếp theo luồng
          </Button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : (connection: Connection) => setEdges((items) => addEdge({ ...connection, sourceHandle: connection.sourceHandle || "source-right", targetHandle: connection.targetHandle || "target-left", id: `edge-${Math.random().toString(36).substring(2, 10)}`, type: "smoothstep", animated: true, style: { stroke: "var(--primary)", strokeWidth: 2.25 }, markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" } }, items))}
          onNodeClick={(_event, node) => { setSelectedNode(node.id); setSelectedEdge(null); }}
          onEdgeClick={(_event, edge) => { setSelectedEdge(edge.id); setSelectedNode(null); }}
          onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
          nodesConnectable={!readOnly}
          nodesDraggable={!readOnly}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.45, maxZoom: 1.15 }}
        >
          <WorkflowCanvasOverlay workflowCode={workflow?.code || code} workflowName={name || workflow?.name} phases={phases} nodes={nodes} />
          {(() => {
            if (phases.length > 0) {
              return (
                <Panel position="top-left" className="m-2 flex max-w-[min(920px,calc(100vw-32px))] flex-wrap items-center gap-1.5 rounded-lg border bg-card/95 p-2 shadow-sm backdrop-blur-xs text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Layers className="size-3.5 text-primary" /> Các đợt · bấm để xem trên canvas:
                  </span>
                  {phases.map((phase, index) => {
                    const count = nodes.filter((node) => node.data.phaseId === phase.id).length;
                    const active = selectedPhaseId === phase.id;
                    return (
                      <Button
                        key={phase.id}
                        type="button"
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className="h-auto min-h-8 gap-2 px-2 py-1 text-left"
                        title={phase.description || phase.name}
                        onClick={() => focusWorkflowPhase(phase.id)}
                      >
                        <span>{index + 1}. {phase.name}</span>
                        <Badge variant={active ? "secondary" : "outline"} className="px-1.5 py-0 text-[10px]">{count} bước</Badge>
                      </Button>
                    );
                  })}
                </Panel>
              );
            }
            return (
              <Panel position="top-left" className="m-2 flex flex-wrap items-center gap-1.5 rounded-lg border bg-card/90 p-2 shadow-sm backdrop-blur-xs text-[11px]">
                <span className="font-semibold text-foreground flex items-center gap-1 mr-1">
                  <Layers className="size-3.5 text-primary" /> Phân cấp thẩm quyền:
                </span>
                <span className="inline-flex items-center gap-1 rounded-xs border border-purple-300 bg-purple-500/10 px-1.5 py-0.5 font-medium text-purple-700 dark:text-purple-300">
                  🟣 BTV Tỉnh ủy
                </span>
                <span className="inline-flex items-center gap-1 rounded-xs border border-red-300 bg-red-500/10 px-1.5 py-0.5 font-medium text-red-700 dark:text-red-300">
                  🔴 Lãnh đạo Ban
                </span>
                <span className="inline-flex items-center gap-1 rounded-xs border border-blue-300 bg-blue-500/10 px-1.5 py-0.5 font-medium text-blue-700 dark:text-blue-300">
                  🔵 Lãnh đạo Phòng
                </span>
                <span className="inline-flex items-center gap-1 rounded-xs border border-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                  🟢 Chuyên viên 22 VTVL
                </span>
                <span className="inline-flex items-center gap-1 rounded-xs border border-amber-300 bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                  🟠 Rẽ nhánh / Điều phối
                </span>
                <span className="inline-flex items-center gap-1 rounded-xs border border-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                  ⚙️ Hệ thống / Rule Engine
                </span>
              </Panel>
            );
          })()}
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
      <aside className="border-t p-4 xl:border-l xl:border-t-0"><h2 className="mb-1 text-sm font-semibold">Thuộc tính</h2><p className="mb-4 text-xs text-muted-foreground">{currentNode ? "Cấu hình bước đang chọn" : currentEdge ? "Cấu hình nhánh đang chọn" : "Chọn một bước hoặc nhánh trên sơ đồ"}</p>
        {currentNode && <div className="space-y-4"><div className="space-y-2"><Label>Tên bước</Label><Input value={String(currentNode.data.label || "")} onChange={(event) => updateNode({ label: event.target.value })} disabled={readOnly} /></div><div className="space-y-2"><Label>Đợt xử lý</Label><Select value={String(currentNode.data.phaseId || "__unassigned__")} onValueChange={(value) => updateNode({ phaseId: value === "__unassigned__" ? undefined : value })} disabled={readOnly}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn đợt" /></SelectTrigger><SelectContent><SelectItem value="__unassigned__">Chưa gán đợt</SelectItem>{phases.map((phase) => <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>)}</SelectContent></Select>{phases.length === 0 && <p className="text-xs text-muted-foreground">Tạo đợt ở cột bên trái để nhóm bước.</p>}</div>{currentNode.type === "user_task" && <><div className="space-y-2"><Label>Chiến lược phân công</Label><Select value={String(currentNode.data.assignmentStrategy || "BY_ROLE")} onValueChange={(value) => updateNode({ assignmentStrategy: value })} disabled={readOnly}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BY_ROLE">Theo chức danh</SelectItem><SelectItem value="CREATOR">Người tạo hồ sơ</SelectItem><SelectItem value="PREVIOUS_ACTOR">Người xử lý bước trước</SelectItem></SelectContent></Select></div>{(currentNode.data.assignmentStrategy === "BY_ROLE" || !currentNode.data.assignmentStrategy) && <div className="space-y-2"><Label>Chức danh xử lý</Label><Select value={String(currentNode.data.targetRole || "")} onValueChange={(value) => updateNode({ targetRole: value })} disabled={readOnly || roles.isPending}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn chức danh từ API" /></SelectTrigger><SelectContent>{(roles.data ?? []).map((role) => <SelectItem key={role.code} value={role.code}>{role.name}</SelectItem>)}</SelectContent></Select>{roles.isError && <p className="text-xs text-destructive">Không tải được danh sách chức danh từ backend.</p>}</div>}</>}{currentNode.type === "service_task" && <div className="space-y-2"><Label>Mã Action tự động</Label><Input value={String(currentNode.data.actionCode || "")} onChange={(event) => updateNode({ actionCode: event.target.value })} disabled={readOnly} placeholder="Ví dụ: SEND_EMAIL" /><p className="text-[10px] text-muted-foreground">Mã hành động mà hệ thống (hoặc Worker) sẽ thực thi.</p></div>}{!readOnly && <Button variant="destructive" className="w-full" onClick={() => { setNodes((nds) => nds.filter((n) => n.id !== currentNode.id)); setEdges((eds) => eds.filter((e) => e.source !== currentNode.id && e.target !== currentNode.id)); setSelectedNode(null); }}><Trash2 className="mr-2 size-4" /> Xóa bước này</Button>}</div>}
        {currentEdge && <div className="space-y-3"><div className="space-y-2"><Label>Nhãn nhánh</Label><Input value={currentEdge.data?.workflowGeneratedLabel === currentEdge.label ? "" : typeof currentEdge.label === "string" ? currentEdge.label : ""} onChange={(event) => updateEdge({ label: event.target.value })} disabled={readOnly} placeholder="Ví dụ: Hồ sơ hợp lệ" /></div><div className="space-y-2"><Label>Biểu thức điều kiện (Condition)</Label><Input value={String(currentEdge.data?.condition || "")} onChange={(event) => updateEdge({ data: { ...(currentEdge.data || {}), condition: event.target.value } })} disabled={readOnly} placeholder="Ví dụ: status == 'APPROVED'" /></div><p className="flex gap-2 rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground"><CircleHelp className="size-4 shrink-0" />Điều kiện nghiệp vụ và biến số thực tế cần tuân theo data schema của loại quy trình (Process Type).</p>{!readOnly && <Button variant="destructive" className="w-full" onClick={() => { setEdges((eds) => eds.filter((e) => e.id !== currentEdge.id)); setSelectedEdge(null); }}><Trash2 className="mr-2 size-4" /> Xóa nhánh này</Button>}</div>}
        {!currentEdge && !currentNode && <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground"><WorkflowIcon className="mb-2 size-5" />Chọn node để chỉnh tên và giao việc. Backend kiểm tra tính hợp lệ khi phát hành.</div>}
      </aside>
    </div>
  </div>;
}

export function WorkflowEditorScreen({ id, readOnly = false }: { id?: string; readOnly?: boolean }) {
  return <ReactFlowProvider><WorkflowEditorLoader id={id} readOnly={readOnly} /></ReactFlowProvider>;
}

function WorkflowEditorLoader({ id, readOnly }: { id?: string; readOnly: boolean }) {
  const detail = useWorkflowDefinition(id);
  if (id && detail.isPending) return <div className="flex min-h-[70vh] items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Đang tải phiên bản từ backend…</div>;
  if (id && (detail.isError || !detail.data)) return <div role="alert" className="rounded-xl border p-8 text-center text-destructive">Không thể tải quy trình. Hãy kiểm tra quyền truy cập hoặc thử tải lại.</div>;
  return <WorkflowEditor key={id || "new"} id={id} workflow={detail.data} forceReadOnly={readOnly} />;
}
