"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  BackgroundVariant,
  MiniMap,
  Node,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import NodePalette from "./NodePalette";
import PropertiesPanel from "./PropertiesPanel";
import Topbar from "./Topbar";
import { useHubServices } from "@/hooks/useServiceMenus";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";

const initialNodes: Node[] = [
  {
    id: "node_1",
    type: "start",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
  },
];

const Flow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { apps: availableServices } = useHubServices();
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Math.random().toString(36).substr(2, 9)}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onUpdateNodeData = useCallback((id: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds: Edge[]) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const onSave = useCallback(async () => {
    setIsSaving(true);
    const workflowData = {
      name: "Quy trình mới", // TODO: Thêm input tên quy trình
      description: "Được tạo từ Workflow Builder",
      definition: { nodes, edges },
    };

    try {
      let response: any;
      if (workflowId) {
        response = await apiClient.put(`/admin/workflow/${workflowId}`, workflowData);
        toast.success("Đã cập nhật quy trình!");
      } else {
        response = await apiClient.post("/admin/workflow", workflowData);
        setWorkflowId(response.id);
        toast.success("Đã lưu quy trình mới!");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflowId]);

  const onPublish = useCallback(async () => {
    if (!workflowId) {
      toast.error("Vui lòng lưu bản nháp trước khi xuất bản!");
      return;
    }
    
    try {
      await apiClient.post(`/admin/workflow/${workflowId}/start`, { 
        initialContext: { startedAt: new Date().toISOString() } 
      });
      toast.success("Đã xuất bản và chạy thử nghiệm quy trình!");
    } catch (error) {
      console.error("Publish error:", error);
    }
  }, [workflowId]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <Topbar onSave={onSave} onPublish={onPublish} />
      
      <div className="flex flex-1 overflow-hidden relative" ref={reactFlowWrapper}>
        <NodePalette />
        
        <div className="flex-1 relative bg-muted/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="transition-opacity duration-300"
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="#e2e8f0" 
            />
            <Controls 
              className="bg-card border border-border shadow-lg rounded-xl overflow-hidden" 
              showInteractive={false} 
            />
            <MiniMap 
              className="bg-card border border-border/60 shadow-md rounded-xl overflow-hidden mb-4" 
              nodeStrokeColor="#cbd5e1"
              nodeColor="#f8fafc"
              maskColor="rgba(241, 245, 249, 0.6)"
            />
            
            <Panel position="top-left" className="bg-background/80 backdrop-blur-sm border border-border/40 p-2 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   Editor Online
                </div>
            </Panel>
          </ReactFlow>
        </div>

        <PropertiesPanel 
          selectedNode={selectedNode}
          availableServices={availableServices}
          onUpdate={onUpdateNodeData}
          onDelete={onDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
};

const WorkflowEditor = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default WorkflowEditor;
