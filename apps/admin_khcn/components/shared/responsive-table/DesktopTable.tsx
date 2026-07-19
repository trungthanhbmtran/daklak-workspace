import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponsiveTableProps } from './types';

export default function DesktopTable<T>({ columns, data, keyExtractor }: ResponsiveTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-md border">
      <Table>
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
            <TableRow key={keyExtractor(row)}>
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
