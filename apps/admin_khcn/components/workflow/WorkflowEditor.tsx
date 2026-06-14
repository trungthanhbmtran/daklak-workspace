"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { workflowApi } from "@/features/workflow/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const initialNodes: Node[] = [
  {
    id: "node_1",
    type: "start",
    position: { x: 100, y: 100 },
    data: { label: "Bắt đầu" },
  },
];

interface WorkflowEditorProps {
  id?: string;
  onBack: () => void;
}

const Flow = ({ id, onBack }: WorkflowEditorProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(id || null);
  const [workflowName, setWorkflowName] = useState("Quy trình mới");
  const [workflowDesc, setWorkflowDesc] = useState("Mô tả quy trình...");
  const [workflowTrigger, setWorkflowTrigger] = useState("MANUAL");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  
  const { apps: availableServices } = useHubServices();
  const { screenToFlowPosition, setViewport } = useReactFlow();
  
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [dynamicTriggers, setDynamicTriggers] = useState<any[]>([]);
  const [taskRoles, setTaskRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchDynamics = async () => {
      try {
        const [svcs, trigs, roles] = await Promise.all([
          workflowApi.getServices(),
          workflowApi.getTriggers(),
          workflowApi.getTaskRoles().catch(() => []),
        ]);
        setDynamicServices(svcs);
        setDynamicTriggers(trigs);
        setTaskRoles(roles);
      } catch (e) {
        console.error("Failed to fetch dynamic workflow data", e);
      }
    };
    fetchDynamics();
  }, []);

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

  const onInit = useCallback((instance: any) => {
    console.log("ReactFlow initialized");
    instance.fitView();
  }, []);

  // Explicitly fit view when nodes change
  useEffect(() => {
    if (nodes.length > 1 && !isLoading) {
      // Small timeout to ensure the DOM has updated
      setTimeout(() => {
        // We can't call fitView directly here easily without the instance, 
        // but fitView prop on ReactFlow should handle it if the prop changes.
      }, 100);
    }
  }, [nodes.length, isLoading]);

  const loadWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    try {
      console.log(`Loading workflow: ${workflowId}`);
      const data = await workflowApi.getOne(workflowId);
      console.log("Loaded data:", data);
      
      if (data) {
        setWorkflowName(data.name);
        setWorkflowDesc(data.description || "");
        setWorkflowTrigger(data.trigger || "MANUAL");
        
        // Handle definition which might be stringified JSON or already an object
        let definition = data.definition;
        
        // Handle cases where the definition might be wrapped or named differently
        if (!definition && (data as any).workflowDefinition) {
          definition = (data as any).workflowDefinition;
        }

        if (typeof definition === "string") {
          try {
            definition = JSON.parse(definition);
          } catch (e) {
            console.error("Failed to parse definition string:", e);
            definition = { nodes: [], edges: [] };
          }
        }

        if (definition) {
          console.log("Definition found:", definition);
          const loadedNodes = (definition.nodes || []).map((node: any) => ({
            ...node,
            // Ensure position exists for ReactFlow
            position: node.position || { x: Math.random() * 400, y: Math.random() * 400 },
          }));
          
          console.log(`Setting ${loadedNodes.length} nodes`);
          setNodes(loadedNodes.length > 0 ? loadedNodes : initialNodes);
          
          const loadedEdges = (definition.edges || []).map((edge: any, index: number) => ({
            ...edge,
            id: edge.id || `edge-${edge.source}-${edge.target}-${index}`,
          }));
          
          console.log(`Setting ${loadedEdges.length} edges`);
          setEdges(loadedEdges);
        } else {
          console.warn("No definition found in workflow data");
          setNodes(initialNodes);
        }
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
      toast.error("Không thể tải quy trình");
    } finally {
      setIsLoading(false);
    }
  };

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
      name: workflowName,
      description: workflowDesc,
      trigger: workflowTrigger,
      definition: { nodes, edges },
    };

    try {
      if (workflowId) {
        await workflowApi.update(workflowId, workflowData);
        toast.success("Đã cập nhật quy trình!");
      } else {
        const response = await workflowApi.create(workflowData);
        setWorkflowId(response.id);
        toast.success("Đã lưu quy trình mới!");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Lỗi khi lưu quy trình");
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflowId, workflowName, workflowDesc]);

  const onPublish = useCallback(async () => {
    if (!workflowId) {
      toast.error("Vui lòng lưu bản nháp trước khi chạy thử!");
      return;
    }
    
    try {
      await workflowApi.start(workflowId, { startedAt: new Date().toISOString() });
      toast.success("Đã kích hoạt và chạy thử nghiệm quy trình!");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Lỗi khi kích hoạt quy trình");
    }
  }, [workflowId]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  if (isLoading) {
    return (
        <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-background rounded-xl border border-border">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Đang tải cấu hình quy trình...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-[700px] overflow-hidden bg-background rounded-xl border border-border shadow-sm">
      <Topbar 
        onSave={onSave} 
        onPublish={onPublish} 
        onBack={onBack}
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        isSaving={isSaving}
      />
      
      <div className="flex flex-1 overflow-hidden relative min-h-0" ref={reactFlowWrapper}>
        <NodePalette />
        
        <div className="flex-1 relative bg-muted/20 min-h-[500px]">
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
            onInit={onInit}
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
                   {workflowId ? `Editing: ${workflowId.slice(0, 8)}` : "New Workflow"}
                </div>
            </Panel>
          </ReactFlow>
        </div>

        <PropertiesPanel 
          selectedNode={selectedNode}
          availableServices={dynamicServices.length > 0 ? dynamicServices : availableServices}
          availableTriggers={dynamicTriggers}
          taskRoles={taskRoles}
          onUpdate={onUpdateNodeData}
          onDelete={onDeleteNode}
          onClose={() => setSelectedNodeId(null)}
          workflowDesc={workflowDesc}
          setWorkflowDesc={setWorkflowDesc}
          workflowTrigger={workflowTrigger}
          setWorkflowTrigger={setWorkflowTrigger}
        />
      </div>
    </div>
  );
};

const WorkflowEditor = (props: WorkflowEditorProps) => (
  <ReactFlowProvider>
    <Flow {...props} />
  </ReactFlowProvider>
);

export default WorkflowEditor;
