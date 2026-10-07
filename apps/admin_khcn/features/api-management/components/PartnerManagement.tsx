'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Key, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function PartnerManagement() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  
  const { data: partners, isLoading } = useQuery({
    queryKey: ['api-partners'],
    queryFn: async () => {
      const res = await apiClient.get('/api-management/partners');
      return res.data;
    }
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string, code: string }) => apiClient.post('/api-management/partners', data),
    onSuccess: () => {
      toast.success('Táº¡o Ä‘á»‘i tÃ¡c thÃ nh cÃ´ng');
      qc.invalidateQueries({ queryKey: ['api-partners'] });
      setOpen(false);
    }
  });

  const issueKeyMut = useMutation({
    mutationFn: (partnerId: string) => apiClient.post(`/api-management/partners/${partnerId}/keys`, { name: 'Default Key', scopes: ['*'] }),
    onSuccess: (res) => {
      // Show ONE-TIME key
      alert('ÄÃ‚Y LÃ€ MÃƒ BÃ Máº¬T DUY NHáº¤T. HÃƒY LÆ¯U Láº I VÃŒ NÃ“ Sáº¼ KHÃ”NG BAO GIá»œ HIá»‚N THá»Š Láº I:\n\n' + res.data.oneTimeKey);
      qc.invalidateQueries({ queryKey: ['api-partners'] });
    }
  });

  const revokeKeyMut = useMutation({
    mutationFn: (keyId: string) => apiClient.put(`/api-management/partners/keys/${keyId}/revoke`),
    onSuccess: () => {
      toast.success('ÄÃ£ thu há»“i khÃ³a thÃ nh cÃ´ng');
      qc.invalidateQueries({ queryKey: ['api-partners'] });
    }
  });

  if (isLoading) return <div>Äang táº£i...</div>;

  return (
    <div className="space-y-6 mt-8 border-t pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">TÃ i khoáº£n Äá»‘i TÃ¡c (Inbound)</h2>
          <p className="text-sm text-muted-foreground">Cáº¥p khÃ³a API (API Key) cho cÃ¡c Ä‘á»‘i tÃ¡c truy cáº­p vÃ o há»‡ thá»‘ng</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Táº¡o Ä‘á»‘i tÃ¡c</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Táº¡o Äá»‘i TÃ¡c Má»›i</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="MÃ£ Ä‘á»‹nh danh (vÃ­ dá»¥: VNPOST)" value={code} onChange={e => setCode(e.target.value)} />
              <Input placeholder="TÃªn hiá»ƒn thá»‹" value={name} onChange={e => setName(e.target.value)} />
              <Button onClick={() => createMut.mutate({ name, code })}>XÃ¡c nháº­n</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MÃ£ / TÃªn Ä‘á»‘i tÃ¡c</TableHead>
            <TableHead>KhÃ³a API (API Keys)</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners?.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs font-mono text-slate-500">{p.code}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  {p.keys?.map((k: any) => (
                    <div key={k.id} className="flex items-center gap-2 text-sm">
                      <Key className="w-3 h-3" />
                      <span className="font-mono">{k.keyPrefix}</span>
                      <Badge variant={k.status === 'ACTIVE' ? 'default' : 'destructive'} className="text-[10px]">{k.status}</Badge>
                      {k.status === 'ACTIVE' && (
                        <Button variant="ghost" size="sm" className="h-6 text-red-500 p-1" onClick={() => revokeKeyMut.mutate(k.id)}>
                          <Trash2 className="w-3 h-3" /> Thu há»“i
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-fit h-7 mt-1" onClick={() => issueKeyMut.mutate(p.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Cáº¥p khÃ³a má»›i
                  </Button>
                </div>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
