"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { OrganizationUnitNode, CreateUnitPayload, UpdateUnitPayload } from "../types";

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
  updateScope: (id: number, payload: { domainIds?: number[]; geographicAreaIds?: number[] }) => Promise<unknown>;
  deleteUnit: (id: number) => Promise<unknown>;
}

export interface OrganizationMeta {
  isCreating: boolean;
  isUpdating: boolean;
  isUpdatingScope: boolean;
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
