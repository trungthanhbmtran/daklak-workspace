"use client";

import { useState } from "react";
import {
  Search, Filter, Eye, Clock,
  FileText, User, ChevronRight,
  History, MessageSquare, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function ProcessingDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PROCESSING");

  const { useListDocuments } = useDocuments();
  const { data: documentsData, isLoading } = useListDocuments({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchTerm,
  });

  const docs = documentsData?.data || [];

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" /> Văn bản Đang xử lý
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tiến độ, xử lý nội dung và trình duyệt các văn bản trong quy trình nghiệp vụ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm">
            <History className="h-4 w-4 mr-2" /> Nhật ký xử lý
          </Button>
          <Button className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Tạo dự thảo mới
          </Button>
        </div>
      </div>

      <Card className="border shadow-sm">
        {/* 2. FILTERS */}
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo trích yếu, người xử lý, bước hiện tại..."
              className="pl-9 h-10 bg-muted/20 border-none focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-10 text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" /> Lọc thêm
          </Button>
        </div>

        {/* 3. TABLE */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b font-bold">
              <tr>
                <th className="px-5 py-4 w-40">Thông tin chung</th>
                <th className="px-5 py-4 w-[40%]">Trích yếu nội dung</th>
                <th className="px-5 py-4 w-56">Bước hiện tại & Người xử lý</th>
                <th className="px-5 py-4 w-40">Hạn xử lý</th>
                <th className="px-5 py-4 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">Đang tải dữ liệu...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">Không tìm thấy văn bản nào.</td></tr>
              ) : docs.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-5 py-5">
                    <span className="font-mono font-bold text-primary block text-[13px]">{doc.documentNumber}</span>
                    <Badge variant="outline" className="mt-1.5 text-[10px] bg-muted/50 text-muted-foreground border-none">
                      {doc.type?.name || 'Văn bản'}
                    </Badge>
                  </td>

                  <td className="px-5 py-5">
                    <p className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {doc.urgency === "FLASH" && <span className="text-destructive mr-1">[HỎA TỐC]</span>}
                      {doc.urgency === "URGENT" && <span className="text-amber-600 mr-1">[KHẨN]</span>}
                      {doc.abstract}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> 02 Ý kiến phản hồi
                      </span>
                      {doc.status === "OVERDUE" && (
                        <span className="text-[11px] text-destructive font-bold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Quá hạn
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] shadow-none ${doc.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                            doc.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {doc.status === 'PROCESSING' ? 'Đang xử lý' : doc.status}
                        </Badge>
                      </div>
                      <span className="text-[12px] font-medium text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> {doc.signerName || 'Chưa phân công'}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex flex-col gap-1 text-[13px]">
                      <span className={`font-bold flex items-center gap-1.5 ${doc.status === 'OVERDUE' ? 'text-destructive' : 'text-foreground'}`}>
                        <Clock className="h-3.5 w-3.5" /> {doc.processingDeadline ? new Date(doc.processingDeadline).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Nhận việc: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>

                  <td className="px-5 py-5 text-right">
                    <Link href={`/services/documents/processing/${doc.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
