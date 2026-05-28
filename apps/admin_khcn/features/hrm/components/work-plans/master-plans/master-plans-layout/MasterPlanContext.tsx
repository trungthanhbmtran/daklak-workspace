"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/features/system-admin/categories/api";
import { hrmPlansApi } from "@/features/hrm/api";

export type ManagementFramework = 'BSC_KPI' | 'OKRS' | 'OGSM' | 'MBO';
export type GovPerspective = 'STRATEGIC_GOAL' | 'DIGITAL_TRANSFORM' | 'OPERATIONAL_REFORM' | 'RESOURCE_FINANCE';

type ViewMode = "idle" | "create" | "edit";

interface MasterPlanState {
  mode: ViewMode;
  selectedId: number | null;
  masterPlans: any[];
  isLoadingPlans: boolean;
  activeTab: string;
  ranks: any[];
  congChucRanks: any[];
  vienChucRanks: any[];
}

interface MasterPlanActions {
  select: (id: number | null) => void;
  setMode: (mode: ViewMode) => void;
  setActiveTab: (tab: string) => void;
  refreshPlans: () => void;
}

const MasterPlanContext = createContext<{ state: MasterPlanState; actions: MasterPlanActions } | null>(null);

export function useMasterPlanContext() {
  const ctx = useContext(MasterPlanContext);
  if (!ctx) throw new Error("useMasterPlanContext must be used within MasterPlanProvider");
  return ctx;
}

export function MasterPlanProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("idle");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("info");

  // Fetch Master Plans
  const { data: plansRes, isLoading: isLoadingPlans, refetch: refreshPlans } = useQuery({
    queryKey: ["hrm-master-plans"],
    queryFn: () => hrmPlansApi.list(),
  });

  const masterPlans = useMemo(() => plansRes?.data || [], [plansRes]);

  // Fetch Ranks for task assignment
  const { data: congChucRanks = [] } = useQuery({
    queryKey: ['categories', 'CIVIL_SERVANT_RANK'],
    queryFn: () => categoryApi.fetchByGroup('CIVIL_SERVANT_RANK'),
    staleTime: 5 * 60 * 1000,
  });
  const { data: vienChucRanks = [] } = useQuery({
    queryKey: ['categories', 'PUBLIC_EMPLOYEE_RANK'],
    queryFn: () => categoryApi.fetchByGroup('PUBLIC_EMPLOYEE_RANK'),
    staleTime: 5 * 60 * 1000,
  });

  const ranks = useMemo(() => [...congChucRanks, ...vienChucRanks], [congChucRanks, vienChucRanks]);

  const select = (id: number | null) => {
    setSelectedId(id);
    if (id !== null) {
      setMode("idle");
    }
  };

  const value = {
    state: {
      mode,
      selectedId,
      masterPlans,
      isLoadingPlans,
      activeTab,
      ranks,
      congChucRanks,
      vienChucRanks,
    },
    actions: {
      select,
      setMode,
      setActiveTab,
      refreshPlans,
    },
  };

  return <MasterPlanContext.Provider value={value}>{children}</MasterPlanContext.Provider>;
}
