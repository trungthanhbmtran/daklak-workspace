"use client";

import React from 'react';
import { Settings2 } from 'lucide-react';
import { AiRouterConfig } from './settings/AiRouterConfig';
import { TranslationConfig } from './settings/TranslationConfig';
import { AiPromptConfig } from './settings/AiPromptConfig';

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
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-600" />
          Cấu hình Hệ thống & Dịch vụ Nền tảng
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Quản lý các thông số cốt lõi, dịch vụ AI, dịch thuật và định tuyến thông minh.
        </p>
      </div>

      <AiRouterConfig />
      <TranslationConfig />
      <AiPromptConfig />
    </div>
  );
}
