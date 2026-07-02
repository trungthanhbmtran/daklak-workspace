"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Network, Route as RouteIcon, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Back Button */}
      <div>
        <Link href="/hub" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Hub
        </Link>
      </div>

      {/* Header & Dashboard Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white border border-slate-200 p-6 rounded-lg shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Hệ thống Gateway hoạt động bình thường</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Trung tâm Điều khiển Gateway
          </h1>
          <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
            Quản lý tập trung các dịch vụ Microservices, điều hướng traffic (Routes) và cấp phát khóa bảo mật (API Keys) cho các hệ thống đối tác.
          </p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto relative z-10">
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-md p-4 flex flex-col justify-center items-center">
            <span className="text-2xl font-black text-slate-800">{services.length}</span>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Services</span>
          </div>
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-md p-4 flex flex-col justify-center items-center">
            <span className="text-2xl font-black text-slate-800">{routes.length}</span>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Routes</span>
          </div>
          <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-md p-4 flex flex-col justify-center items-center">
            <span className="text-2xl font-black text-emerald-600">{apiKeys.filter(k => k.isActive).length}</span>
            <span className="text-xs text-emerald-600 uppercase font-semibold tracking-wider mt-1">Active Keys</span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <div className="flex justify-start mb-6">
          <TabsList className="h-10 bg-slate-100 rounded-md p-1 border border-slate-200">
            <TabsTrigger value="services" className="rounded-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all">
              <Network className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="routes" className="rounded-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all">
              <RouteIcon className="w-4 h-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="rounded-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="services" className="focus-visible:outline-none">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="routes" className="focus-visible:outline-none">
          <RoutesTab />
        </TabsContent>

        <TabsContent value="apikeys" className="focus-visible:outline-none">
          <ApiKeysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
