"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Briefcase, Calendar, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHrmEmployee } from "@/features/hrm";
import { EmployeeInfoTab } from "./employee-tabs/EmployeeInfoTab";
import { EmployeeContractsTab } from "./employee-tabs/EmployeeContractsTab";
import { EmployeeHistoryTab } from "./employee-tabs/EmployeeHistoryTab";
import { useEmployeeTitles } from "./employee-tabs/useEmployeeTitles";

export function EmployeeDetailClient({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = typeof (params as Promise<{ id: string }>).then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const id = parseInt(resolvedParams.id, 10);
  const [activeTab, setActiveTab] = useState("info");

  const { data: employee, isLoading, isError } = useHrmEmployee(Number.isNaN(id) ? null : id);
  const { unitName, mainTitleName } = useEmployeeTitles(employee);

  const fullName = employee ? (employee.fullName || [employee.firstname, employee.lastname].filter(Boolean).join(" ")) : "—";

  if (Number.isNaN(id)) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-6 md:p-10 items-center justify-center">
        <Text variant="muted" className="mb-4">ID không hợp lệ.</Text>
        <Link href="/services/hrm/employees">
          <Button variant="link">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-6 md:p-10 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <Text variant="muted">Đang tải hồ sơ...</Text>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-6 md:p-10 items-center justify-center">
        <Text variant="error" className="mb-4">Không tìm thấy nhân viên hoặc lỗi tải dữ liệu.</Text>
        <Link href="/services/hrm/employees">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <div>
          <Link href="/services/hrm/employees">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4" iconStart={<ArrowLeft className="h-4 w-4" />}>Quay lại danh sách</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-4">
            <Card className="rounded-2xl shadow-sm overflow-hidden sticky top-6">
              <div className="h-28 bg-gradient-to-br from-primary/80 to-primary"></div>
              <CardContent className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm -mt-12 bg-background">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-2xl font-semibold text-primary bg-primary/10">
                    {fullName.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <Heading level="h2" className="mt-3">{fullName}</Heading>
                <Text variant="muted" weight="medium" className="mt-1">{mainTitleName}</Text>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Đang làm việc
                  </span>
                </div>
                <div className="w-full h-px bg-border my-6"></div>
                <div className="w-full space-y-4 text-sm md:text-base text-left">
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-3 shrink-0" />
                    <Text as="span" weight="medium" className="text-foreground">{unitName}</Text>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-3 shrink-0" />
                    <Text as="span" weight="medium" className="text-foreground truncate">{employee.email || "—"}</Text>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-3 shrink-0" />
                    <Text as="span" weight="medium" className="text-foreground">{employee.phone || "—"}</Text>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-3 shrink-0" />
                    <Text as="span" weight="medium" className="text-foreground">Mã NV: {employee.employeeCode || employee.id}</Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="bg-muted p-1 rounded-xl h-auto inline-flex flex-wrap">
                <TabsTrigger value="info" className="rounded-lg px-4 sm:px-6 py-2 md:py-2.5 text-sm font-medium transition-all">
                  Sơ yếu lý lịch
                </TabsTrigger>
                <TabsTrigger value="contracts" className="rounded-lg px-4 sm:px-6 py-2 md:py-2.5 text-sm font-medium transition-all">
                  Hợp đồng
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg px-4 sm:px-6 py-2 md:py-2.5 text-sm font-medium transition-all">
                  Lịch sử công tác
                </TabsTrigger>
              </TabsList>

              <EmployeeInfoTab employee={employee} />
              <EmployeeContractsTab />
              <EmployeeHistoryTab employee={employee} />
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
