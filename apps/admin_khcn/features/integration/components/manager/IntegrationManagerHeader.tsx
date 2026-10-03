import React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImportApiDialog } from "../import/ImportApiDialog";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  onOpenCreate: () => void;
}

export const IntegrationManagerHeader = ({ search, setSearch, onOpenCreate }: Props) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Cấu hình Tích hợp
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Quản lý và giám sát các luồng dữ liệu API đầu vào.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-4 z-10">
        <div className="w-full sm:w-72 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <Input
              placeholder="Tìm kiếm API..."
              className="pl-11 h-12 rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm focus-visible:ring-violet-500/30 transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={onOpenCreate}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 transform hover:-translate-y-0.5 border-0 font-semibold"
            iconStart={<Plus className="w-5 h-5 mr-1" />}
          >
            Thêm API
          </Button>
        </div>
      </div>
    </div>
  );
};
