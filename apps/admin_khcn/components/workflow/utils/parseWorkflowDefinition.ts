export function parseWorkflowDefinition(data: any): { nodes: any[], edges: any[] } {
  if (!data) {
    return { nodes: [], edges: [] };
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
