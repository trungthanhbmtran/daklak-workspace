import { PlanDetailClient } from "@/features/hrm/components/plans/PlanDetailClient";

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  return <PlanDetailClient planId={Number(params.id)} />;
}
