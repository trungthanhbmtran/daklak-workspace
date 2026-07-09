import CustomEdge from "./CustomEdge";

export const edgeTypes = {
  custom: CustomEdge,
  // We can override default smoothstep too, but custom is better
  smoothstep: CustomEdge,
};

export default edgeTypes;
