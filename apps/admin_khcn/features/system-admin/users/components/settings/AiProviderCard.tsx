/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import { useAiFetchModels } from '../../hooks/useAiModels';
import { AiProviderConfig } from '../SystemSettingsClient';

interface AiProviderCardProps {
  provider: AiProviderConfig;
  aiProviderCategories: any[];
  onChange: (field: keyof AiProviderConfig, value: any) => void;
  onRemove: () => void;
}

export function AiProviderCard({ provider, aiProviderCategories, onChange, onRemove }: AiProviderCardProps) {
  // Hook xử lý fetch model được đóng gói độc lập trong Component con
  const { fetchedModels, isFetching, fetchModels } = useAiFetchModels();

  const handleFetchModels = () => {
    fetchModels(provider.id, provider.provider, provider.apiKey);
  };

  const currentModels = fetchedModels[provider.id] || (
    provider.provider === 'OPENAI' ? [{ id: 'gpt-4o', name: 'gpt-4o', contextWindow: 128000 }, { id: 'gpt-4o-mini', name: 'gpt-4o-mini', contextWindow: 128000 }, { id: 'gpt-4-turbo', name: 'gpt-4-turbo', contextWindow: 128000 }, { id: 'o1-mini', name: 'o1-mini', contextWindow: 128000 }, { id: 'o1-preview', name: 'o1-preview', contextWindow: 128000 }] :
    provider.provider === 'GEMINI' ? [{ id: 'gemini-1.5-pro', name: 'gemini-1.5-pro', contextWindow: 2097152 }, { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', contextWindow: 1048576 }, { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', contextWindow: 1048576 }, { id: 'gemini-1.0-pro', name: 'gemini-1.0-pro', contextWindow: 32768 }] :
    provider.provider === 'CLAUDE' ? [{ id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet-20241022', contextWindow: 200000 }, { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku-20241022', contextWindow: 200000 }, { id: 'claude-3-opus-20240229', name: 'claude-3-opus-20240229', contextWindow: 200000 }] : []
  );

  return (
    <div className={`p-5 bg-card rounded-2xl border ${provider.enabled ? 'border-primary/50 shadow-md' : 'border-border opacity-60'} relative transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${provider.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            #{provider.priority}
          </div>
          <h4 className="font-bold text-foreground text-lg">Ưu tiên {provider.priority} {provider.enabled ? '' : '(Đã tắt)'}</h4>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onChange('enabled', !provider.enabled)} className={provider.enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'}>
            {provider.enabled ? 'Đang Bật' : 'Đang Tắt'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg" iconStart={<Trash2 className="w-4 h-4" />}></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nhà Cung cấp</label>
          <select
            className="w-full h-11 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium text-foreground"
            value={provider.provider}
            onChange={(e) => onChange('provider', e.target.value)}
          >
            {aiProviderCategories.map((cat: any) => (
              <option key={cat.code} value={cat.code}>{cat.nameVi || cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Tên Model</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-[10px] text-primary hover:text-primary/80 bg-primary/10"
              onClick={handleFetchModels}
              disabled={isFetching[provider.id]}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isFetching[provider.id] ? 'animate-spin' : ''}`} />
              Tải danh sách
            </Button>
          </label>
          <Combobox
            value={provider.model}
            onValueChange={(val) => onChange('model', val || '')}
          >
            <ComboboxInput
              placeholder="Chọn hoặc nhập model..."
              className="h-11 border-input bg-background focus:ring-2 focus:ring-primary rounded-xl"
              onChange={(e: any) => onChange('model', e.target.value)}
            />
            <ComboboxContent>
              <ComboboxList>
                {currentModels.map((m: any) => {
                  const mId = typeof m === 'string' ? m : m.id;
                  const mName = typeof m === 'string' ? m : m.name;
                  const mCtx = typeof m === 'string' ? undefined : m.contextWindow;
                  return (
                    <ComboboxItem key={mId} value={mId}>
                      <div className="flex justify-between w-full items-center gap-2">
                        <span>{mName}</span>
                        {mCtx && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{(mCtx / 1000).toFixed(0)}k</span>}
                      </div>
                    </ComboboxItem>
                  );
                })}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mức ưu tiên</label>
          <input
            type="number"
            className="w-full h-11 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
            value={provider.priority}
            onChange={(e) => onChange('priority', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">API Key (Token)</label>
          <input
            type="password"
            className="w-full h-11 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
            value={provider.apiKey}
            onChange={(e) => onChange('apiKey', e.target.value)}
            placeholder="Nhập API Key bảo mật..."
          />
        </div>
      </div>
    </div>
  );
}
