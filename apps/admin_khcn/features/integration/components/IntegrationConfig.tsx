/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Server, Save, Network, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGatewayEndpoints, useNginxConfig, useUpdateNginxConfig } from "../api";
import { toast } from "sonner";

export function IntegrationConfig() {
  const { data: endpoints, isLoading: isLoadingEndpoints } = useGatewayEndpoints();
  const { data: nginxConfigData, isLoading: isLoadingNginx, refetch: refetchNginx } = useNginxConfig();
  const updateNginxMutation = useUpdateNginxConfig();

  const [nginxContent, setNginxContent] = useState("");

  useEffect(() => {
    if (nginxConfigData?.content) {
      setNginxContent(nginxConfigData.content);
    }
  }, [nginxConfigData]);

  const handleSaveNginx = () => {
    updateNginxMutation.mutate(nginxContent, {
      onSuccess: () => {
        toast.success("Đã lưu cấu hình Nginx thành công!");
      },
      onError: (err: any) => {
        toast.error(`Lỗi khi lưu cấu hình: ${err.message}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cột trái: Danh sách Microservices */}
      <div className="col-span-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-violet-900/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gateway APIs</h3>
        </div>
        
        {isLoadingEndpoints ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {endpoints?.map((ep: any) => (
              <div key={ep.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{ep.name}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {ep.status}
                  </span>
                </div>
                <div className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  {ep.path}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cột phải: Nginx Config Editor */}
      <div className="col-span-1 lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-violet-900/5 flex flex-col h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cấu hình NGINX</h3>
              <p className="text-xs text-slate-500 font-medium">Tệp cấu hình máy chủ web và Reverse Proxy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-9" 
              onClick={() => refetchNginx()}
              disabled={isLoadingNginx}
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoadingNginx ? 'animate-spin' : ''}`} />
              Tải lại
            </Button>
            <Button 
              size="sm" 
              className="rounded-lg h-9 bg-violet-600 hover:bg-violet-700 text-white" 
              onClick={handleSaveNginx}
              disabled={updateNginxMutation.isPending}
            >
              {updateNginxMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu & Áp dụng
            </Button>
          </div>
        </div>

        {isLoadingNginx ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-400 font-mono text-sm">Đang tải file cấu hình...</p>
          </div>
        ) : (
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 bg-[#1e1e1e]">
            {/* Simple Textarea as a fallback code editor. In a real project, Monaco Editor would be used here. */}
            <textarea
              className="w-full h-full p-6 bg-transparent text-slate-300 font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:ring-0 custom-scrollbar"
              value={nginxContent}
              onChange={(e) => setNginxContent(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
