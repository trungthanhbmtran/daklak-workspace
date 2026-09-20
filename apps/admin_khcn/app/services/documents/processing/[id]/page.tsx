"use client";

import React from "react";
import { useParams } from "next/navigation";
import DocumentProcessingWorkspace from "@/features/document/components/DocumentProcessingWorkspace";
import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function DocumentProcessingPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const { useGetDocument } = useDocuments();
  const { data: document } = useGetDocument(id);

  return (
    <div className="h-full w-full">
      <DocumentProcessingWorkspace document={document} />
    </div>
  );
}