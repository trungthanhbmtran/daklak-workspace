'use client';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { useDeleteEndpoint } from '../hooks/useApiManagement';
import { ApiEndpointEditDialog } from './ApiEndpointEditDialog';

export default function ApiConnectionEndpoints({ connectionId, endpoints }: { connectionId: string, endpoints?: any[] }) {
  const [editingEp, setEditingEp] = useState<any | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const deleteMut = useDeleteEndpoint();

  const handleEdit = (ep: any) => {
    setEditingEp(ep);
    setShowEdit(true);
  };

  const handleAdd = () => {
    setEditingEp(null);
    setShowEdit(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa endpoint này?")) {
      deleteMut.mutate(id);
    }
  };

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-sm">Danh sách Endpoints</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Thêm Endpoint
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints?.map((ep: any) => (
            <TableRow key={ep.id}>
              <TableCell className="font-mono font-medium text-xs">{ep.method}</TableCell>
              <TableCell className="font-mono text-sm">{ep.pathTemplate}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(ep)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(ep.id)}><Trash className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {(!endpoints || endpoints.length === 0) && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                Chưa có endpoint nào được định nghĩa
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ApiEndpointEditDialog 
        open={showEdit} 
        onOpenChange={setShowEdit} 
        connectionId={connectionId} 
        endpoint={editingEp} 
      />
    </div>
  );
}
