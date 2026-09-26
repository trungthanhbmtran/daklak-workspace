export interface Policy {
  id?: number;
  resourceCode?: string;
  action?: string;
  effect?: 'ALLOW' | 'DENY';
  resourceId?: number;
  conditions?: { expression?: string };
  code?: string;
  name?: string;
  description?: string;
  active?: number;
  policies?: Policy[];
}
export interface PolicyFilter {
  page?: number;
  limit?: number;
  search?: string;
}
export interface Permission {
  id?: number;
  module: string;
  action: string;
  code: string;
}