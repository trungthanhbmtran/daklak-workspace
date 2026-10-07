'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateConnection } from '../hooks/useApiManagement';
import { Loader2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ApiConnectionCreateDialog() {
  const [open, setOpen] = useState(false);
  const createMut = useCreateConnection();
  
  const [formData, setFormData] = useState<{
    code: string;
    displayName: string;
    baseUrl: string;
    networkZone: 'internal' | 'external';
    timeoutMs: number;
  }>({
    code: '',
    displayName: '',
    baseUrl: '',
    networkZone: 'internal',
    timeoutMs: 5000,
  });

  const handleSubmit = () => {
    createMut.mutate({
      ...formData,
      auth: { kind: 'none' },
      enabled: true,
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ code: '', displayName: '', baseUrl: '', networkZone: 'internal', timeoutMs: 5000 });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Tạo thủ công
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo kết nối API mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Mã kết nối (Code)</Label>
            <Input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              placeholder="VD: GOV_API" 
            />
          </div>
          <div className="grid gap-2">
            <Label>Tên hiển thị</Label>
            <Input 
              value={formData.displayName} 
              onChange={e => setFormData({...formData, displayName: e.target.value})} 
              placeholder="VD: Cổng DVC Quốc Gia" 
            />
          </div>
          <div className="grid gap-2">
            <Label>Base URL</Label>
            <Input 
              value={formData.baseUrl} 
              onChange={e => setFormData({...formData, baseUrl: e.target.value})} 
              placeholder="https://api.example.com" 
            />
          </div>
          <div className="grid gap-2">
            <Label>Vùng mạng</Label>
            <Select value={formData.networkZone} onValueChange={(val: any) => setFormData({...formData, networkZone: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vùng mạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal (Nội bộ)</SelectItem>
                <SelectItem value="external">External (Đối tác)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createMut.isPending || !formData.code || !formData.baseUrl}>
            {createMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Tạo mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
