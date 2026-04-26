"use client";

import DocumentProcessingWorkspace from "@/features/document/components/DocumentProcessingWorkspace";
import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function DocumentProcessingPage({ params }: { params: { id: string } }) {
  const { useGetDocument } = useDocuments();
  const { data: document } = useGetDocument(params.id);

  return (
    <div className="h-full w-full">
      <DocumentProcessingWorkspace document={document} />
    </div>
  );
}