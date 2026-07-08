import { useQuery } from "@tanstack/react-query";
import { hrmKpiEvaluationsApi } from "@/features/hrm/api/kpis.api";

export function useDashboardStats(selectedPeriod: string) {
  return useQuery({
    queryKey: ["hrm-kpi-dashboard-stats", selectedPeriod],
    queryFn: async () => {
      if (!selectedPeriod) return null;
      const res = await hrmKpiEvaluationsApi.getDashboardStats({ periodId: selectedPeriod });
      return res?.data || null;
    },
    enabled: !!selectedPeriod,
  });
}
