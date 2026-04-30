"use client";

import React from "react";
import DocumentProcessingWorkspace from "@/features/document/components/DocumentProcessingWorkspace";
import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function DocumentProcessingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { useGetDocument } = useDocuments();
  const { data: document } = useGetDocument(resolvedParams.id);

  return (
    <div className="h-full w-full">
      <DocumentProcessingWorkspace document={document} />
    </div>
  );
}