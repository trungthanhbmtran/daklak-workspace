import React from "react";
import { ConsultationDetailClient } from "@/features/document/components/ConsultationDetailClient";

export default function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  return <ConsultationDetailClient consultationId={resolvedParams.id} />;
}