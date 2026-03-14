export interface Resource {
  id: number;
  code: string;
  name: string;
}

export interface Permission {
  id: number;
  resource_id: number;
  action: string;
}

export interface ResourceWithPermissions extends Resource {
  permissions: Permission[];
}
