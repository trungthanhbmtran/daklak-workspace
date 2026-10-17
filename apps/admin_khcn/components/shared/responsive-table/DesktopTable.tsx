import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ResponsiveTableProps } from './types';

export default function DesktopTable<T>({ columns, data, keyExtractor, caption, footer, className, tableClassName }: ResponsiveTableProps<T>) {
  return (
    <div className={cn("w-full min-w-0 overflow-x-auto custom-scrollbar", className)}>
      <Table className={cn("w-full min-w-[640px]", tableClassName)}>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow className="bg-muted/30">
            {columns.map((col, index) => (
              <TableHead key={index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={keyExtractor(row, rowIndex)}>
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className={col.className}>
                  {col.cell
                    ? col.cell(row, rowIndex)
                    : col.accessorKey
                    ? String(row[col.accessorKey] ?? '')
                    : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
