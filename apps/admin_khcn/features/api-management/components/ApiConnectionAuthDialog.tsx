'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Loader2 } from 'lucide-react';
import { useUpdateConnection } from '../hooks/useApiManagement';

interface Props {
  id: string;
  data: any;
}

export default function ApiConnectionAuthDialog({ id, data }: Props) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authKind, setAuthKind] = useState<string>('none');
  const [authSecret, setAuthSecret] = useState<string>('');
  const updateMut = useUpdateConnection();

  useEffect(() => {
    if (data?.auth) {
      setAuthKind(data.auth.kind || 'none');
    }
  }, [data]);

  const handleUpdateAuth = () => {
    if (!data) return;
    updateMut.mutate({
      id,
      data: {
        auth: {
          kind: authKind as any,
          ...(authSecret ? { secret: authSecret } : {})
        },
        expectedVersion: data.version
      }
    }, {
      onSuccess: () => {
        setAuthDialogOpen(false);
        setAuthSecret('');
      }
    });
  };

  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Pencil className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thay đổi thông tin xác thực</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Loại xác thực</Label>
            <Select value={authKind} onValueChange={setAuthKind}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại xác thực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không xác thực (None)</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="apiKey">API Key (Header)</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="mtls">mTLS (Chứng thư số)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {authKind !== 'none' && (
            <div className="grid gap-2">
              <Label>Secret / Token / API Key</Label>
              <Input 
                type="password" 
                value={authSecret} 
                onChange={e => setAuthSecret(e.target.value)} 
                placeholder={data.auth?.secretRef ? "(Đã thiết lập - nhập để thay đổi)" : "Nhập secret key..."} 
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAuthDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleUpdateAuth} disabled={updateMut.isPending}>
            {updateMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
