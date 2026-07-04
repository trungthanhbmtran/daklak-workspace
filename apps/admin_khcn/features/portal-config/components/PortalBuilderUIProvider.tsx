"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface PortalBuilderUIContextType {
  selectedPageId: string;
  setSelectedPageId: (id: string) => void;
  showPagesSidebar: boolean;
  setShowPagesSidebar: (show: boolean) => void;
}

const PortalBuilderUIContext = createContext<PortalBuilderUIContextType | null>(null);

export const usePortalBuilderUI = () => {
  const context = useContext(PortalBuilderUIContext);
  if (!context) {
    throw new Error("usePortalBuilderUI must be used within a PortalBuilderUIProvider");
  }
  return context;
};

export const PortalBuilderUIProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [showPagesSidebar, setShowPagesSidebar] = useState<boolean>(true);

  return (
    <PortalBuilderUIContext.Provider value={{
      selectedPageId,
      setSelectedPageId,
      showPagesSidebar,
      setShowPagesSidebar
    }}>
      {children}
    </PortalBuilderUIContext.Provider>
  );
};
