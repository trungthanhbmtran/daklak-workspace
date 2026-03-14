"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { OrganizationUnitNode, CreateUnitPayload } from "../types";
import type { UpdateUnitPayload } from "../api";

export type ViewMode = "idle" | "create_root" | "create_child";

export interface OrganizationState {
  flatUnits: OrganizationUnitNode[];
  mode: ViewMode;
  selectedId?: number;
  parentId?: number;
  isLoadingTree: boolean;
}

export interface OrganizationActions {
  select: (id: number) => void;
  addRoot: () => void;
  addChild: (parentId: number) => void;
  cancel: () => void;
  createUnit: (payload: CreateUnitPayload) => Promise<unknown>;
  updateUnit: (id: number, payload: UpdateUnitPayload) => Promise<unknown>;
  deleteUnit: (id: number) => Promise<unknown>;
}

export interface OrganizationMeta {
  unitTypes: { id: number; code?: string; name: string }[];
  domains: { id: number; code?: string; name: string }[];
  isLoadingTypes: boolean;
  isLoadingDomains: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface OrganizationContextValue {
  state: OrganizationState;
  actions: OrganizationActions;
  meta: OrganizationMeta;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function useOrganizationContext() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error("Organization components must be used within Organization.Provider");
  }
  return ctx;
}

export interface OrganizationProviderProps {
  value: OrganizationContextValue;
  children: ReactNode;
}

export function OrganizationProvider({ value, children }: OrganizationProviderProps) {
  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
