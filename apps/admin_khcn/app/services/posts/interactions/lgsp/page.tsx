"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Send, FileText } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function LgspDocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  // Fetch initial documents when component mounts
  useEffect(() => {
    handleSync();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      // Call API Gateway to sync documents via specific service code
      const response = await axios.get('/api/admin/lgsp/documents/sync?serviceCode=LGSP_QUAN_LY_VAN_BAN');
      if (response.data?.success) {
        setDocuments(response.data.data || []);
        toast.success("Đồng bộ thành công: Đã lấy các văn bản mới nhất từ trục liên thông LGSP.");
      } else {
        toast.error("Lỗi đồng bộ: " + (response.data?.message || "Không thể đồng bộ văn bản."));
      }
    } catch (error: any) {
      toast.error("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setLoading(true);
    try {
      const payload = {
        title: "Văn bản thử nghiệm " + new Date().getTime(),
        content: "Nội dung văn bản thử nghiệm",
        source: "Hệ thống Admin"
      };
      const response = await axios.post('/api/admin/lgsp/documents/send?serviceCode=LGSP_QUAN_LY_VAN_BAN', payload);

      if (response.data?.success) {
        toast.success("Gửi thành công: Văn bản đã được đẩy lên trục LGSP.");
        // Automatically sync to get the latest list
        handleSync();
      } else {
        toast.error("Lỗi gửi văn bản: " + (response.data?.message || "Không thể gửi văn bản."));
      }
    } catch (error: any) {
      toast.error("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Quản lý văn bản liên thông (LGSP)</h1>
          <p className="text-gray-500">Giao tiếp, nhận và gửi văn bản qua trục liên thông quốc gia.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleSync} disabled={loading} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Đồng bộ văn bản
          </Button>
          <Button onClick={handleSendTest} disabled={loading} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Kiểm tra gửi VB
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <FileText className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <div className="text-sm text-gray-500 mt-1">Nguồn: {doc.source} • Ngày: {doc.date}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                  {doc.status}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
