import React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostmanImportButton } from "../PostmanImportButton";
import { SwaggerImportButton } from "../SwaggerImportButton";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  onOpenCreate: () => void;
  onImportSuccess: (initialData: any) => void;
}

export const IntegrationManagerHeader = ({ search, setSearch, onOpenCreate, onImportSuccess }: Props) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex-1 w-full md:max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Tìm kiếm API tích hợp..."
          className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <PostmanImportButton onSuccess={onImportSuccess} />
        <SwaggerImportButton onSuccess={onImportSuccess} />
        <Button
          onClick={onOpenCreate}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 px-6 h-10"
         iconStart={<Plus className="w-4 h-4" />}>Thêm API Đầu Vào</Button>
      </div>
    </div>
  );
};
