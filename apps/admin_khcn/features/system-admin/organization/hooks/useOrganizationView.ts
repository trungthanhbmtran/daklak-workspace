"use client";

import { useState } from "react";
import type { ViewMode } from "../context/OrganizationContext";

export type ViewState = {
  mode: ViewMode;
  selectedId?: number;
  parentId?: number;
};

export function useOrganizationView() {
  const [viewState, setViewState] = useState<ViewState>({ mode: "idle" });
  const [activeTab, setActiveTab] = useState<string>("info");

  return {
    viewState,
    activeTab,
    setActiveTab,
    select: (id: number) => {
      setViewState({ mode: "idle", selectedId: id });
      setActiveTab("info");
    },
    addRoot: () => setViewState({ mode: "create_root" }),
    addChild: (parentId: number) =>
      setViewState({ mode: "create_child", parentId }),
    cancel: () => setViewState({ mode: "idle" }),
  };
}
