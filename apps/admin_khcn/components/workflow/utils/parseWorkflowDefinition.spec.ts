import { describe, it, expect } from "vitest";
import { parseWorkflowDefinition } from "./parseWorkflowDefinition";

describe("parseWorkflowDefinition", () => {
  it("should return empty nodes and edges for empty data", () => {
    const result = parseWorkflowDefinition(null);
    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it("should parse standard object definition", () => {
    const data = {
      definition: {
        nodes: [{ id: "1" }],
        edges: [{ id: "e1" }],
      },
    };
    const result = parseWorkflowDefinition(data);
    expect(result.nodes.length).toBe(1);
    expect(result.edges.length).toBe(1);
  });

  it("should parse stringified definition", () => {
    const data = {
      definition: JSON.stringify({
        nodes: [{ id: "1" }],
        edges: [{ id: "e1" }],
      }),
    };
    const result = parseWorkflowDefinition(data);
    expect(result.nodes[0].id).toBe("1");
    expect(result.edges[0].id).toBe("e1");
  });

  it("should parse double stringified definition", () => {
    const data = {
      definition: JSON.stringify(JSON.stringify({
        nodes: [{ id: "1" }],
        edges: [{ id: "e1" }],
      })),
    };
    const result = parseWorkflowDefinition(data);
    expect(result.nodes[0].id).toBe("1");
    expect(result.edges[0].id).toBe("e1");
  });

  it("should handle nested definition object", () => {
    const data = {
      definition: {
        definition: {
          nodes: [{ id: "1" }],
          edges: [{ id: "e1" }],
        },
      },
    };
    const result = parseWorkflowDefinition(data);
    expect(result.nodes[0].id).toBe("1");
    expect(result.edges[0].id).toBe("e1");
  });

  it("should fallback to empty arrays on invalid JSON", () => {
    const data = {
      definition: "{ invalid_json }",
    };
    const result = parseWorkflowDefinition(data);
    expect(result).toEqual({ nodes: [], edges: [] });
  });
});
