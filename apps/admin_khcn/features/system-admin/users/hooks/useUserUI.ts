import { useState } from "react";
import { useSearchParams } from "next/navigation";
export function useUserUI() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  return {
    state: { searchTerm, isCreateOpen, detailId },
    setters: { setIsCreateOpen, setDetailId },
  };
}
