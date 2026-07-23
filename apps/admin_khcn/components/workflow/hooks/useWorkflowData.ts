/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { workflowApi } from "@/features/workflow/api";
import { toast } from "sonner";
import { Node, Edge, MarkerType } from "@xyflow/react";

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
            position: node.position || {
              x: Math.random() * 400,
              y: Math.random() * 400,
            },
          }));

          console.log(`Setting ${loadedNodes.length} nodes`);
          setNodes(loadedNodes.length > 0 ? loadedNodes : initialNodes);

          const loadedEdges = (definition.edges || []).map(
            (edge: any, index: number) => ({
              ...edge,
              type: edge.type === 'smoothstep' ? 'custom' : (edge.type || 'custom'),
              id: edge.id || `edge-${edge.source}-${edge.target}-${index}`,
              markerEnd: edge.markerEnd || {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#64748b',
              },
              style: edge.style || {
                strokeWidth: 2,
                stroke: '#64748b',
              }
            })
          );

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
    setIsSaving(true);
    const workflowData = {
      name: workflowName,
      description: workflowDesc,
      code: workflowCode,
      definition: { nodes, edges: edges as any },
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

    // Nếu chưa lưu, lưu trước
    if (!targetId) {
      setIsSaving(true);
      const workflowData = {
        name: workflowName,
        description: workflowDesc,
        code: workflowCode,
        definition: { nodes, edges: edges as any },
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
