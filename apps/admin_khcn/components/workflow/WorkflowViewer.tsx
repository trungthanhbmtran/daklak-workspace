/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Workflow as WorkflowIcon } from "lucide-react";
import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { normalizeWorkflowGraph } from "./utils/normalizeWorkflowGraph";
import { cn } from "@/lib/utils";

interface WorkflowViewerProps {
  workflow: any;
  className?: string;
  showMiniMap?: boolean;
}

/** Sơ đồ quy trình chỉ đọc. Container luôn có chiều cao cố định vì React Flow cần kích thước tuyệt đối. */
export function WorkflowViewer({ workflow, className, showMiniMap = false }: WorkflowViewerProps) {
  const { nodes, edges } = useMemo(() => normalizeWorkflowGraph(workflow), [workflow]);

  if (!nodes.length) {
    return (
      <div className={cn("flex h-[420px] w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground", className)}>
        <WorkflowIcon className="h-8 w-8 opacity-30" />
        <span>Quy trình chưa có sơ đồ</span>
      </div>
    );
  }

  return (
    <div className={cn("h-[420px] w-full", className)}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background gap={16} className="opacity-60" />
          <Controls showInteractive={false} />
          {showMiniMap && <MiniMap pannable zoomable className="!bg-background" />}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default WorkflowViewer;
