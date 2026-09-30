"use client";

import { memo } from "react";
import { Building2, Plus, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import Link from "next/link";



interface SidebarHeaderProps {
    onAddRoot: () => void;
}

function SidebarHeaderComponent({ onAddRoot }: SidebarHeaderProps) {
    return (
        <div className="shrink-0 p-4 space-y-4 border-b bg-muted/10">
            <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                    </div>
                    <h2 className="text-sm font-bold text-foreground tracking-tight line-clamp-1">
                        Cơ cấu tổ chức
                    </h2>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 px-0 shrink-0"
                        asChild
                        title="Phân loại chức danh theo Đơn vị"
                    >
                        <Link href="/services/admin/unit-job-templates">
                            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 shrink-0 px-3 shadow-sm bg-primary hover:bg-primary/90"
                        onClick={onAddRoot}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span className="font-medium">Thêm gốc</span>
                    </Button>
                </div>
            </div>

            <Search placeholder="Tìm tên hoặc mã đơn vị..." className="w-full" />
        </div>
    );
}

// onAddRoot được truyền vào qua useCallback nên tham chiếu ổn định giữa
// các lần render => header sẽ không render lại khi cây đơn vị thay đổi.
export const SidebarHeader = memo(SidebarHeaderComponent);