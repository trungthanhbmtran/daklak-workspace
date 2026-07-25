import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onOpenModal: () => void;
}

export function DossierHeader({ onOpenModal }: Props) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Quản lý Hồ sơ TTHC
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Theo dõi tiến độ, tiếp nhận và yêu cầu bổ sung thành phần hồ sơ.
        </p>
      </div>
      <Button onClick={onOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground" iconStart={<Plus className="h-4 w-4" />}>Tiếp nhận hồ sơ mới</Button>
    </div>
  );
}
