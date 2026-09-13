/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  const { fetchedModels, isFetching, fetchModels } = useAiFetchModels();

  React.useEffect(() => {
    if (provider.apiKey && !fetchedModels[provider.id]) {
      fetchModels(provider.id, provider.provider, provider.apiKey, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchModels = () => {
    fetchModels(provider.id, provider.provider, provider.apiKey);
  };

  const currentModels = fetchedModels[provider.id] || (
    provider.provider === 'OPENAI' ? [{ id: 'gpt-4o', name: 'gpt-4o', contextWindow: 128000 }, { id: 'gpt-4o-mini', name: 'gpt-4o-mini', contextWindow: 128000 }, { id: 'o1', name: 'o1', contextWindow: 200000 }, { id: 'o3-mini', name: 'o3-mini', contextWindow: 200000 }] :
    provider.provider === 'GEMINI' ? [{ id: 'gemini-1.5-pro', name: 'gemini-1.5-pro', contextWindow: 2097152 }, { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', contextWindow: 1048576 }, { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', contextWindow: 1048576 }] :
    provider.provider === 'CLAUDE' ? [{ id: 'claude-3-7-sonnet-20250219', name: 'claude-3-7-sonnet-20250219', contextWindow: 200000 }, { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet-20241022', contextWindow: 200000 }, { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku-20241022', contextWindow: 200000 }, { id: 'claude-3-opus-20240229', name: 'claude-3-opus-20240229', contextWindow: 200000 }] : []
  );

  return (
    <div className={`flex flex-col gap-4 p-4 sm:p-5 bg-card rounded-xl border transition-colors ${provider.enabled ? 'border-border shadow-sm' : 'border-border/40 opacity-70 bg-muted/30'}`}>
      
      {/* Header Row: Priority, Status, Delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={provider.enabled ? "default" : "secondary"} className="h-7 px-2 font-mono text-sm">
            #{provider.priority}
          </Badge>
          <span className="font-semibold text-sm sm:text-base hidden sm:inline-block text-foreground">
            {provider.provider} - {provider.model || 'Chưa chọn model'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
              {provider.enabled ? 'Đang bật' : 'Đã tắt'}
            </span>
            <Switch 
              checked={provider.enabled}
              onCheckedChange={(val) => onChange('enabled', val)}
              aria-label="Toggle provider"
            />
          </div>
          <div className="w-px h-5 bg-border"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove} 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
          >
            <Trash2 className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline-block text-xs">Xóa</span>
          </Button>
        </div>
      </div>

      {/* Form Fields - Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        
        {/* Provider Select - 4 cols on desktop */}
        <div className="sm:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Nhà cung cấp</label>
          <Select 
            value={provider.provider} 
            onValueChange={(val) => onChange('provider', val)}
          >
            <SelectTrigger className="h-10 bg-background border-input">
              <SelectValue placeholder="Chọn..." />
            </SelectTrigger>
            <SelectContent>
              {aiProviderCategories.map((cat: any) => (
                <SelectItem key={cat.code} value={cat.code}>
                  {cat.nameVi || cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Combobox - 5 cols on desktop */}
        <div className="sm:col-span-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground">Tên Model</label>
            <button
              type="button"
              onClick={handleFetchModels}
              disabled={isFetching[provider.id]}
              className="text-[10px] flex items-center text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isFetching[provider.id] ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
          <Combobox
            value={provider.model}
            onValueChange={(val) => onChange('model', val || '')}
          >
            <ComboboxInput
              placeholder="Nhập hoặc chọn model..."
              className="h-10 bg-background border-input"
              onChange={(e: any) => onChange('model', e.target.value)}
            />
            <ComboboxContent>
              <ComboboxList>
                {currentModels.map((m: any) => {
                  const mId = typeof m === 'string' ? m : m.id;
                  const mName = typeof m === 'string' ? m : m.name;
                  return (
                    <ComboboxItem key={mId} value={mId}>
                      <span className="truncate">{mName}</span>
                    </ComboboxItem>
                  );
                })}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Priority - 3 cols on desktop */}
        <div className="sm:col-span-3 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Độ ưu tiên</label>
          <Input
            type="number"
            className="h-10 bg-background border-input font-mono"
            value={provider.priority}
            onChange={(e) => onChange('priority', parseInt(e.target.value) || 1)}
            min="1"
            title="Số nhỏ hơn sẽ được ưu tiên gọi trước"
          />
        </div>

        {/* API Key - 12 cols (Full width) */}
        <div className="sm:col-span-12 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">API Key</label>
          <Input
            type="password"
            className="h-10 bg-background border-input font-mono text-sm tracking-widest"
            value={provider.apiKey}
            onChange={(e) => onChange('apiKey', e.target.value)}
            placeholder="Nhập token bảo mật (sk-...)"
            autoComplete="off"
          />
        </div>
        
      </div>
    </div>
  );
}

