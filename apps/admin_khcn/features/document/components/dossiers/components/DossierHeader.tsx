import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onOpenModal: () => void;
}

export function DossierHeader({ onOpenModal }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Quản lý Hồ sơ TTHC
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Theo dõi tiến độ, tiếp nhận và yêu cầu bổ sung thành phần hồ sơ.
        </p>
      </div>
      <Button size="sm" onClick={onOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-xs" iconStart={<Plus className="h-3.5 w-3.5" />}>Tiếp nhận hồ sơ mới</Button>
    </div>
  );
}
