"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Network, Route as RouteIcon, Activity } from "lucide-react";

import { ServicesTab } from "./ServicesTab";
import { RoutesTab } from "./RoutesTab";
import { ApiKeysTab } from "./ApiKeysTab";

export function GatewayClient() {
  // Nhờ React Query, các lời gọi này sẽ được gộp chung (deduped) với lời gọi bên trong từng tab
  // nên không gây ra request dư thừa mạng.
  const { data: services = [] } = useQuery({ queryKey: ['gateway', 'services'], queryFn: gatewayApi.getServices });
  const { data: routes = [] } = useQuery({ queryKey: ['gateway', 'routes'], queryFn: gatewayApi.getRoutes });
  const { data: apiKeys = [] } = useQuery({ queryKey: ['gateway', 'apikeys'], queryFn: gatewayApi.getApiKeys });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 min-h-0 overflow-hidden">
      
      {/* Header & Dashboard Stats */}
      <div className="shrink-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary rounded-full blur-3xl opacity-20 dark:opacity-10"></div>
          <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Hệ thống Gateway hoạt động bình thường</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Trung tâm Điều khiển Gateway
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              Quản lý tập trung các dịch vụ Microservices, điều hướng traffic (Routes) và cấp phát khóa bảo mật (API Keys) cho các hệ thống đối tác.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto relative z-10">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-3 sm:p-4 flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-foreground">{services.length}</span>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1 text-center">Services</span>
            </div>
            <div className="bg-muted/50 border border-border/50 rounded-lg p-3 sm:p-4 flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-foreground">{routes.length}</span>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1 text-center">Routes</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 sm:p-4 flex flex-col justify-center items-center col-span-2 sm:col-span-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{apiKeys.filter(k => k.isActive).length}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold tracking-wider mt-1 text-center">Active Keys</span>
            </div>
          </div>
        </div>

      <Tabs defaultValue="services" className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 flex justify-start mb-4 overflow-x-auto pb-1">
          <TabsList className="h-10 bg-muted/80 backdrop-blur">
              <TabsTrigger value="services" className="rounded-sm px-4">
                <Network className="w-4 h-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="routes" className="rounded-sm px-4">
                <RouteIcon className="w-4 h-4 mr-2" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="apikeys" className="rounded-sm px-4">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="routes" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none">
          <RoutesTab />
        </TabsContent>

        <TabsContent value="apikeys" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none">
          <ApiKeysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
