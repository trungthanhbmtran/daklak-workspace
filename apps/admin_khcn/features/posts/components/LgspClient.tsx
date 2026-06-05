"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Send, FileText } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export function LgspClient() {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading: loading, refetch: handleSync, isFetching } = useQuery({
    queryKey: ['lgsp-documents'],
    queryFn: async () => {
      const res = await axios.get("/api/admin/integrations/documents/sync", {
        params: { serviceCode: "LGSP_QUAN_LY_VAN_BAN" }
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
      const response = await axios.post("/api/admin/integrations/documents/send", payload, {
        params: { serviceCode: "LGSP_QUAN_LY_VAN_BAN" }
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Không thể gửi văn bản.");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Gửi thành công: Văn bản đã được đẩy lên trục LGSP.");
      queryClient.invalidateQueries({ queryKey: ['lgsp-documents'] });
    },
    onError: (error: any) => {
      toast.error("Lỗi gửi văn bản: " + error.message);
    }
  });

  const handleSendTest = () => {
    const payload = {
      title: "Văn bản thử nghiệm " + new Date().getTime(),
      content: "Nội dung văn bản thử nghiệm",
      source: "Hệ thống Admin"
    };
    sendMutation.mutate(payload);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Quản lý văn bản liên thông (LGSP)</h1>
          <p className="text-gray-500">Giao tiếp, nhận và gửi văn bản qua trục liên thông quốc gia.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => { toast.success("Đang đồng bộ..."); handleSync(); }} disabled={isFetching} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Đồng bộ văn bản
          </Button>
          <Button onClick={handleSendTest} disabled={sendMutation.isPending} className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Kiểm tra gửi VB
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {documents.map((doc: any) => (
          <Card key={doc.id}>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg"><FileText className="text-orange-600 w-5 h-5" /></div>
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <div className="text-sm text-gray-500 mt-1">Nguồn: {doc.source} • Ngày: {doc.date}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{doc.status}</div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
