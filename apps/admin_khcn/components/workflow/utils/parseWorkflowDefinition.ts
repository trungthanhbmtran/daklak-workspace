export function parseWorkflowDefinition(data: any): { nodes: any[], edges: any[] } {
  if (!data) {
    return { nodes: [], edges: [] };
  }

  let definition = data.definition;

  // Handle cases where the definition might be wrapped or named differently
  if (!definition && data.workflowDefinition) {
    definition = data.workflowDefinition;
  }

  if (!definition && data.graph) {
    definition = data.graph;
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

  const bpmnLogic = data.bpmnLogic || (definition && definition.bpmnLogic);
  const uiMetadata = data.uiMetadata || (definition && definition.uiMetadata);

  if (bpmnLogic || uiMetadata) {
    const parsedBpmn = typeof bpmnLogic === 'string' ? JSON.parse(bpmnLogic || '{"nodes":[],"edges":[]}') : (bpmnLogic || { nodes: [], edges: [] });
    const parsedUi = typeof uiMetadata === 'string' ? JSON.parse(uiMetadata || '{"nodes":[],"edges":[]}') : (uiMetadata || { nodes: [], edges: [] });
    
    const mergedNodes = (parsedBpmn.nodes || []).map((bNode: any) => {
      const uiNode = (parsedUi.nodes || []).find((u: any) => u.id === bNode.id) || {};
      return { ...bNode, ...uiNode, data: { ...bNode.data, ...uiNode.data } };
    });
    
    const mergedEdges = (parsedBpmn.edges || []).map((bEdge: any) => {
      const uiEdge = (parsedUi.edges || []).find((u: any) => u.id === bEdge.id) || {};
      return { ...bEdge, ...uiEdge, data: { ...bEdge.data, ...uiEdge.data } };
    });
    
    return { nodes: mergedNodes, edges: mergedEdges };
  }

  if (definition && (definition.nodes || definition.edges)) {
    return {
      nodes: Array.isArray(definition.nodes) ? definition.nodes : [],
      edges: Array.isArray(definition.edges) ? definition.edges : []
    };
  }

  if (data.nodes || data.edges) {
    return {
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : []
    };
  }

  return { nodes: [], edges: [] };
}
