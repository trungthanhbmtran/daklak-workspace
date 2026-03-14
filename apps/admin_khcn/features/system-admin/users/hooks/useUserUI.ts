import { useState } from "react";
import type { UserItem } from "../types";

export function useUserUI(serverData: UserItem[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const filteredData = serverData.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (item.email ?? "").toLowerCase().includes(term) ||
      (item.username ?? "").toLowerCase().includes(term) ||
      (item.fullName ?? "").toLowerCase().includes(term)
    );
  });

  return {
    state: { searchTerm, isCreateOpen, detailId },
    setters: { setSearchTerm, setIsCreateOpen, setDetailId },
    derived: { filteredData },
  };
}
