"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StartEndNode } from './nodes/StartEndNode';
import { ActorNode } from './nodes/ActorNode';
import { DecisionNode } from './nodes/DecisionNode';
import { Sidebar } from './Sidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

// Define the custom node types mapping
const nodeTypes: NodeTypes = {
  startEnd: StartEndNode,
  actor: ActorNode,
  decision: DecisionNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const BuilderCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Differentiate True/False branch colors for Decision Node
      const edgeOptions = { ...params };
      if (params.sourceHandle === 'true') {
        edgeOptions.animated = true;
        edgeOptions.style = { stroke: '#22c55e', strokeWidth: 2 };
      } else if (params.sourceHandle === 'false') {
        edgeOptions.animated = true;
        edgeOptions.style = { stroke: '#ef4444', strokeWidth: 2 };
        edgeOptions.animated = true;
      } else {
        edgeOptions.style = { stroke: '#94a3b8', strokeWidth: 2 };
      }
      setEdges((eds) => addEdge(edgeOptions, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Special handling for Start/End initial data
      let initialData: any = { label };
      if (type === 'startEnd') {
        initialData.type = label === 'Bắt đầu' ? 'start' : 'end';
      }

      const newNode = {
        id: getId(),
        type,
        position,
        data: initialData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeClick = useCallback((_, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: newData };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleSave = () => {
    const flow = reactFlowInstance?.toObject();
    if (flow) {
      console.log('Saved Workflow JSON:', JSON.stringify(flow, null, 2));
      toast.success('Đã lưu luồng nghiệp vụ thành công!');
      // TODO: Gửi JSON này xuống workflow-service API
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative" ref={reactFlowWrapper}>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm font-medium transition-colors"
          >
            <Save size={18} />
            Lưu Quy Trình
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50 dark:bg-slate-950"
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Controls />
          <Background color="#cbd5e1" gap={16} />
        </ReactFlow>
      </div>

      <PropertiesPanel selectedNode={selectedNode} onUpdateNode={handleUpdateNode} />
    </div>
  );
};

export const WorkflowBuilderClient = () => {
  return (
    <ReactFlowProvider>
      <BuilderCanvas />
    </ReactFlowProvider>
  );
};
