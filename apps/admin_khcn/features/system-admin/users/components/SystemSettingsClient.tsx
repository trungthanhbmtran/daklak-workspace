"use client";

import React from 'react';
import { Settings2, Bot, Languages, MessageSquareCode } from 'lucide-react';
import { AiRouterConfig } from './settings/AiRouterConfig';
import { TranslationConfig } from './settings/TranslationConfig';
import { AiPromptConfig } from './settings/AiPromptConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface AiProviderConfig {
  id: string;
  provider: 'OPENAI' | 'GEMINI' | 'CLAUDE';
  model: string;
  apiKey: string;
  priority: number;
  enabled: boolean;
}

export function SystemSettingsClient() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-primary" />
          Cấu hình Hệ thống & Dịch vụ Nền tảng
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Quản lý các thông số cốt lõi, dịch vụ AI, dịch thuật và định tuyến thông minh.
        </p>
      </div>

      <Tabs defaultValue="ai-router" className="w-full">
        <TabsList className="w-full h-auto flex-col sm:flex-row bg-muted p-1.5 mb-6 rounded-2xl sm:rounded-full shadow-inner border border-border">
          <TabsTrigger value="ai-router" className="w-full sm:w-auto flex-1 rounded-xl sm:rounded-full px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary text-muted-foreground transition-all">
            <Bot className="w-4 h-4" />
            AI Router & Models
          </TabsTrigger>
          <TabsTrigger value="translation" className="w-full sm:w-auto flex-1 rounded-xl sm:rounded-full px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary text-muted-foreground transition-all">
            <Languages className="w-4 h-4" />
            Dịch thuật
          </TabsTrigger>
          <TabsTrigger value="prompts" className="w-full sm:w-auto flex-1 rounded-xl sm:rounded-full px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary text-muted-foreground transition-all">
            <MessageSquareCode className="w-4 h-4" />
            Mẫu Prompts
          </TabsTrigger>
        </TabsList>

          <TabsContent value="ai-router" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
              <AiRouterConfig />
            </div>
          </TabsContent>
          <TabsContent value="translation" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
              <TranslationConfig />
            </div>
          </TabsContent>
          <TabsContent value="prompts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
              <AiPromptConfig />
            </div>
          </TabsContent>
      </Tabs>
    </div>
  );
}
