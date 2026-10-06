export function parseWorkflowDefinition(data: any): { nodes: any[], edges: any[] } {
  if (!data) {
    return { nodes: [], edges: [] };
  }

  if (data.bpmnLogic || data.uiMetadata) {
    const bpmnLogic = typeof data.bpmnLogic === 'string' ? JSON.parse(data.bpmnLogic || '{"nodes":[],"edges":[]}') : (data.bpmnLogic || { nodes: [], edges: [] });
    const uiMetadata = typeof data.uiMetadata === 'string' ? JSON.parse(data.uiMetadata || '{"nodes":[],"edges":[]}') : (data.uiMetadata || { nodes: [], edges: [] });
    
    const mergedNodes = (bpmnLogic.nodes || []).map((bNode: any) => {
      const uiNode = (uiMetadata.nodes || []).find((u: any) => u.id === bNode.id) || {};
      return { ...bNode, ...uiNode, data: { ...bNode.data, ...uiNode.data } };
    });
    
    const mergedEdges = (bpmnLogic.edges || []).map((bEdge: any) => {
      const uiEdge = (uiMetadata.edges || []).find((u: any) => u.id === bEdge.id) || {};
      return { ...bEdge, ...uiEdge, data: { ...bEdge.data, ...uiEdge.data } };
    });
    
    return { nodes: mergedNodes, edges: mergedEdges };
  }

  let definition = data.definition;

  // Handle cases where the definition might be wrapped or named differently
  if (!definition && data.workflowDefinition) {
    definition = data.workflowDefinition;
  }

  while (typeof definition === "string") {
    try {
      definition = JSON.parse(definition);
    } catch (e) {
      console.error("Failed to parse definition string:", e);
      definition = { nodes: [], edges: [] };
      break;
    }
  }

  // Sometimes the definition object itself has a 'definition' property
  if (definition && definition.definition) {
    definition = definition.definition;
  }

  if (definition && (definition.nodes || definition.edges)) {
    return {
      nodes: Array.isArray(definition.nodes) ? definition.nodes : [],
      edges: Array.isArray(definition.edges) ? definition.edges : []
    };
  }

  return { nodes: [], edges: [] };
}
