"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";

interface WorkflowBinding {
  id: string;
  entityType: string;
  eventTrigger: string;
  workflowDefinitionId: string;
  isActive: boolean;
  createdAt: string;
}

export default function WorkflowBindingList() {
  const [bindings, setBindings] = useState<WorkflowBinding[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchBindings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/workflow/processes/bindings"); // Cần map vào api-gateway
      if (res.data?.success) {
        setBindings(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải danh sách binding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBindings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá thiết lập này?")) return;
    try {
      // API có thể cần bổ sung method DELETE
      const res = await apiClient.delete(`/workflow/processes/bindings/${id}`);
      if (res.data?.success) {
        toast.success("Đã xoá thiết lập quy trình");
        fetchBindings();
      }
    } catch (error: any) {
      toast.error(error?.message || "Xóa thất bại");
    }
  };

  return (
    <Card className="shadow-none border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <LinkIcon className="h-6 w-6" /> Tự động áp dụng quy trình (Auto-Binding)
          </CardTitle>
          <CardDescription>
            Cấu hình No-Code: Khi một đối tượng nghiệp vụ phát sinh sự kiện, hệ thống sẽ tự động chạy quy trình tương ứng.
          </CardDescription>
        </div>
        <Button onClick={() => alert("Mở Modal tạo Binding ở đây")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm cấu hình
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Đang tải...</p>
        ) : bindings.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50/50">
            <p className="text-gray-500">Chưa có thiết lập tự động nào.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Đối tượng (Entity)</th>
                  <th className="px-4 py-3 font-medium">Sự kiện (Trigger)</th>
                  <th className="px-4 py-3 font-medium">Quy trình (Workflow ID)</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bindings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/30">
                    <td className="px-4 py-3 font-medium">{b.entityType}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {b.eventTrigger}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]" title={b.workflowDefinitionId}>
                      {b.workflowDefinitionId}
                    </td>
                    <td className="px-4 py-3">
                      {b.isActive ? (
                        <span className="text-green-600 font-medium">Đang hoạt động</span>
                      ) : (
                        <span className="text-gray-400 font-medium">Tạm dừng</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
