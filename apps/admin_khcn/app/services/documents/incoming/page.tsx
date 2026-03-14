"use client";

// Removed incompatible dynamic export


import { useState } from "react";
import { Search, Plus, Filter, Eye, Download, Calendar, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentUploadModal } from "@/features/document/components/DocumentUploadModal";

export default function IncomingDocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sổ Văn bản Đến</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các công văn, quyết định tiếp nhận từ các cơ quan khác.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Vào sổ văn bản đến
        </Button>
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm số ký hiệu, trích yếu, cơ quan ban hành..." className="pl-8" />
          </div>
          <Select defaultValue="ALL">
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Loại văn bản" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="CONG_VAN">Công văn</SelectItem>
              <SelectItem value="QUYET_DINH">Quyết định</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Lọc nâng cao</Button>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold w-40">Số / Ký hiệu</th>
                <th className="px-5 py-4 font-semibold">Trích yếu nội dung</th>
                <th className="px-5 py-4 font-semibold w-48">Cơ quan ban hành</th>
                <th className="px-5 py-4 font-semibold w-32">Ngày nhận</th>
                <th className="px-5 py-4 font-semibold text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono font-medium text-primary block">456/UBND-TH</span>
                  <Badge variant="outline" className="mt-1 text-[10px] bg-destructive/10 text-destructive border-destructive/20 shadow-none">Hỏa tốc</Badge>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-foreground line-clamp-2">Công văn đôn đốc thực hiện nhiệm vụ chuyển đổi số quý I năm 2026 trên địa bàn tỉnh.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 shadow-none flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Đã quét OCR</Badge>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium">UBND Tỉnh Đắk Lắk</td>
                <td className="px-5 py-4 text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> 25/02/2026</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Download className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
