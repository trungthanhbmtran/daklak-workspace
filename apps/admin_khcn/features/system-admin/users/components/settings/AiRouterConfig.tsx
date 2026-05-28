import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Activity, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';
import { useGetSystemConfigs, useUpdateSystemConfig } from '../../hooks/useSystemConfigs';
import { toast } from 'sonner';
import apiClient from '@/lib/axiosInstance';
import { AiProviderConfig } from '../SystemSettingsClient';

export function AiRouterConfig() {
  const { data: configs = {} } = useGetSystemConfigs();
  const updateConfig = useUpdateSystemConfig();
  
  const [aiProviders, setAiProviders] = useState<AiProviderConfig[]>([]);
  const [fetchedModels, setFetchedModels] = useState<Record<string, string[]>>({});
  const [isFetchingModels, setIsFetchingModels] = useState<Record<string, boolean>>({});

  const { data: aiProviderCategories = [] } = useGetCategoryByGroup("AI_PROVIDER_TYPE");

  useEffect(() => {
    if (configs['AI_PROVIDERS']) {
      try {
        const parsed = JSON.parse(configs['AI_PROVIDERS']);
        setAiProviders(Array.isArray(parsed) ? parsed.sort((a, b) => a.priority - b.priority) : []);
      } catch (e) {
        console.error("Failed to parse AI_PROVIDERS", e);
      }
    }
  }, [configs['AI_PROVIDERS']]);

  const handleAddAiProvider = () => {
    const newId = `ai_${Date.now()}`;
    const newProvider: AiProviderConfig = {
      id: newId,
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: '',
      priority: aiProviders.length + 1,
      enabled: true
    };
    setAiProviders([...aiProviders, newProvider]);
  };

  const handleRemoveAiProvider = (id: string) => {
    setAiProviders(aiProviders.filter(p => p.id !== id));
  };

  const handleProviderChange = (id: string, field: keyof AiProviderConfig, value: any) => {
    setAiProviders(aiProviders.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSaveAiConfigs = async () => {
    const sorted = [...aiProviders].sort((a, b) => a.priority - b.priority);
    try {
      await updateConfig.mutateAsync({
        key: 'AI_PROVIDERS',
        value: JSON.stringify(sorted),
        description: 'Cấu hình AI Đa nền tảng & Cơ chế Failover'
      });
      toast.success(`Đã cập nhật hệ thống định tuyến AI thành công!`);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi cập nhật cấu hình AI');
    }
  };

  const handleFetchModels = async (providerId: string, providerType: string, apiKey: string) => {
    if (!apiKey) {
      toast.error('Vui lòng nhập API Key trước khi tải danh sách Model!');
      return;
    }
    
    setIsFetchingModels(prev => ({ ...prev, [providerId]: true }));
    try {
      const res = await apiClient.post('/ai/models', { provider: providerType, apiKey }) as any;
      if (res.status === 'success') {
        setFetchedModels(prev => ({ ...prev, [providerId]: res.data }));
        toast.success(`Đã tải ${res.data.length} model từ ${providerType}!`);
      } else {
        toast.error(res.message || 'Lỗi tải danh sách Model');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối đến Backend');
    } finally {
      setIsFetchingModels(prev => ({ ...prev, [providerId]: false }));
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Smart AI Router (Hệ thống Định tuyến AI & Dự phòng)
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">Cấu hình nhiều LLM. Hệ thống sẽ tự động chuyển sang mô hình có mức ưu tiên thấp hơn nếu mô hình chính bị lỗi.</p>
        </div>
        <Button onClick={handleSaveAiConfigs} disabled={updateConfig.isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 px-6 h-11">
          {updateConfig.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu cấu hình AI</>}
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 bg-slate-50/50">
        {aiProviders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Chưa có Cấu hình AI nào</h3>
            <p className="text-slate-500 mb-4 text-sm">Hệ thống AI đang tắt. Hãy thêm nhà cung cấp để kích hoạt Smart Router.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiProviders.map((provider) => (
              <div key={provider.id} className={`p-5 bg-white rounded-2xl border ${provider.enabled ? 'border-blue-200 shadow-md shadow-blue-900/5' : 'border-slate-200 opacity-60'} relative transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${provider.enabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      #{provider.priority}
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">Ưu tiên {provider.priority} {provider.enabled ? '' : '(Đã tắt)'}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleProviderChange(provider.id, 'enabled', !provider.enabled)} className={provider.enabled ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'}>
                      {provider.enabled ? 'Đang Bật' : 'Đang Tắt'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAiProvider(provider.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nhà Cung cấp</label>
                    <select 
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700"
                      value={provider.provider}
                      onChange={(e) => handleProviderChange(provider.id, 'provider', e.target.value)}
                    >
                      {aiProviderCategories.length > 0 ? (
                        aiProviderCategories.map((cat: any) => (
                          <option key={cat.code} value={cat.code}>{cat.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="OPENAI">OpenAI (GPT)</option>
                          <option value="GEMINI">Google Gemini</option>
                          <option value="CLAUDE">Anthropic Claude</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Tên Model</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50"
                        onClick={() => handleFetchModels(provider.id, provider.provider, provider.apiKey)}
                        disabled={isFetchingModels[provider.id]}
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isFetchingModels[provider.id] ? 'animate-spin' : ''}`} />
                        Tải danh sách
                      </Button>
                    </label>
                    <Combobox
                      value={provider.model}
                      onValueChange={(val) => handleProviderChange(provider.id, 'model', val || '')}
                    >
                      <ComboboxInput 
                        placeholder="Chọn hoặc nhập model..."
                        className="h-11 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl"
                        onChange={(e: any) => handleProviderChange(provider.id, 'model', e.target.value)}
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {(fetchedModels[provider.id] || (
                            provider.provider === 'OPENAI' ? ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-mini', 'o1-preview'] :
                            provider.provider === 'GEMINI' ? ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.0-pro'] :
                            provider.provider === 'CLAUDE' ? ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] : []
                          )).map((m: string) => (
                            <ComboboxItem key={m} value={m}>{m}</ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mức ưu tiên</label>
                    <input 
                      type="number"
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                      value={provider.priority}
                      onChange={(e) => handleProviderChange(provider.id, 'priority', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">API Key (Token)</label>
                    <input 
                      type="password"
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                      value={provider.apiKey}
                      onChange={(e) => handleProviderChange(provider.id, 'apiKey', e.target.value)}
                      placeholder="Nhập API Key bảo mật..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button onClick={handleAddAiProvider} variant="outline" className="w-full mt-4 h-12 border-dashed border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 rounded-xl transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Thêm Cấu hình AI Dự phòng
        </Button>

        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p><strong>Lưu ý về định tuyến:</strong> Hệ thống sẽ gọi API Key theo mức độ ưu tiên (nhỏ đến lớn). Nếu hệ thống gặp mã lỗi HTTP 429 hoặc 401, bộ định tuyến sẽ tự động thử ngay mô hình tiếp theo trong danh sách.</p>
        </div>
      </CardContent>
    </Card>
  );
}
