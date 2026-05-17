"use client";

import React from "react";
import { VisualEditor } from "@/modules/page-builder";
import { Row } from "@/modules/page-builder/core/types";

interface PageBuilderProps {
  layout: Row[];
  onChange: (layout: Row[]) => void;
  languages: any[];
}

export function PageBuilder({ layout, onChange, languages }: PageBuilderProps) {
  return (
    <VisualEditor
      initialLayout={layout}
      onChange={onChange}
      languages={languages}
    />
  );
}
