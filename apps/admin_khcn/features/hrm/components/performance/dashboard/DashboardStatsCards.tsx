import { useDashboardStats } from "./useDashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Loader2 } from "lucide-react";

export function DashboardStatsCards({ selectedPeriod }: { selectedPeriod: string }) {
  const { data: statsData, isFetching } = useDashboardStats(selectedPeriod);

  if (isFetching) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!statsData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-0 shadow-sm overflow-hidden rounded-2xl relative bg-card">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        <CardHeader className="pb-2">
          <CardDescription className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs md:text-sm">Tổng nhân sự đã đánh giá</CardDescription>
          <CardTitle className="text-3xl md:text-4xl font-black text-foreground">{statsData.totalEvaluations || 0}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-medium">
            <Users className="w-4 h-4 shrink-0" /> Nhân sự trong toàn cơ quan
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden rounded-2xl relative bg-card">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60"></div>
        <CardHeader className="pb-2">
          <CardDescription className="font-semibold text-primary uppercase tracking-wider text-xs md:text-sm">Điểm Trung Bình Toàn Cơ Quan</CardDescription>
          <CardTitle className="text-3xl md:text-4xl font-black text-foreground">{statsData.companyAvgScore || 0}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-medium">
            <Activity className="w-4 h-4 shrink-0" /> Dựa trên tổng điểm của tất cả phiếu duyệt
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
