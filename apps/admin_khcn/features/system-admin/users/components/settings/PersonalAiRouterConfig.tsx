/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Activity, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';
import { useGetUserConfigs, useUpdateUserConfig } from '../../hooks/useUserConfigs';
import { toast } from 'sonner';
import { AiProviderConfig } from '../SystemSettingsClient';
import { AiProviderCard } from './AiProviderCard';

export function PersonalAiRouterConfig() {
  const { data: configs = {} } = useGetUserConfigs();
  const updateConfig = useUpdateUserConfig();

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
      });
      toast.success(`Đã cập nhật cấu hình AI cá nhân thành công!`);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi cập nhật cấu hình AI');
    }
  };

  return (
    <Card className="border border-border/60 shadow-xl bg-card rounded-2xl overflow-hidden group/card relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />
      
      <CardHeader className="border-b border-border/50 bg-muted/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
        <div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl text-primary ring-1 ring-primary/20 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            Cấu hình Định tuyến AI Cá nhân
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Hệ thống sẽ ưu tiên dùng các khóa API cá nhân của bạn. Nếu lỗi hoặc không có, hệ thống sẽ tự động chuyển sang dùng cấu hình chung (Fallback).
          </p>
        </div>
        <Button 
          onClick={handleSaveAiConfigs} 
          disabled={updateConfig.isPending} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all px-6 h-11 w-full sm:w-auto font-semibold"
        >
          {updateConfig.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu cấu hình AI</>}
        </Button>
      </CardHeader>

      <CardContent className="p-6 bg-gradient-to-b from-muted/5 to-transparent relative z-10">
        {aiProviders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl bg-card/50 transition-colors hover:bg-card">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 ring-8 ring-muted/20">
              <ShieldCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Chưa có Cấu hình AI nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
              Hệ thống định tuyến AI cá nhân đang tắt. Hãy thêm nhà cung cấp để kích hoạt Smart Router của riêng bạn.
            </p>
            <Button onClick={handleAddAiProvider} variant="default" className="rounded-xl shadow-sm h-11 px-6 font-semibold" iconStart={<Plus className="w-4 h-4 mr-1" />}>
              Thêm cấu hình AI đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {aiProviders.map((provider) => (
              <AiProviderCard
                key={provider.id}
                provider={provider}
                aiProviderCategories={aiProviderCategories}
                onChange={(field, value) => handleProviderChange(provider.id, field, value)}
                onRemove={() => handleRemoveAiProvider(provider.id)}
              />
            ))}
            
            <Button 
              onClick={handleAddAiProvider} 
              variant="outline" 
              className="w-full h-14 border-dashed border-2 border-border/80 text-muted-foreground font-bold hover:bg-primary/5 hover:border-primary/40 hover:text-primary rounded-2xl transition-all shadow-sm" 
              iconStart={<Plus className="w-5 h-5 mr-1" />}
            >
              Thêm Cấu hình AI Dự phòng
            </Button>
          </div>
        )}

        <div className="mt-8 flex items-start gap-4 p-5 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="block text-base mb-1">Lưu ý về định tuyến (Smart Router):</strong> 
            Hệ thống sẽ gọi API Key theo mức độ ưu tiên từ nhỏ đến lớn (1 ưu tiên nhất). Nếu hệ thống gặp lỗi như <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-xs mx-1">429 Too Many Requests</span> hoặc <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-xs mx-1">401 Unauthorized</span>, bộ định tuyến sẽ tự động bỏ qua và thử ngay mô hình tiếp theo trong danh sách mà không làm gián đoạn trải nghiệm của bạn.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
