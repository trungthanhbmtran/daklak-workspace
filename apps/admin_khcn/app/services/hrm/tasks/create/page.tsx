"use client";

import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Giao việc mới</h2>
              <p className="text-sm text-slate-500 font-medium italic">Tạo và phân công công việc cho nhân sự</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button className="rounded-xl bg-blue-700 hover:bg-blue-800 px-8 h-11 font-bold shadow-lg shadow-blue-200">
              <Save className="mr-2 h-4 w-4" /> GIAO VIỆC
            </Button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-500">
          Form tạo công việc sẽ được thiết kế tại đây.
        </div>
      </div>
    </div>
  );
}
