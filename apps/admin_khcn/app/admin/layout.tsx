import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-slate-50/50 p-4 md:p-8">
      <div className="shrink-0 mb-6">
        <Link href="/hub" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Hub
        </Link>
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
