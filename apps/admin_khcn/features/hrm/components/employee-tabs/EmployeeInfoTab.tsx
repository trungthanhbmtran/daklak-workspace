import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useEmployeeTitles } from "./useEmployeeTitles";

interface EmployeeInfoTabProps {
  employee: any;
}

export function EmployeeInfoTab({ employee }: EmployeeInfoTabProps) {
  const { unitName, govtTitleName, rankTitleName, partyTitleName } = useEmployeeTitles(employee);
  return (
    <TabsContent value="info" className="outline-none">
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h4 className="text-lg md:text-xl font-semibold text-foreground mb-6">Thông tin định danh</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 lg:gap-x-12 text-sm md:text-base">
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Mã nhân viên</span>
              <span className="font-semibold text-foreground">{employee.employeeCode || employee.id}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Số CCCD</span>
              <span className="font-semibold text-foreground">{employee.identityCard || "—"}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Email</span>
              <span className="font-semibold text-foreground">{employee.email || "—"}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Số điện thoại</span>
              <span className="font-semibold text-foreground">{employee.phone || "—"}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Đơn vị</span>
              <span className="font-semibold text-foreground">{unitName}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Chức vụ chính quyền</span>
              <span className="font-semibold text-foreground">{govtTitleName}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Ngạch công chức</span>
              <span className="font-semibold text-foreground">{rankTitleName}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-muted-foreground text-xs md:text-sm">Chức vụ Đảng</span>
              <span className="font-semibold text-foreground">{partyTitleName}</span>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
