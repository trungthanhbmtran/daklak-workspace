"use client";

import { useState } from "react";
import { FileText, MapPin, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationUnitEdit } from "./OrganizationUnitEdit";
import { UnitScopePanel } from "./UnitScopePanel";
import { OrganizationStaffing } from "./OrganizationStaffing";

export function OrganizationDetailClient() {
  const [activeTab, setActiveTab] = useState<string>("info");

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 h-full"
      >
        {/* Tab bar */}
        <div className="shrink-0 border-b bg-muted/30 px-4 pt-3 pb-2">
          <TabsList className="h-9 w-full sm:w-auto bg-muted/60 p-0.5 rounded-lg">
            <TabsTrigger
              value="info"
              className="gap-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4 shrink-0" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              value="scope"
              className="gap-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              Phạm vi phụ trách
            </TabsTrigger>
            <TabsTrigger
              value="staffing"
              className="gap-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 shrink-0" />
              Định biên & Chức danh
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Thông tin đơn vị */}
        <TabsContent
          value="info"
          className="flex-1 min-h-0 overflow-hidden mt-0 pt-4 px-4 pb-4 data-[state=active]:flex flex-col focus-visible:outline-none h-full"
        >
          <OrganizationUnitEdit />
        </TabsContent>

        {/* Tab: Phạm vi phụ trách */}
        <TabsContent
          value="scope"
          className="flex-1 min-h-0 mt-0 pt-6 px-6 pb-6 data-[state=active]:flex flex-col focus-visible:outline-none h-full"
        >
          <UnitScopePanel />
        </TabsContent>

        {/* Tab: Định biên & Chức danh */}
        <TabsContent
          value="staffing"
          className="flex-1 min-h-0 overflow-y-auto mt-0 pt-4 px-4 pb-4 data-[state=active]:flex flex-col focus-visible:outline-none h-full"
        >
          <OrganizationStaffing />
        </TabsContent>
      </Tabs>
    </div>
  );
}
