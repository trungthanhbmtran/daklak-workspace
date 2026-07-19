"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
} from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Filter, Plus, Clock, FileText, History,
  MessageSquare, ChevronRight,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useListDocuments } from "@/features/document/hooks/useDocuments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PROCESSING: { label: "Đang xử lý", cls: "bg-blue-100 text-blue-700" },
  PENDING_APPROVAL: { label: "Chờ phê duyệt", cls: "bg-amber-100 text-amber-700" },
  OVERDUE: { label: "Quá hạn", cls: "bg-rose-100 text-rose-700" },
};

// ─── ProcessingRow — memoized ─────────────────────────────────────────────────

interface ProcessingRowProps {
  doc: any;
}

const ProcessingRow = React.memo(function ProcessingRow({ doc }: ProcessingRowProps) {
  const status = STATUS_MAP[doc.status] ?? { label: doc.status, cls: "bg-muted text-muted-foreground" };
  const isOverdue = doc.status === "OVERDUE";
  const initial = (doc.signerName?.charAt(0) || "U").toUpperCase();

  return (
    <TableRow className="hover:bg-primary/[0.02] transition-all group cursor-pointer">
      {/* Document number + type */}
      <TableCell className="px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono font-black text-primary text-sm tracking-tight">
            {doc.documentNumber || "DỰ THẢO"}
          </span>
          <Badge variant="outline" className="w-fit bg-muted/50 text-muted-foreground border-none text-[9px] px-1.5 py-0 font-black uppercase tracking-widest">
            {doc.typeName || doc.type?.name || "Văn bản"}
          </Badge>
        </div>
      </TableCell>

      {/* Abstract + urgency */}
      <TableCell className="px-8 py-6">
        <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
          {doc.urgency === "FLASH" && (
            <span className="text-rose-600 font-black mr-2">HỎA TỐC</span>
          )}
          {doc.abstract || doc.title}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> 0 Ý kiến
          </span>
          {isOverdue && (
            <Badge className="bg-rose-500 text-white border-none shadow-none text-[9px] font-black px-1.5 py-0">
              Quá hạn
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Status + handler */}
      <TableCell className="px-8 py-6">
        <div className="flex flex-col gap-2">
          <Badge className={`w-fit text-[9px] font-black uppercase tracking-wider shadow-none px-2 py-0.5 ${status.cls}`}>
            {status.label}
          </Badge>
          <span className="text-sm font-bold text-foreground flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                {initial}
              </AvatarFallback>
            </Avatar>
            {doc.signerName || "Chưa phân công"}
          </span>
        </div>
      </TableCell>

      {/* Deadline */}
      <TableCell className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <span className={`font-black text-sm flex items-center gap-2 ${isOverdue ? "text-rose-600" : "text-foreground"}`}>
            <Clock className="h-4 w-4" />
            {doc.processingDeadline
              ? new Date(doc.processingDeadline).toLocaleDateString("vi-VN")
              : "---"}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
            Bắt đầu: {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </TableCell>

      {/* Action */}
      <TableCell className="px-8 py-6 text-right">
        <Link href={`/services/documents/processing/${doc.id}`}>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-2xl shadow-sm hover:bg-primary hover:text-white transition-all group-hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function ProcessingDocumentsClient() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [statusFilter, setStatusFilter] = useState("PROCESSING");

  const { data: documentsData, isLoading } = useListDocuments({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchTerm,
  });

  const docs = useMemo(() => documentsData?.data ?? [], [documentsData]);

  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-600 shadow-sm">
              <Clock className="h-8 w-8" />
            </div>
            Văn bản Đang xử lý
          </h2>
          <p className="text-muted-foreground font-medium pl-14">
            Theo dõi tiến độ và xử lý các văn bản trong quy trình nghiệp vụ.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl border-muted-foreground/20 font-bold bg-background/50">
            <History className="h-4 w-4 mr-2" /> Nhật ký xử lý
          </Button>
          <Button className="flex-1 md:flex-none h-12 rounded-xl shadow-xl shadow-primary/20 bg-primary font-bold px-6">
            <Plus className="h-4 w-4 mr-2" /> Tạo dự thảo mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
        <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
          <Search placeholder="Tìm theo trích yếu, người xử lý, bước hiện tại..." className="flex-1 min-w-[300px]" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl border-none bg-muted/20 font-bold">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10 font-bold">
            <Filter className="h-4 w-4 mr-2" /> Lọc thêm
          </Button>
        </div>

        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30">
                  <TableHead className="px-8 py-5 w-48">Thông tin chung</TableHead>
                  <TableHead className="px-8 py-5">Trích yếu nội dung</TableHead>
                  <TableHead className="px-8 py-5 w-64">Tiến độ &amp; Người xử lý</TableHead>
                  <TableHead className="px-8 py-5 w-48">Hạn xử lý</TableHead>
                  <TableHead className="px-8 py-5 text-right w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j} className="px-8 py-6"><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : docs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Không có văn bản đang xử lý</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Các văn bản mới sẽ xuất hiện ở đây khi bắt đầu quy trình.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((doc: any) => <ProcessingRow key={doc.id} doc={doc} />)
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
