'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadImport, useCommitImport } from '../hooks/useApiManagement';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function ApiImportWizard({ targetConnectionId, onComplete }: { targetConnectionId?: string; onComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const uploadMut = useUploadImport();
  const commitMut = useCommitImport();

  const [session, setSession] = useState<any>(null);
  const [resolutions, setResolutions] = useState<Record<string, 'OVERWRITE'|'SKIP'>>({});

  const handleUpload = () => {
    if (!file) return;
    uploadMut.mutate({ file, targetConnectionId }, {
      onSuccess: (data) => {
        setSession(data);
        // Default all to OVERWRITE
        const initialRes: any = {};
        data.diffs?.forEach((d: any) => {
          initialRes[`${d.method}:${d.path}`] = 'OVERWRITE';
        });
        setResolutions(initialRes);
      }
    });
  };

  const handleCommit = () => {
    if (!session) return;
    const resArray = Object.keys(resolutions).map(key => {
      const [method, path] = key.split(':');
      return { method, path, action: resolutions[key] };
    });
    
    commitMut.mutate({ sessionId: session.sessionId, resolutions: resArray }, {
      onSuccess: () => {
        setOpen(false);
        setSession(null);
        setFile(null);
        if (onComplete) onComplete();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UploadCloud className="w-4 h-4" /> Import Swagger / OpenAPI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Cấu hình API (Swagger/OpenAPI)</DialogTitle>
        </DialogHeader>

        {!session ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>File cấu hình (.json, .yaml)</Label>
              <Input type="file" accept=".json,.yaml,.yml" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={handleUpload} disabled={!file || uploadMut.isPending}>
              {uploadMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tải lên và Phân tích
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 p-3 text-sm text-amber-800 bg-amber-50 rounded-md">
              <AlertCircle className="w-4 h-4" />
              Vui lòng xem lại danh sách Endpoint trước khi ghi đè vào hệ thống.
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.diffs?.map((diff: any, idx: number) => {
                  const key = `${diff.method}:${diff.path}`;
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs uppercase">{diff.method}</TableCell>
                      <TableCell className="font-mono text-xs">{diff.path}</TableCell>
                      <TableCell>
                        {diff.status === 'CONFLICT' ? (
                          <Badge variant="destructive">Trùng lặp</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">Thêm mới</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={resolutions[key]} 
                          onValueChange={(val: any) => setResolutions(p => ({...p, [key]: val}))}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OVERWRITE">Ghi đè/Thêm</SelectItem>
                            <SelectItem value="SKIP">Bỏ qua</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSession(null)}>Hủy bỏ</Button>
              <Button onClick={handleCommit} disabled={commitMut.isPending}>
                {commitMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Xác nhận Import
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
