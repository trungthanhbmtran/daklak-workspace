import { useState, useCallback } from "react";
import {
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";

export const initialNodes: Node[] = [
  {
    id: "node_1",
    type: "start",
    position: { x: 100, y: 100 },
    data: { label: "Bắt đầu" },
  },
];

export function useWorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#64748b',
      },
      style: {
        strokeWidth: 2,
        stroke: '#64748b',
      }
    }, eds)),
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
    setSelectedEdgeId(null);
    setSelectedNodeId(node.id);
    setIsPropertiesOpen(true);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edge.id);
    setIsPropertiesOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const onUpdateNodeData = useCallback(
    (id: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onUpdateEdgeData = useCallback(
    (id: string, edgeUpdates: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            return { ...edge, ...edgeUpdates };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  const onDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds: Edge[]) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      );
      setSelectedNodeId(null);
      setIsPropertiesOpen(false);
    },
    [setNodes, setEdges]
  );

  const onDeleteEdge = useCallback(
    (id: string) => {
      setEdges((eds: Edge[]) => eds.filter((edge) => edge.id !== id));
      setSelectedEdgeId(null);
      setIsPropertiesOpen(false);
    },
    [setEdges]
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) || null;

  return {
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
  };
}
