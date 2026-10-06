/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { workflowApi } from "@/features/workflow/api";
import { toast } from "sonner";
import { Node, Edge, MarkerType } from "@xyflow/react";
import { parseWorkflowDefinition } from "../utils/parseWorkflowDefinition";

interface UseWorkflowDataProps {
  id?: string;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  initialNodes: Node[];
}

export function useWorkflowData({
  id,
  nodes,
  edges,
  setNodes,
  setEdges,
  initialNodes,
}: UseWorkflowDataProps) {
  const [workflowId, setWorkflowId] = useState<string | null>(id || null);
  const [workflowName, setWorkflowName] = useState("Quy trình mới");
  const [workflowDesc, setWorkflowDesc] = useState("Mô tả quy trình...");
  const [workflowCode, setWorkflowCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  const loadWorkflow = useCallback(async (loadId: string) => {
    setIsLoading(true);
    try {
      console.log(`Loading workflow: ${loadId}`);
      const data = await workflowApi.getOne(loadId);
      console.log("Loaded data:", data);

      if (data) {
        setWorkflowName(data.name);
        setWorkflowDesc(data.description || "");
        setWorkflowCode(data.code || data.trigger || "");

        const definition = parseWorkflowDefinition(data);

        if (definition && definition.nodes) {
          console.log("Definition found:", definition);
          const rawNodes = definition.nodes || [];
          const loadedNodes = rawNodes
            .filter((n: any) => n && n.id)
            .map((node: any, index: number) => {
              const hasPosition = node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number';
              const fallbackX = typeof node.x === 'number' ? node.x : (index % 4) * 280;
              const fallbackY = typeof node.y === 'number' ? node.y : Math.floor(index / 4) * 160;
              const typeMap: Record<string, string> = {
                userTask: 'user_task',
                serviceTask: 'service_task',
                scriptTask: 'script_task',
                exclusiveGateway: 'exclusive_gateway',
                parallelGateway: 'parallel_gateway',
              };
              const type = typeMap[node.type] || node.type;

              return {
                ...node,
                id: String(node.id),
                type,
                position: hasPosition ? node.position : { x: fallbackX, y: fallbackY },
                data: {
                  label: node.name || node.data?.label || node.data?.name || `Node ${index + 1}`,
                  ...node.data
                },
              };
            });

          console.log(`Setting ${loadedNodes.length} nodes`);
          setNodes(loadedNodes.length > 0 ? loadedNodes : initialNodes);

          const nodeIds = new Set(loadedNodes.map((n: any) => n.id));

          const rawEdges = definition.edges || [];
          const loadedEdges = rawEdges.map(
            (edge: any, index: number) => {
              const source = String(edge.source || edge.sourceNodeId || "");
              const target = String(edge.target || edge.targetNodeId || "");
              
              return {
                ...edge,
                source,
                target,
                sourceHandle: edge.sourceHandle || undefined,
                targetHandle: edge.targetHandle || undefined,
                type: edge.type === 'smoothstep' ? 'custom' : (edge.type || 'custom'),
                id: String(edge.id || `edge-${source}-${target}-${index}`),
                animated: edge.animated ?? true,
                data: edge.data || {},
                label: edge.label || (edge.data?.label as string) || "Chuyển tiếp",
                markerEnd: edge.markerEnd || {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: '#3b82f6',
                },
                style: edge.style || {
                  strokeWidth: 2,
                  stroke: '#3b82f6',
                }
              };
            }
          ).filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target));

          console.log(`Setting ${loadedEdges.length} edges`);
          setEdges(loadedEdges);
        } else {
          console.warn("No definition found in workflow data");
          setNodes(initialNodes);
        }
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
      toast.error((error as any)?.response?.data?.message || "Không thể tải quy trình");
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges, initialNodes]);

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow]);

  const onSave = useCallback(async () => {
    // Validation
    const hasStart = nodes.some((n) => n.type === "start");
    const hasEnd = nodes.some((n) => n.type === "end");
    let hasError = false;

    const validatedNodes = nodes.map((n) => {
      let nodeError = false;
      if (n.type === "user_task" || n.type === "userTask") {
        if (!n.data?.assignmentStrategy) nodeError = true;
        if (n.data?.assignmentStrategy === 'BY_ROLE' && !n.data?.targetRole) nodeError = true;
        if (n.data?.assignmentStrategy === 'DIRECT_USER' && !n.data?.employeeCode) nodeError = true;
      }
      if (n.type === "exclusive_gateway") {
        const outgoing = edges.filter(e => e.source === n.id);
        if (outgoing.length > 0 && !outgoing.some(e => e.data?.isDefault)) {
          nodeError = true;
        }
      }
      if (nodeError) hasError = true;
      
      return {
        ...n,
        className: nodeError ? "ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300" : n.className?.replace(/ring-2 ring-red-500 shadow-\[0_0_15px_rgba\(239,68,68,0\.5\)\] transition-all duration-300/g, "").trim()
      };
    });

    if (hasError) {
      setNodes(validatedNodes as any);
      toast.error("Vui lòng kiểm tra lại cấu hình các tác nhân bị đánh dấu đỏ!");
      return;
    }
    
    if (!hasStart || !hasEnd) {
      toast.error("Quy trình phải có ít nhất một Bắt đầu và một Kết thúc!");
      return;
    }

    setIsSaving(true);
    const typeToBackendMap: Record<string, string> = {
      'user_task': 'userTask',
      'service_task': 'serviceTask',
      'script_task': 'scriptTask',
      'exclusive_gateway': 'exclusiveGateway',
      'parallel_gateway': 'parallelGateway',
    };

    const nodesForBackend = validatedNodes.map(n => ({
      ...n,
      type: typeToBackendMap[n.type || ''] || n.type
    }));

    const bpmnLogicNodes = nodesForBackend.map(n => ({
      id: n.id,
      type: n.type,
      data: { ...n.data, label: undefined }
    }));
    
    const uiMetadataNodes = nodesForBackend.map(n => ({
      id: n.id,
      position: n.position,
      positionAbsolute: (n as any).positionAbsolute,
      width: (n as any).width,
      height: (n as any).height,
      className: n.className,
      style: n.style,
      data: { label: n.data?.label }
    }));

    const bpmnLogicEdges = edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: e.type,
      data: e.data
    }));

    const uiMetadataEdges = edges.map((e: any) => ({
      id: e.id,
      animated: e.animated,
      label: e.label,
      markerEnd: e.markerEnd,
      style: e.style
    }));

    const workflowData = {
      name: workflowName,
      description: workflowDesc,
      code: workflowCode,
      bpmnLogic: { nodes: bpmnLogicNodes, edges: bpmnLogicEdges },
      uiMetadata: { nodes: uiMetadataNodes, edges: uiMetadataEdges },
    };

    try {
      if (workflowId) {
        await workflowApi.update(workflowId, workflowData as any);
        toast.success("Đã cập nhật quy trình!");
      } else {
        const response = await workflowApi.create(workflowData as any);
        if (response && response.id) {
          setWorkflowId(response.id);
        }
        toast.success("Đã lưu quy trình mới!");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error((error as any)?.response?.data?.message || "Lỗi khi lưu quy trình");
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflowId, workflowName, workflowDesc, workflowCode]);

  const onPublish = useCallback(async () => {
    if (!workflowId) {
      toast.error("Vui lòng lưu bản nháp trước khi kích hoạt!");
      return;
    }

    try {
      await workflowApi.publish(workflowId);
      toast.success("Đã kích hoạt quy trình!");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error((error as any)?.response?.data?.message || "Lỗi khi kích hoạt quy trình");
    }
  }, [workflowId]);

  const onPublishAndApply = useCallback(async (moduleCode: string) => {
    let targetId = workflowId;

    // Validation
    const hasStart = nodes.some((n) => n.type === "start");
    const hasEnd = nodes.some((n) => n.type === "end");
    let hasError = false;

    const validatedNodes = nodes.map((n) => {
      let nodeError = false;
      if (n.type === "user_task" && !n.data?.assignmentStrategy) {
        nodeError = true;
      }
      if (n.type === "exclusive_gateway" && !edges.some(e => e.source === n.id)) {
        nodeError = true;
      }
      if (nodeError) hasError = true;
      
      return {
        ...n,
        className: nodeError ? "ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300" : n.className?.replace(/ring-2 ring-red-500 shadow-\[0_0_15px_rgba\(239,68,68,0\.5\)\] transition-all duration-300/g, "").trim()
      };
    });

    if (hasError) {
      setNodes(validatedNodes as any);
      toast.error("Vui lòng kiểm tra lại cấu hình các tác nhân bị đánh dấu đỏ!");
      return;
    }
    
    if (!hasStart || !hasEnd) {
      toast.error("Quy trình phải có ít nhất một Bắt đầu và một Kết thúc!");
      return;
    }

    // Nếu chưa lưu, lưu trước
    if (!targetId) {
      setIsSaving(true);
      const typeToBackendMap: Record<string, string> = {
        'user_task': 'userTask',
        'service_task': 'serviceTask',
        'script_task': 'scriptTask',
        'exclusive_gateway': 'exclusiveGateway',
        'parallel_gateway': 'parallelGateway',
      };

      const nodesForBackend = validatedNodes.map(n => ({
        ...n,
        type: typeToBackendMap[n.type || ''] || n.type
      }));

      const bpmnLogicNodes = nodesForBackend.map(n => ({
        id: n.id,
        type: n.type,
        data: { ...n.data, label: undefined }
      }));
      
      const uiMetadataNodes = nodesForBackend.map(n => ({
        id: n.id,
        position: n.position,
        positionAbsolute: (n as any).positionAbsolute,
        width: (n as any).width,
        height: (n as any).height,
        className: n.className,
        style: n.style,
        data: { label: n.data?.label }
      }));
  
      const bpmnLogicEdges = edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type,
        data: e.data
      }));
  
      const uiMetadataEdges = edges.map((e: any) => ({
        id: e.id,
        animated: e.animated,
        label: e.label,
        markerEnd: e.markerEnd,
        style: e.style
      }));
  
      const workflowData = {
        name: workflowName,
        description: workflowDesc,
        code: workflowCode,
        bpmnLogic: { nodes: bpmnLogicNodes, edges: bpmnLogicEdges },
        uiMetadata: { nodes: uiMetadataNodes, edges: uiMetadataEdges },
      };
      try {
        const response = await workflowApi.create(workflowData as any);
        if (response && response.id) {
          setWorkflowId(response.id);
          targetId = response.id;
        }

      } catch (error) {
        toast.error((error as any)?.response?.data?.message || "Lỗi khi lưu quy trình");
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    if (!targetId) return;

    try {
      await workflowApi.applyModule(targetId, moduleCode);
      toast.success(`Đã áp dụng quy trình vào nghiệp vụ ${moduleCode}!`);
    } catch (error) {
      console.error("Apply module error:", error);
      toast.error((error as any)?.response?.data?.message || "Lỗi khi áp dụng quy trình vào nghiệp vụ");
    }
  }, [workflowId, workflowName, workflowDesc, workflowCode, nodes, edges]);

  return {
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
    onPublishAndApply,
  };
}
