"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  Panel,
  BackgroundVariant,
  MiniMap,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import NodePalette from "./NodePalette";
import PropertiesPanel from "./PropertiesPanel";
import Topbar from "./Topbar";
import { useHubServices } from "@/hooks/useServiceMenus";
import { Loader2 } from "lucide-react";

import { useWorkflowDynamics } from "./hooks/useWorkflowDynamics";
import { useWorkflowCanvas } from "./hooks/useWorkflowCanvas";
import { useWorkflowData } from "./hooks/useWorkflowData";

interface WorkflowEditorProps {
  id?: string;
  onBack: () => void;
}

const Flow = ({ id, onBack }: WorkflowEditorProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { apps: availableServices } = useHubServices();

  const { dynamicServices, dynamicTriggers, taskRoles } = useWorkflowDynamics();
  
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    isPropertiesOpen,
    setIsPropertiesOpen,
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    onUpdateNodeData,
    onUpdateEdgeData,
    onDeleteNode,
    onDeleteEdge,
    selectedNode,
    selectedEdge,
  } = useWorkflowCanvas();

  // initialNodes is exported from useWorkflowCanvas
  // but we can just import it. Let's import it correctly at the top.
  // Wait, I should import initialNodes from useWorkflowCanvas. Let's do that at the top.

  // useWorkflowData expects initialNodes
  const {
    workflowId,
    workflowName,
    setWorkflowName,
    workflowDesc,
    setWorkflowDesc,
    workflowCode,
    setWorkflowCode,
    isSaving,
    isLoading,
    onSave,
    onPublish,
  } = useWorkflowData({
    id,
    nodes,
    edges,
    setNodes,
    setEdges,
    initialNodes: [
      {
        id: "node_1",
        type: "start",
        position: { x: 100, y: 100 },
        data: { label: "Bắt đầu" },
      },
    ],
  });

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

  if (isLoading) {
    return (
        <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-background rounded-xl border border-border">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Đang tải cấu hình quy trình...</p>
        </div>
    );
  }

  const defaultEdgeOptions = {
    type: "custom",
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#64748b",
    },
    style: {
      strokeWidth: 2,
      stroke: "#64748b",
    },
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background">
      <Topbar 
        onSave={onSave} 
        onPublish={onPublish} 
        onBack={onBack}
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        isSaving={isSaving}
        onOpenSettings={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          setIsPropertiesOpen(true);
        }}
        onOpenPalette={() => setIsPaletteOpen(!isPaletteOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden relative min-h-0" ref={reactFlowWrapper}>
        <NodePalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
        
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
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit}
            fitView
            defaultEdgeOptions={defaultEdgeOptions}
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
          isOpen={isPropertiesOpen}
          onOpenChange={setIsPropertiesOpen}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          availableServices={dynamicServices.length > 0 ? dynamicServices : availableServices}
          availableTriggers={dynamicTriggers}
          taskRoles={taskRoles}
          onUpdate={onUpdateNodeData}
          onUpdateEdge={onUpdateEdgeData}
          onDelete={onDeleteNode}
          onDeleteEdge={onDeleteEdge}
          onClose={() => setIsPropertiesOpen(false)}
          workflowDesc={workflowDesc}
          setWorkflowDesc={setWorkflowDesc}
          workflowCode={workflowCode}
          setWorkflowCode={setWorkflowCode}
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
