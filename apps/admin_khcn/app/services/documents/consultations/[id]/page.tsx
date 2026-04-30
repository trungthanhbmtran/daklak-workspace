import React from "react";
import DocumentPublishingPage from "@/features/document/components/DocumentPublishingPage";

export default function PublishDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params as required by Next.js 15+
  const resolvedParams = React.use(params);
  
  return (
    <div className="h-full w-full bg-muted/5">
      <DocumentPublishingPage />
    </div>
  );
}