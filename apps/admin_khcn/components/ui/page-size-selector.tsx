import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageSizeSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  options?: number[];
  label?: string;
}

export function PageSizeSelector({ 
  value, 
  onValueChange, 
  options = [5, 10, 20, 50],
  label = "Số hàng:"
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {label}
        </span>
      )}
      <Select
        value={String(value)}
        onValueChange={(val) => {
          onValueChange(Number(val));
        }}
      >
        <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs font-extrabold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl min-w-[70px]">
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)} className="text-xs font-bold">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
