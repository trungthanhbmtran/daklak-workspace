import React, { memo } from "react";
import { Trash2, Loader2, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParsedEndpoint, getMethodColor } from "../EndpointTypes";

interface EndpointHeaderProps {
  selectedEndpoint: ParsedEndpoint;
  onChange: (field: keyof ParsedEndpoint, value: any) => void;
  onDelete: () => void;
  onTest?: () => void;
  isTesting?: boolean;
  baseUrl?: string;
}

export const EndpointHeader = memo(({
  selectedEndpoint,
  onChange,
  onDelete,
  onTest,
  isTesting,
  baseUrl
}: EndpointHeaderProps) => {
  return (
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={selectedEndpoint.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="font-bold text-lg text-slate-800 dark:text-slate-100 h-auto py-1.5 px-2 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus-visible:ring-1 flex-1 min-w-0"
          placeholder="Tên API..."
        />
        <div className="flex gap-1 shrink-0">
          {onTest && (
            <Button variant="outline" size="sm" onClick={onTest} disabled={isTesting} className="text-violet-600 border-violet-200 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-900/30 shrink-0 h-8" title="Test API">
              {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />} Test
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0 h-8 w-8" title="Xóa Endpoint này">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Input
        value={selectedEndpoint.description || ""}
        onChange={(e) => onChange('description', e.target.value)}
        className="text-sm text-slate-500 h-auto py-1 px-2 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus-visible:ring-1 w-full"
        placeholder="Mô tả API..."
      />
      <div className="flex items-center gap-0 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Select
          value={selectedEndpoint.method}
          onValueChange={(val) => onChange('method', val)}
        >
          <SelectTrigger className={`w-[100px] h-10 text-sm font-bold border-0 bg-transparent rounded-none focus:ring-0 ${getMethodColor(selectedEndpoint.method)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 flex items-center bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 px-3 min-w-0 h-10">
          {baseUrl && (
            <span className="text-sm text-slate-500 shrink-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={baseUrl}>
              {baseUrl}
            </span>
          )}
          <Input
            value={selectedEndpoint.path}
            onChange={(e) => onChange('path', e.target.value)}
            placeholder="/api/v1/..."
            className="font-mono text-sm h-full bg-transparent border-0 focus-visible:ring-0 px-1 min-w-0 w-full"
          />
        </div>
      </div>
    </div>
  );
});

EndpointHeader.displayName = "EndpointHeader";
