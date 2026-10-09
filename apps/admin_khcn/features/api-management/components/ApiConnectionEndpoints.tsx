'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ApiConnectionEndpoints({ endpoints }: { endpoints?: any[] }) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead>Path</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints?.map((ep: any) => (
            <TableRow key={ep.id}>
              <TableCell className="font-mono font-medium text-xs">{ep.method}</TableCell>
              <TableCell className="font-mono text-sm">{ep.pathTemplate}</TableCell>
            </TableRow>
          ))}
          {(!endpoints || endpoints.length === 0) && (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                Chưa có endpoint nào được định nghĩa
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
