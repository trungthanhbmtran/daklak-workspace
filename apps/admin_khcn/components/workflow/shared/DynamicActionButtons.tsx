"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance"; // Giả sử có axios instance tại đây

interface DynamicActionButtonsProps {
  businessId?: string;
  instanceId?: string;
  currentNodeId?: string;
  onActionSuccess?: () => void;
}

export function DynamicActionButtons({
  businessId,
  instanceId,
  currentNodeId,
  onActionSuccess,
}: DynamicActionButtonsProps) {
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);


  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        // Ưu tiên truyền instanceId, nếu không có thì thử theo businessId thông qua BFF
        const params = new URLSearchParams();
        if (instanceId) params.append("instanceId", instanceId);
        if (businessId) params.append("businessId", businessId);
        if (currentNodeId) params.append("currentNodeId", currentNodeId);

        // API Gateway route or direct Workflow Service route
        const res = await apiClient.get(`/workflow/instances/${instanceId || businessId}/allowed-actions?${params.toString()}`);
        if (res.data?.success) {
          setActions(res.data.data?.actions || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải allowed actions", error);
      } finally {
        setLoading(false);
      }
    };

    if (instanceId || businessId) {
      fetchActions();
    }
  }, [instanceId, businessId, currentNodeId]);

  const handleActionClick = async (action: string) => {
    try {
      setSubmitting(action);
      // Gửi action lên Workflow Service (hoặc thông qua BFF)
      const payload = {
        actionData: { action },
      };
      // Giả sử API Gateway /workflow/instances/:instanceId/resume/:nodeId
      const targetNodeId = currentNodeId || 'unknown';
      const res = await apiClient.post(`/workflow/instances/${instanceId}/resume/${targetNodeId}`, payload);
      if (res.data?.success) {
        toast.success(`Đã thực hiện: ${action}`);
        if (onActionSuccess) onActionSuccess();
      } else {
        toast.error(res.data?.message || "Thất bại");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (actions.length === 0) {
    return null; // Không có action nào được phép
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {actions.map((action) => (
        <Button
          key={action}
          variant={
            action.toLowerCase().includes("reject") || action.toLowerCase().includes("huỷ")
              ? "destructive"
              : "default"
          }
          disabled={submitting !== null}
          onClick={() => handleActionClick(action)}
        >
          {submitting === action && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {action}
        </Button>
      ))}
    </div>
  );
}
