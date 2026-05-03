"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { PortalMenu } from "@/features/posts/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function PortalMenuPage() {
  const [menus, setMenus] = useState<PortalMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const data = await postsApi.getPortalMenus();
      setMenus(data);
    } catch (error) {
      toast.error("Không thể tải danh sách menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Menu Portal</h1>
        <Button onClick={() => toast.info("Tính năng đang phát triển")}>
          <Plus className="w-4 h-4 mr-2" /> Thêm Menu
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-4">
            {menus.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có menu nào. Hãy thêm menu theo chuẩn Nghị định 42.</p>
            ) : (
              <pre>{JSON.stringify(menus, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
