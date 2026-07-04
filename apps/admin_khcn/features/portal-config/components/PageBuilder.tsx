"use client";

import { usePortalBuilderUI } from "./PortalBuilderUIProvider";
import { usePageLayout } from "./hooks/usePageLayout";
import { useLanguages } from "./hooks/useLanguages";
import { usePagesList } from "./hooks/usePagesList";
import { VisualEditor } from "@/modules/page-builder";
import { Row } from "@/modules/page-builder/core/types";

export function PageBuilder() {
  const { selectedPageId } = usePortalBuilderUI();
  const { pagesList } = usePagesList(selectedPageId, () => {});
  const activePageMeta = pagesList.find(p => p.id === selectedPageId);
  const { currentLayout, setCurrentLayout } = usePageLayout(
      selectedPageId, 
      activePageMeta?.isActive ?? false, 
      activePageMeta?.title?.vi || selectedPageId
  );
  
  const rawLanguages = useLanguages();
  const activeLangs = rawLanguages.length > 0 ? rawLanguages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];


  return (
    <VisualEditor
      initialLayout={currentLayout}
      onChange={setCurrentLayout}
      languages={activeLangs}
    />
  );
}
