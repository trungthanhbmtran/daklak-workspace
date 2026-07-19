import { useState } from "react";
import { toast } from "sonner";
import { useHrmEmployeesList, useDeleteHrmEmployee } from "@/features/hrm/hooks/useHrmEmployees";
import type { HrmEmployee } from "@/features/hrm/types";

export function useEmployeeListClient() {
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteHrmEmployee();

  const { data: listRes, isLoading, isError } = useHrmEmployeesList({
    page,
    pageSize,
    keyword: keyword || undefined,
  });

  const employees = listRes?.data;
  const pagination = listRes?.meta?.pagination;
  const allowedActions: string[] = listRes?.meta?.allowedActions || [];
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const handleSearch = () => setKeyword(searchInput.trim());

  // eslint-disable-next-line unused-imports/no-unused-vars
  const handleDelete = async (reason?: string) => {
    if (!deleteId) return;
    deleteEmployee(deleteId, {
      onSuccess: () => {
        toast.success("Xóa nhân sự thành công");
        setDeleteId(null);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || "Lỗi khi xóa nhân sự";
        toast.error(message);
        setDeleteId(null);
      }
    });
  };

  return {
    searchInput,
    setSearchInput,
    page,
    setPage,
    deleteId,
    setDeleteId,
    employees,
    total,
    totalPages,
    isLoading,
    isError,
    allowedActions,
    handleSearch,
    handleDelete,
    isDeleting,
  };
}

export function getUnitName(emp: HrmEmployee) {
  return emp.department?.name || "—";
}

export function getJobTitleGroups(emp: HrmEmployee) {
  const govt = emp.jobTitle?.name;
  const rank = emp.civilServantRank?.name;
  const party = emp.partyTitle?.name;

  return { govt, rank, party };
}
