"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, FolderKanban } from "lucide-react";
import { hrmPlansApi } from "@/features/hrm/api/plans.api";
import { hrmKeys } from "@/features/hrm/keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MasterPlanCreateEditDialog } from "./MasterPlanCreateEditDialog";
import { format } from "date-fns";
import type { HrmMasterPlan } from "@/features/hrm/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";

export function MasterPlanListClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<HrmMasterPlan | null>(null);

  const { data: plansRes, isLoading } = useQuery({
    queryKey: hrmKeys.masterPlans(),
    queryFn: () => hrmPlansApi.list(),
  });

  const plans = plansRes?.data || [];

  const filteredPlans = plans.filter((p: HrmMasterPlan) => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (plan: HrmMasterPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500 hover:bg-green-600">Hoạt động</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Bản nháp</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Hoàn thành</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-primary" />
              Quản lý Dự án / Kế hoạch
            </CardTitle>
            <CardDescription className="mt-1">
              Khởi tạo và quản lý các dự án, kế hoạch tổng thể. Gắn quy trình động (workflow) cho từng dự án.
            </CardDescription>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo Dự án Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/20">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm dự án..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Tên Dự án / Kế hoạch</TableHead>
                  <TableHead>Mã Workflow</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Không tìm thấy dự án nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan: HrmMasterPlan) => (
                    <TableRow key={plan.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">#{plan.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-primary">{plan.title}</div>
                        {plan.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-md">
                            {plan.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.workflowCode ? (
                          <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {plan.workflowCode}
                          </code>
                        ) : (
                          <Text as="span" variant="small" className="text-muted-foreground italic font-normal">Mặc định</Text>
                        )}
                      </TableCell>
                      <TableCell>{renderStatus(plan.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {plan.createdAt ? format(new Date(plan.createdAt), "dd/MM/yyyy HH:mm") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MasterPlanCreateEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        planToEdit={editingPlan}
      />
    </div>
  );
}
