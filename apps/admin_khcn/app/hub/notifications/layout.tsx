import React from 'react';
import { PortalHeader } from '@/features/hub/components/HubClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
      <PortalHeader />
      
      <main className="container mx-auto p-4 md:p-8 max-w-6xl flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="shrink-0 mb-6">
          <Link href="/hub" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Hub
          </Link>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
