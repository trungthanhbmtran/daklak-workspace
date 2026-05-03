// features/posts/portal-menus/types.ts

export type LinkType = "INTERNAL" | "CATEGORY" | "EXTERNAL";
export type MenuPosition = "HEADER" | "SIDEBAR" | "FOOTER";

export interface PortalMenu {
  id: string;
  name: string;
  slug: string;
  path?: string;
  icon?: string;
  target: "_self" | "_blank";
  parentId?: string | null;
  linkType: LinkType;
  position: MenuPosition;
  orderIndex: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  children?: PortalMenu[];
}

export interface PortalMenuPayload {
  name: string;
  slug: string;
  path?: string;
  icon?: string;
  target?: "_self" | "_blank";
  parentId?: string | null;
  linkType?: LinkType;
  position?: MenuPosition;
  orderIndex?: number;
  status?: boolean;
}
