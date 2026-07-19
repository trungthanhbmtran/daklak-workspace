/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
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
          <Heading level="h4" className="mb-6">Thông tin định danh</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 lg:gap-x-12 text-sm md:text-base">
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Mã nhân viên</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.employeeCode || employee.id}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Số CCCD</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.identityCard || "—"}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Email</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.email || "—"}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Số điện thoại</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.phone || "—"}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Đơn vị</Text>
              <Text as="span" weight="semibold" className="text-foreground">{unitName}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Chức vụ chính quyền</Text>
              <Text as="span" weight="semibold" className="text-foreground">{govtTitleName}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Ngạch công chức</Text>
              <Text as="span" weight="semibold" className="text-foreground">{rankTitleName}</Text>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Chức vụ Đảng</Text>
              <Text as="span" weight="semibold" className="text-foreground">{partyTitleName}</Text>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
