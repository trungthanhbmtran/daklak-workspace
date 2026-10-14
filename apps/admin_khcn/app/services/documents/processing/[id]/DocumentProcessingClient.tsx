"use client";

import React from "react";
import DocumentProcessingWorkspace from "@/features/document/components/DocumentProcessingWorkspace";
import { useDocuments } from "@/features/document/hooks/useDocuments";

interface DocumentProcessingClientProps {
  id: string;
}

export default function DocumentProcessingClient({ id }: DocumentProcessingClientProps) {
  const { useGetDocument } = useDocuments();
  const { data: document } = useGetDocument(id);

  return (
    <div className="h-full w-full">
      <DocumentProcessingWorkspace document={document} />
    </div>
  );
}
