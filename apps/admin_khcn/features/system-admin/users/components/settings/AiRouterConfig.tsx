/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Card className="border border-border shadow-xl bg-card rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Smart AI Router (Hệ thống Định tuyến AI & Dự phòng)
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Cấu hình nhiều LLM. Hệ thống sẽ tự động chuyển sang mô hình có mức ưu tiên thấp hơn nếu mô hình chính bị lỗi.</p>
        </div>
        <Button onClick={handleSaveAiConfigs} disabled={updateConfig.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg px-6 h-11 w-full sm:w-auto">
          {updateConfig.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu cấu hình AI</>}
        </Button>
      </CardHeader>

      <CardContent className="p-6 bg-muted/10">
        {aiProviders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Chưa có Cấu hình AI nào</h3>
            <p className="text-muted-foreground mb-4 text-sm">Hệ thống AI đang tắt. Hãy thêm nhà cung cấp để kích hoạt Smart Router.</p>
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

        <Button onClick={handleAddAiProvider} variant="outline" className="w-full mt-4 h-12 border-dashed border-2 border-input text-muted-foreground font-bold hover:bg-muted hover:border-primary/50 hover:text-primary rounded-xl transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Thêm Cấu hình AI Dự phòng
        </Button>

        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p><strong>Lưu ý về định tuyến:</strong> Hệ thống sẽ gọi API Key theo mức độ ưu tiên (nhỏ đến lớn). Nếu hệ thống gặp mã lỗi HTTP 429 hoặc 401, bộ định tuyến sẽ tự động thử ngay mô hình tiếp theo trong danh sách.</p>
        </div>
      </CardContent>
    </Card>
  );
}
