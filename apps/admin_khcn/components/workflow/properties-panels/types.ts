import { Node, Edge } from "@xyflow/react";

export interface PropertiesPanelComponentProps {
  data: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  selectedNode?: Node | null;
  selectedEdge?: Edge | null;
  onUpdate?: (id: string, data: any) => void;
  onUpdateEdge?: (id: string, data: any) => void;
  availableServices?: any[];
  taskRoles?: any[];
  orgRoles?: { code: string; name: string; rank?: number; authorityLevel?: string; category?: string }[];
}
