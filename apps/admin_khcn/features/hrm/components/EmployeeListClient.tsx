"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Building2, Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
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
  const allowedActions: string[] = listRes?.meta?.allowedActions || [];
  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const handleSearch = () => setKeyword(searchInput.trim());

  const handleDelete = async (reason?: string) => {
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
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading level="h2" className="tracking-tight">Danh sách nhân sự</Heading>
          <Text variant="muted" className="mt-1">
            {total > 0 ? `Quản lý ${total} nhân sự trên toàn hệ thống.` : "Dữ liệu từ API HRM (gateway)."}
          </Text>
        </div>
        {allowedActions.includes('CREATE') && (
          <Link href="/services/hrm/employees/create">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6">
              <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-w-0">
        <div className="p-4 md:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo Tên, Email, Mã NV hoặc CCCD..."
              className="pl-10 h-11 bg-background border-input rounded-xl focus-visible:ring-primary"
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
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
                <TableHead className="font-semibold text-muted-foreground h-12">Nhân viên</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Vị trí công việc</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-muted-foreground text-center">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Thao tác</TableHead>
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
                  const fullName = emp.fullName || [emp.firstname, emp.lastname].filter(Boolean).join(" ") || "—";
                  return (
                    <TableRow
                      key={emp.id}
                      className="border-border hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {fullName.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/services/hrm/employees/${emp.id}`}
                              className="font-semibold text-foreground group-hover:text-primary transition-colors"
                            >
                              {fullName} <Text as="span" variant="small" weight="normal" className="text-muted-foreground ml-1">#{emp.employeeCode || emp.id}</Text>
                            </Link>
                            <Text variant="muted">{emp.email || "—"}</Text>
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
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      {govt}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                                      Chưa bổ nhiệm (CQ)
                                    </span>
                                  )}

                                  {party && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                      {party}
                                    </span>
                                  )}
                                </div>
                                {rank && rank !== govt && (
                                  <Text variant="small" className="flex items-center text-muted-foreground font-normal">
                                    Ngạch: <Text as="span" variant="small" weight="medium" className="text-foreground ml-1">{rank}</Text>
                                  </Text>
                                )}
                              </div>
                            );
                          })()}
                          <Text variant="small" className="flex items-center text-muted-foreground font-normal pt-2 mt-1 border-t border-border">
                            <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> {getUnitName(emp)}
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Đang làm việc
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/services/hrm/employees/${emp.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 rounded-full" title="Xem chi tiết">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {allowedActions.includes('EDIT') && (
                            <Link href={`/services/hrm/employees/${emp.id}/edit`}>
                              <Button variant="ghost" size="icon" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 rounded-full" title="Chỉnh sửa">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {allowedActions.includes('DELETE') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(emp.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 rounded-full"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <Text variant="muted">
              Trang {page}/{totalPages} · Tổng {total} nhân viên
            </Text>
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
        requireReason={true}
      />
    </div>
  );
}
