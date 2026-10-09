'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateConnection } from '../hooks/useApiManagement';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiConnection } from '../api';

interface Props {
  connection: ApiConnection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiConnectionEditDialog({ connection, open, onOpenChange }: Props) {
  const updateMut = useUpdateConnection();
  
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

  useEffect(() => {
    if (connection) {
      setFormData({
        code: connection.code || '',
        displayName: connection.displayName || '',
        baseUrl: connection.baseUrl || '',
        networkZone: connection.networkZone || 'internal',
        timeoutMs: connection.timeoutMs || 5000,
      });
    }
  }, [connection, open]);

  const handleSubmit = () => {
    updateMut.mutate({
      id: connection.id,
      data: {
        ...formData,
        expectedVersion: connection.version
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa kết nối API</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Mã kết nối (Code)</Label>
            <Input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              placeholder="VD: GOV_API" 
              disabled // usually code shouldn't be easily changed, but we can allow it or just leave as is
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
          <div className="grid gap-2">
            <Label>Timeout (ms)</Label>
            <Input 
              type="number"
              value={formData.timeoutMs} 
              onChange={e => setFormData({...formData, timeoutMs: parseInt(e.target.value)})} 
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updateMut.isPending || !formData.displayName || !formData.baseUrl}>
            {updateMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Cập nhật
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
