'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

export const PortalPageBuilderClient = dynamic(
  () => import("@/features/portal-config").then(mod => mod.PortalPageBuilderClient),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) 
  }
);
