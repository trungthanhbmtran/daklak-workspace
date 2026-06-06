import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';
import { useGetSystemConfigs, useUpdateSystemConfig } from '../../hooks/useSystemConfigs';
import { toast } from 'sonner';
import { AiProviderConfig } from '../SystemSettingsClient';
import { AiProviderCard } from './AiProviderCard';

export function AiRouterConfig() {
  const { data: configs = {} } = useGetSystemConfigs();
  const updateConfig = useUpdateSystemConfig();

  const [aiProviders, setAiProviders] = useState<AiProviderConfig[]>([]);

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

  return (
    <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
      <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50 to-indigo-50/30 p-6 flex flex-row items-center justify-between">
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
              <AiProviderCard
                key={provider.id}
                provider={provider}
                aiProviderCategories={aiProviderCategories}
                onChange={(field, value) => handleProviderChange(provider.id, field, value)}
                onRemove={() => handleRemoveAiProvider(provider.id)}
              />
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
