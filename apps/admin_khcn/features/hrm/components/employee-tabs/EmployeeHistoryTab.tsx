/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
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
          <Heading level="h4" className="mb-6">Lịch sử công tác</Heading>
          <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
            
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
              <div className="flex flex-col">
                <Text as="span" variant="small" weight="medium" className="text-primary mb-1">01/2022 - Nay</Text>
                <Heading level="h4">{mainTitleName !== "—" ? mainTitleName : "Chuyên viên"}</Heading>
                <Text variant="small" className="text-muted-foreground mt-1 font-normal">{unitName !== "—" ? unitName : "Phòng Hành chính Tổng hợp"}</Text>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-muted-foreground/30 rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
              <div className="flex flex-col">
                <Text as="span" variant="small" weight="medium" className="text-muted-foreground mb-1">10/2021 - 12/2021</Text>
                <Heading level="h4">Nhân viên thử việc</Heading>
                <Text variant="small" className="text-muted-foreground mt-1 font-normal">{unitName !== "—" ? unitName : "Phòng Hành chính Tổng hợp"}</Text>
              </div>
            </div>

          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
