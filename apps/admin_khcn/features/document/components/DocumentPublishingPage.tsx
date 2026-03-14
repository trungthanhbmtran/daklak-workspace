"use client";

import { useState } from "react";
import { 
  Globe, Link as LinkIcon, FileText, Calendar, 
  CheckCircle2, Plus, X, Search, FileSignature, Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function DocumentPublishingPage() {
  const [relatedDocs, setRelatedDocs] = useState([
    { id: "rd1", number: "05/2022/QĐ-UBND", relation: "REPLACES", title: "Quy định về quản lý nhiệm vụ khoa học công nghệ cấp tỉnh" }
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Xuất bản Cổng Thông tin
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Cấu hình siêu dữ liệu, hiệu lực pháp lý và liên kết văn bản.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Lưu nháp</Button>
          <Button className="shadow-sm"><CheckCircle2 className="h-4 w-4 mr-2" /> Đăng tải Công khai</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CỘT TRÁI (2/3): Thuộc tính Pháp lý & Móc nối */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/10 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-primary" /> Thông tin Hiệu lực
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Tình trạng hiệu lực <span className="text-destructive">*</span></label>
                  <Select defaultValue="VALID">
                    <SelectTrigger className="font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_YET">Chưa có hiệu lực</SelectItem>
                      <SelectItem value="VALID">Còn hiệu lực toàn bộ</SelectItem>
                      <SelectItem value="PARTIAL">Còn hiệu lực một phần</SelectItem>
                      <SelectItem value="EXPIRED">Hết hiệu lực toàn bộ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Ngày có hiệu lực <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-9" defaultValue="2026-03-01" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QUẢN TRỊ QUAN HỆ VĂN BẢN (Core Feature) */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/10 border-b py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" /> Lược đồ Quan hệ Văn bản
                </CardTitle>
                <CardDescription className="text-xs mt-1">Văn bản này tác động pháp lý đến các văn bản nào khác?</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Thêm liên kết
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Box Tìm kiếm & Thêm mới liên kết */}
              <div className="flex gap-2 p-3 bg-muted/30 border rounded-lg items-center">
                <Select defaultValue="REPLACES">
                  <SelectTrigger className="w-[180px] h-9 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPLACES">Thay thế cho</SelectItem>
                    <SelectItem value="MODIFIES">Sửa đổi, bổ sung cho</SelectItem>
                    <SelectItem value="GUIDES">Hướng dẫn cho</SelectItem>
                    <SelectItem value="CANCELS">Bãi bỏ một phần</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Nhập số ký hiệu văn bản cần liên kết..." className="h-9 pl-8 bg-background" />
                </div>
                <Button size="sm" className="h-9">Thêm</Button>
              </div>

              {/* Danh sách các văn bản đã liên kết */}
              <div className="space-y-2 pt-2">
                {relatedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-start justify-between p-3 border rounded-lg bg-background shadow-sm group">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 shadow-none border-amber-200 mt-0.5">
                        Thay thế cho
                      </Badge>
                      <div>
                        <p className="text-sm font-bold text-primary">{doc.number}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{doc.title}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI (1/3): Phân loại Chuyên đề hiển thị Web */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/10 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Vị trí hiển thị (Portal)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Chuyên trang / Lĩnh vực</label>
                <Select defaultValue="KHCN">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHIDAO">Chỉ đạo - Điều hành</SelectItem>
                    <SelectItem value="KHCN">Quản lý Khoa học - Công nghệ</SelectItem>
                    <SelectItem value="CDS">Chuyển đổi số</SelectItem>
                    <SelectItem value="CCHC">Cải cách hành chính</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">Quyết định văn bản sẽ hiện ở menu nào trên web.</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-muted-foreground">Tùy chọn hiển thị thêm</label>
                <div className="flex items-center gap-2 bg-muted/20 p-2 rounded border">
                  <input type="checkbox" id="feature" className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <label htmlFor="feature" className="text-sm cursor-pointer select-none">Đánh dấu "Văn bản nổi bật" (Trang chủ)</label>
                </div>
                <div className="flex items-center gap-2 bg-muted/20 p-2 rounded border">
                  <input type="checkbox" id="searchable" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <label htmlFor="searchable" className="text-sm cursor-pointer select-none">Cho phép Tìm kiếm toàn văn (Elasticsearch)</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
