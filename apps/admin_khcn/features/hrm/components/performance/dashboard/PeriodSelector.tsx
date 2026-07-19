import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hrmKpiPeriodsApi } from "@/features/hrm/api/kpis.api";

export function PeriodSelector({ selectedPeriod, onSelect }: { selectedPeriod: string, onSelect: (v: string) => void }) {
  const { data: periodsData } = useQuery({
    queryKey: ["hrm-kpi-periods"],
    queryFn: () => hrmKpiPeriodsApi.getPeriods().then((res: any) => res.data || []),
  });

  return (
    <Select value={selectedPeriod} onValueChange={onSelect}>
      <SelectTrigger className="h-11 bg-background rounded-xl shadow-sm border-border font-medium">
        <SelectValue placeholder="Chọn kỳ đánh giá..." />
      </SelectTrigger>
      <SelectContent>
        {periodsData?.map((p: any) => (
          <SelectItem key={p.id} value={p.id.toString()}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
