"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Send, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export function LgspClient() {
  const queryClient = useQueryClient();

  const {
    data: documents = [],
    isLoading: loading,
    refetch: handleSync,
    isFetching,
  } = useQuery({
    queryKey: ["lgsp-documents"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/integrations/documents/sync", {
        params: { serviceCode: "LGSP_QUAN_LY_VAN_BAN" },
      });
      if (res.data?.success) {
        return res.data.data || [];
      }
      throw new Error(res.data?.message || "Không thể đồng bộ văn bản.");
    },
    staleTime: 60_000,
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await axios.post(
        "/api/admin/integrations/documents/send",
        payload,
        { params: { serviceCode: "LGSP_QUAN_LY_VAN_BAN" } }
      );
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Không thể gửi văn bản.");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Gửi thành công: Văn bản đã được đẩy lên trục LGSP.");
      queryClient.invalidateQueries({ queryKey: ["lgsp-documents"] });
    },
    onError: (error: any) => {
      toast.error("Lỗi gửi văn bản: " + error.message);
    },
  });

  const handleSendTest = () => {
    sendMutation.mutate({
      title: "Văn bản thử nghiệm " + new Date().getTime(),
      content: "Nội dung văn bản thử nghiệm",
      source: "Hệ thống Admin",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "SENT":
        return { label: "Đã gửi", icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "FAILED":
      case "ERROR":
        return { label: "Lỗi", icon: <XCircle className="w-3.5 h-3.5" />, className: "bg-red-100 text-red-700 border-red-200" };
      default:
        return { label: status || "Chờ", icon: null, className: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý văn bản liên thông (LGSP)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Giao tiếp, nhận và gửi văn bản qua trục liên thông quốc gia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => { toast.info("Đang đồng bộ..."); handleSync(); }}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Đồng bộ văn bản
          </Button>
          <Button
            disabled={sendMutation.isPending}
            onClick={handleSendTest}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Kiểm tra gửi VB
          </Button>
        </div>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-16 gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <FileText className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Chưa có văn bản nào. Nhấn "Đồng bộ văn bản" để tải về.
              </p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc: any) => {
            const statusCfg = getStatusConfig(doc.status);
            return (
              <Card key={doc.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-lg shrink-0">
                        <FileText className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold line-clamp-1">{doc.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Nguồn: {doc.source} &bull; Ngày: {doc.date}
                        </p>
                      </div>
                    </div>
                    <Badge className={`shrink-0 gap-1 ${statusCfg.className}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
