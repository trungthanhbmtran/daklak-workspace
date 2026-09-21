import { Building2 } from "lucide-react";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground gap-3">
            <div className="p-4 rounded-full bg-muted/50 border border-dashed">
                <Building2 className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div>
                <p className="font-medium text-foreground">Chưa có dữ liệu</p>
                <p className="text-xs mt-1">Nhấn &quot;Thêm gốc&quot; để tạo đơn vị đầu tiên.</p>
            </div>
        </div>
    );
}
