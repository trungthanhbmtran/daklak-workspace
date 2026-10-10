"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Network, Route as RouteIcon, Server, ArrowRightLeft, ShieldCheck, Zap, Settings } from "lucide-react";

import { ServicesTab } from "./ServicesTab";
import { RoutesTab } from "./RoutesTab";
import { ApiKeysTab } from "./ApiKeysTab";
import { SettingsTab } from "./SettingsTab";

export function GatewayClient() {
  const { data: services = [] } = useQuery({ queryKey: ['gateway', 'services'], queryFn: gatewayApi.getServices });
  const { data: routes = [] } = useQuery({ queryKey: ['gateway', 'routes'], queryFn: gatewayApi.getRoutes });
  const { data: apiKeys = [] } = useQuery({ queryKey: ['gateway', 'apikeys'], queryFn: gatewayApi.getApiKeys });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 min-h-0 overflow-hidden bg-background">
      
      {/* Enterprise Header & Dashboard Stats */}
      <div className="shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-stretch gap-6 bg-gradient-to-br from-card to-muted/20 text-card-foreground border border-border p-8 rounded-2xl shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-40 -mb-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4 w-fit shadow-sm max-w-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Gateway Control Plane Is Healthy</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Enterprise API Management
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xl break-words">
            Quản trị luồng dữ liệu (Traffic), cấu hình định tuyến (Routing) và giám sát quyền truy cập thông qua Gateway tập trung chuyên dụng.
          </p>
        </div>

        <div className="relative z-10 flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto self-stretch items-center min-w-0">
          <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm hover:shadow-md hover:border-primary/30 transition-all min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xl font-black text-foreground">{services.length}</span>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Upstreams</p>
            </div>
          </div>
          <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm hover:shadow-md hover:border-primary/30 transition-all min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xl font-black text-foreground">{routes.length}</span>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Routes</p>
            </div>
          </div>
          <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm hover:shadow-md hover:border-primary/30 transition-all min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{apiKeys.filter(k => k.isActive).length}</span>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider mt-1">Active Keys</p>
            </div>
          </div>
          <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-xl p-5 flex flex-col justify-between h-full shadow-sm hover:shadow-md hover:border-primary/30 transition-all relative overflow-hidden min-w-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-3xl font-black text-primary">&lt;10</span>
                <span className="text-sm font-semibold text-primary ml-1">ms</span>
                <p className="text-[11px] text-primary/80 uppercase font-bold tracking-wider mt-1">Latency</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="services" className="flex flex-col flex-1 min-h-0 mt-2">
        <div className="shrink-0 flex justify-start mb-6 border-b border-border">
          <TabsList className="h-12 bg-transparent border-none p-0 flex gap-6">
            <TabsTrigger 
              value="services" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              <Network className="w-4 h-4 mr-2" /> Upstreams
            </TabsTrigger>
            <TabsTrigger 
              value="routes" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              <RouteIcon className="w-4 h-4 mr-2" /> Routing Rules
            </TabsTrigger>
            <TabsTrigger 
              value="apikeys" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              <Key className="w-4 h-4 mr-2" /> Security (API Keys)
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              <Settings className="w-4 h-4 mr-2" /> Cấu hình
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="services" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none mt-0">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="routes" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none mt-0">
          <RoutesTab />
        </TabsContent>

        <TabsContent value="apikeys" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none mt-0">
          <ApiKeysTab />
        </TabsContent>

        <TabsContent value="settings" className="data-[state=active]:flex data-[state=active]:flex-col flex-1 min-h-0 overflow-hidden focus-visible:outline-none mt-0">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
