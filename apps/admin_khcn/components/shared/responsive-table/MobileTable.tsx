import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { ResponsiveTableProps } from './types';

export default function MobileTable<T>({ columns, data, keyExtractor }: ResponsiveTableProps<T>) {
  return (
    <div className="space-y-4">
      {data.map((row, rowIndex) => (
        <Card key={keyExtractor(row)} className="overflow-hidden border shadow-sm">
          <CardContent className="p-4 space-y-3">
            {columns.filter(c => !c.hideOnMobile).map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 border-b last:border-0 pb-2 last:pb-0">
                <Text as="span" variant="small" className="font-medium text-muted-foreground">
                  {col.header}
                </Text>
                <div className="text-sm">
                  {col.cell
                    ? col.cell(row, rowIndex)
                    : col.accessorKey
                    ? String(row[col.accessorKey] ?? '')
                    : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
