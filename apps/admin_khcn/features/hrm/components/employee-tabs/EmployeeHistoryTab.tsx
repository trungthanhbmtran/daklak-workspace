import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useEmployeeTitles } from "./useEmployeeTitles";

interface EmployeeHistoryTabProps {
  employee: any;
}

export function EmployeeHistoryTab({ employee }: EmployeeHistoryTabProps) {
  const { mainTitleName, unitName } = useEmployeeTitles(employee);
  return (
    <TabsContent value="history" className="outline-none">
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h4 className="text-lg md:text-xl font-semibold text-foreground mb-6">Lịch sử công tác</h4>
          <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
            
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-primary mb-1">01/2022 - Nay</span>
                <h5 className="font-semibold text-foreground text-base">{mainTitleName !== "—" ? mainTitleName : "Chuyên viên"}</h5>
                <p className="text-sm text-muted-foreground mt-1">{unitName !== "—" ? unitName : "Phòng Hành chính Tổng hợp"}</p>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-muted-foreground/30 rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">10/2021 - 12/2021</span>
                <h5 className="font-semibold text-foreground text-base">Nhân viên thử việc</h5>
                <p className="text-sm text-muted-foreground mt-1">{unitName !== "—" ? unitName : "Phòng Hành chính Tổng hợp"}</p>
              </div>
            </div>

          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
