"use client";

import React, { useState } from "react";
import { NotificationListClient } from "@/features/notifications/NotificationListClient";
import { NotificationConfigPanel } from "@/features/notifications/components/NotificationConfigPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings } from "lucide-react";

interface NotificationsClientProps {
  defaultTab?: string;
}

export function NotificationsClient({ defaultTab = "list" }: NotificationsClientProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([defaultTab]));

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    setVisitedTabs((prev) => {
      if (prev.has(nextTab)) return prev;
      const next = new Set(prev);
      next.add(nextTab);
      return next;
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
      <div className="shrink-0 flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="hidden md:block" />
        <div className="flex w-full md:w-auto justify-center md:justify-end">
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="list" className="flex gap-2">
              <Bell className="w-4 h-4" />
              Cá nhân
            </TabsTrigger>
            <TabsTrigger value="config" className="flex gap-2">
              <Settings className="w-4 h-4" />
              Cấu hình
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent
        value="list"
        className={`flex-1 min-h-0 mt-0 border-none p-0 outline-none overflow-hidden ${
          activeTab === "list" ? "flex flex-col" : "hidden"
        }`}
      >
        {visitedTabs.has("list") && <NotificationListClient />}
      </TabsContent>

      <TabsContent
        value="config"
        className={`flex-1 min-h-0 mt-0 border-none p-0 outline-none overflow-hidden ${
          activeTab === "config" ? "flex flex-col" : "hidden"
        }`}
      >
        {visitedTabs.has("config") && <NotificationConfigPanel />}
      </TabsContent>
    </Tabs>
  );
}
