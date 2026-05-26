import { PlanDetailClient } from "@/features/hrm/components/plans/PlanDetailClient";

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PlanDetailClient planId={Number(resolvedParams.id)} />;
}
