/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';
import { useGetSystemConfigs, useUpdateSystemConfig } from '../../hooks/useSystemConfigs';
import { toast } from 'sonner';

export function TranslationConfig() {
  const { data: configs = {} } = useGetSystemConfigs();
  const updateConfig = useUpdateSystemConfig();

  const [translateService, setTranslateService] = useState('GOOGLE');

  const { data: translationCategories = [] } = useGetCategoryByGroup("TRANSLATION_SERVICE_TYPE");

  useEffect(() => {
    if (configs['TRANSLATE_SERVICE']) {
      setTranslateService(configs['TRANSLATE_SERVICE']);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs['TRANSLATE_SERVICE']]);

  const handleSaveTranslation = async () => {
    try {
      await updateConfig.mutateAsync({
        key: 'TRANSLATE_SERVICE',
        value: translateService,
        description: 'Dịch vụ dịch thuật'
      });
      toast.success(`Đã cập nhật cấu hình Dịch thuật thành công!`);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi cập nhật cấu hình');
    }
  };

  return (
    <Card className="border border-border shadow-lg bg-card rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
          🌐 Cấu hình Dịch thuật Tiêu chuẩn
        </CardTitle>
        <Button onClick={handleSaveTranslation} disabled={updateConfig.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg px-6 h-11 w-full sm:w-auto">
          {updateConfig.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="max-w-md space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Dịch vụ Dịch thuật mặc định</label>
          <select
            className="w-full h-12 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
            value={translateService}
            onChange={(e) => setTranslateService(e.target.value)}
          >
            {translationCategories.map((cat: any) => (
              <option key={cat.code} value={cat.code}>{cat.nameVi || cat.name}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
