"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Text } from "@/components/ui/typography";
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveTableProps } from './types';

// Tải lazy (dynamic import) để chỉ load DesktopTable hoặc MobileTable khi thực sự cần
const DesktopTable = dynamic(() => import('./DesktopTable'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-40 bg-muted/20 rounded-md border w-full"></div>
}) as any;

const MobileTable = dynamic(() => import('./MobileTable'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-40 bg-muted/20 rounded-md border w-full"></div>
}) as any;

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Không có dữ liệu",
  loading = false,
  caption,
  footer
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Đảm bảo chỉ render sau khi đã mount trên client để tránh lỗi hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    // Trạng thái chờ khởi tạo hoặc đang tải API
    return (
      <div className="flex flex-col gap-2 w-full p-4 border rounded-md bg-card">
         {[1, 2, 3, 4, 5].map(i => (
           <div key={i} className="animate-pulse h-12 bg-muted/40 rounded-md w-full"></div>
         ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 border rounded-md text-muted-foreground bg-muted/20">
        <Text variant="small">{emptyMessage}</Text>
      </div>
    );
  }

  if (isMobile) {
    return <MobileTable columns={columns} data={data} keyExtractor={keyExtractor} caption={caption} footer={footer} />;
  }

  return <DesktopTable columns={columns} data={data} keyExtractor={keyExtractor} caption={caption} footer={footer} />;
}

export * from './types';
