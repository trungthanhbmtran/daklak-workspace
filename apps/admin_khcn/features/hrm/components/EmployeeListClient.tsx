"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, MoreVertical, Building2, Briefcase, Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHrmEmployeesList, useDeleteHrmEmployee } from "@/features/hrm/hooks/useHrmEmployees";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { toast } from "sonner";
import type { HrmEmployee } from "@/features/hrm/types";

function getUnitName(emp: HrmEmployee) {
  return emp.department?.name || "—";
}
function getJobTitleGroups(emp: HrmEmployee) {
  const govt = emp.jobTitle?.name;
  const rank = emp.civilServantRank?.name;
  const party = emp.partyTitle?.name;

  return { govt, rank, party };
}

export function EmployeeListClient() {
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
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const handleSearch = () => setKeyword(searchInput.trim());

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEmployee(deleteId, {
      onSuccess: () => {
        toast.success("Xóa nhân sự thành công");
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Lỗi khi xóa nhân sự");
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách nhân sự</h2>
          <p className="text-sm text-slate-500 mt-1">
            {total > 0 ? `Quản lý ${total} nhân sự trên toàn hệ thống.` : "Dữ liệu từ API HRM (gateway)."}
          </p>
        </div>
        <Link href="/services/hrm/employees/create">
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6">
            <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo Tên, Email, Mã NV hoặc CCCD..."
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch} className="rounded-xl">
            Tìm kiếm
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                <TableHead className="font-semibold text-slate-600 h-12">Nhân viên</TableHead>
                <TableHead className="font-semibold text-slate-600">Vị trí công việc</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-red-600">
                    Lỗi tải dữ liệu. Kiểm tra kết nối API và gateway.
                  </TableCell>
                </TableRow>
              ) : !employees?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                    Không có nhân viên. Thêm nhân sự hoặc thử từ khóa tìm kiếm khác.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp: HrmEmployee) => {
                  const fullName = [emp.firstname, emp.lastname].filter(Boolean).join(" ") || "—";
                  return (
                    <TableRow
                      key={emp.id}
                      className="border-slate-100 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-blue-50 text-blue-700 font-medium">
                              {fullName.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/services/hrm/employees/${emp.id}`}
                              className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors"
                            >
                              {fullName} <span className="text-slate-400 font-normal text-xs ml-1">#{emp.employeeCode || emp.id}</span>
                            </Link>
                            <div className="text-sm text-slate-500">{emp.email || "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          {(() => {
                            const { govt, rank, party } = getJobTitleGroups(emp);
                            return (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {govt ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                                      {govt}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200/60">
                                      Chưa bổ nhiệm (CQ)
                                    </span>
                                  )}

                                  {party && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200/60">
                                      {party}
                                    </span>
                                  )}
                                </div>
                                {rank && rank !== govt && (
                                  <div className="flex items-center text-xs text-slate-500">
                                    Ngạch: <span className="font-medium text-slate-700 ml-1">{rank}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="flex items-center text-xs text-slate-500 pt-2 mt-1 border-t border-slate-100">
                            <Building2 className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {getUnitName(emp)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200/50">
                          Đang làm việc
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/services/hrm/employees/${emp.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full" title="Xem chi tiết">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/services/hrm/employees/${emp.id}/edit`}>
                            <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full" title="Chỉnh sửa">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(emp.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Trang {page}/{totalPages} · Tổng {total} nhân viên
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        description="Thao tác này sẽ xóa hoàn toàn hồ sơ nhân sự khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
      />
    </div>
  );
}
