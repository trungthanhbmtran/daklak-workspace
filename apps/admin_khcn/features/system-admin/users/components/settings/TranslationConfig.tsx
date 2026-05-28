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
    <Card className="border-0 shadow-lg bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-800">
          🌐 Cấu hình Dịch thuật Tiêu chuẩn
        </CardTitle>
        <Button onClick={handleSaveTranslation} disabled={updateConfig.isPending} className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-lg px-6 h-11">
          {updateConfig.isPending ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="max-w-md space-y-2">
          <label className="text-sm font-bold text-slate-700">Dịch vụ Dịch thuật mặc định</label>
          <select
            className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-500 outline-none text-sm font-medium"
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
