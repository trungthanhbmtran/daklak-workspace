import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCreateIntegration, useUpdateIntegration, IntegrationConfig } from './api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IntegrationConfig | null;
}

export function IntegrationModal({ isOpen, onClose, initialData }: Props) {
  const [systemName, setSystemName] = useState('');
  const [integrationCode, setIntegrationCode] = useState('');
  const [configData, setConfigData] = useState('{}');

  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSystemName(initialData.systemName);
        setIntegrationCode(initialData.integrationCode);
        setConfigData(initialData.configData || '{}');
      } else {
        setSystemName('');
        setIntegrationCode(`SYS_${Math.floor(Math.random() * 100000)}`);
        setConfigData('{\n  "webhookUrl": "",\n  "secret": ""\n}');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      JSON.parse(configData); // Validate JSON
    } catch (e) {
      toast.error('Cấu hình JSON không hợp lệ');
      return;
    }

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, systemName, integrationCode, configData });
        toast.success('Cập nhật thành công');
      } else {
        await createMutation.mutateAsync({ systemName, integrationCode, configData });
        toast.success('Tạo mới thành công');
      }
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lỗi khi lưu');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Sửa cấu hình liên thông' : 'Tạo mới mã liên thông'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên hệ thống đối tác</label>
            <Input 
              required
              value={systemName} 
              onChange={e => setSystemName(e.target.value)} 
              placeholder="Ví dụ: Trục liên thông quốc gia" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Mã liên thông (Integration Code)</label>
            <Input 
              required
              value={integrationCode} 
              onChange={e => setIntegrationCode(e.target.value)} 
              placeholder="Mã định danh duy nhất" 
              className="font-mono bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Cấu hình JSON (Config)</label>
            <Textarea 
              required
              value={configData} 
              onChange={e => setConfigData(e.target.value)} 
              className="font-mono text-sm h-32 bg-slate-900 text-green-400"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              Lưu cấu hình
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
