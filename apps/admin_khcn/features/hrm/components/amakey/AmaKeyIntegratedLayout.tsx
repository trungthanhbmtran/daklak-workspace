"use client";

import React from "react";
import { AmaKeyProvider } from "./amakey-context";
import { AmaKeyFloatingBar } from "./AmaKeyFloatingBar";
import { AmaKeyVirtualKeyboard } from "./AmaKeyVirtualKeyboard";
import { AmaKeyGuideModal } from "./AmaKeyGuideModal";

/**
 * AmaKeyIntegratedLayout - Bọc toàn bộ các thành phần AmaKey vào cây DOM của HRM
 */
export function AmaKeyIntegratedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AmaKeyProvider>
      {children}
      <AmaKeyFloatingBar />
      <AmaKeyVirtualKeyboard />
      <AmaKeyGuideModal />
    </AmaKeyProvider>
  );
}
