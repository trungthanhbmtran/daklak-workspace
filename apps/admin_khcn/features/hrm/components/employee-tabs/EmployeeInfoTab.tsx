/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { TabsContent } from "@/components/ui/tabs";
import { useEmployeeTitles } from "./useEmployeeTitles";

interface EmployeeInfoTabProps {
  employee: any;
}

export function EmployeeInfoTab({ employee }: EmployeeInfoTabProps) {
  const { unitName, govtTitleName, rankTitleName, partyTitleName, assignedSlot } = useEmployeeTitles(employee);
  return (
    <TabsContent value="info" className="outline-none">
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <Heading level="h4" className="mb-6">Thông tin định danh</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 lg:gap-x-12 text-sm md:text-base">
            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Mã nhân viên</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.employeeCode || employee.id}</Text>
            </div>
            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Số CCCD</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.identityCard || "—"}</Text>
            </div>
            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Email</Text>
              <Text as="span" weight="semibold" className="text-foreground break-words">{employee.email || "—"}</Text>
            </div>
            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Số điện thoại</Text>
              <Text as="span" weight="semibold" className="text-foreground">{employee.phone || "—"}</Text>
            </div>
            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Đơn vị</Text>
              <Text as="span" weight="semibold" className="text-foreground break-words">{unitName}</Text>
            </div>
            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Chức danh / Ngạch</Text>
              <Text as="span" weight="semibold" className="text-foreground">{govtTitleName !== "—" ? govtTitleName : rankTitleName}</Text>
            </div>

            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Chức vụ Đảng</Text>
              <Text as="span" weight="semibold" className="text-foreground">{partyTitleName}</Text>
            </div>

            <div className="flex flex-col space-y-1.5 min-w-0">
              <Text as="span" variant="small" className="text-muted-foreground font-normal">Vị trí chức danh định biên</Text>
              <Text as="span" weight="semibold" className="text-blue-700 break-words">
                {assignedSlot ? (assignedSlot.description || `Vị trí ${assignedSlot.slotOrder} (${assignedSlot.jobTitleName || ''})`) : "Chưa phân công"}
              </Text>
            </div>

            {assignedSlot?.domains && assignedSlot.domains.length > 0 && (
              <div className="flex flex-col space-y-1.5 min-w-0 sm:col-span-2">
                <Text as="span" variant="small" className="text-muted-foreground font-normal">Lĩnh vực công tác phụ trách</Text>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {assignedSlot.domains.map((d: any) => (
                    <span key={d.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
