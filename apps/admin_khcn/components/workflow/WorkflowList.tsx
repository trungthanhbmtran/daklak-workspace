"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  MoreHorizontal, 
  Play, 
  Edit2, 
  Trash2, 
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  PauseCircle,
  PlayCircle
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { workflowApi, Workflow } from "@/features/workflow/api";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface WorkflowListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}
import { useSearchParams } from "next/navigation";

const WorkflowList = ({ onEdit, onCreate }: WorkflowListProps) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.list();
      setWorkflows(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load workflows:", error);
      toast.error("Không thể tải danh sách quy trình");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await workflowApi.delete(itemToDelete);
      toast.success("Đã xóa quy trình");
      loadWorkflows();
    } catch (error) {
      toast.error("Lỗi khi xóa quy trình");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Quy trình</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Thiết kế và giám sát các quy trình nghiệp vụ tự động trong hệ thống.
          </p>
        </div>
        <Button onClick={onCreate} className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" /> Tạo quy trình mới
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Search placeholder="Tìm kiếm quy trình..." className="flex-1 max-w-sm" />
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-lg py-1 px-3 bg-primary/5 text-primary border-primary/10">
                {workflows.length} Tổng số
            </Badge>
            <Badge variant="outline" className="rounded-lg py-1 px-3 bg-emerald-50 text-emerald-600 border-emerald-100">
                {workflows.filter(w => w.active).length} Đang hoạt động
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[200px] rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
          ))
        ) : filteredWorkflows.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-3">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-muted-foreground/40" />
             </div>
             <h3 className="text-lg font-semibold">Chưa có quy trình nào</h3>
             <p className="text-muted-foreground">Bắt đầu bằng cách tạo quy trình đầu tiên của bạn.</p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div 
              key={workflow.id} 
              className="group relative bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Activity className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-border/60">
                    <DropdownMenuItem onClick={() => onEdit(workflow.id)} className="rounded-lg">
                      <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Play className="mr-2 h-4 w-4" /> Chạy thử
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(workflow.id)}
                      className="text-red-600 focus:text-red-600 rounded-lg"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg leading-none">{workflow.name}</h3>
                    {workflow.active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">
                            Draft
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {workflow.description || "Chưa có mô tả cho quy trình này."}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        <Calendar className="mr-1 h-3 w-3" />
                        {workflow.createdAt ? format(new Date(workflow.createdAt), "dd MMM yyyy", { locale: vi }) : "N/A"}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                        v{workflow.version}.0
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl hover:bg-primary/5 hover:text-primary group/btn"
                    onClick={() => onEdit(workflow.id)}
                >
                    Chi tiết <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa quy trình"
        description="Bạn có chắc chắn muốn xóa quy trình này? Hành động này không thể hoàn tác."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default WorkflowList;
