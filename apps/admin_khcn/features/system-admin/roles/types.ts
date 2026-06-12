export interface Policy {
  id?: number;
  resourceId?: number;
  resourceCode: string;
  action: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: {
    expression?: string;
  };
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  active: number;
  policies: Policy[];
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  code: string;
}
