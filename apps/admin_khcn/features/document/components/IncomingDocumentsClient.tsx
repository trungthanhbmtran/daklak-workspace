/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Inbox, Plus, FileText, Calendar, Building2, User, Filter, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { useDocuments, useListDocuments } from "@/features/document/hooks/useDocuments";

// Lazy load heavy modals
const DocumentUploadModal = dynamic(
  () => import("@/features/document/components/DocumentUploadModal").then((m) => m.DocumentUploadModal),
  { loading: () => <Skeleton className="h-[600px] w-full rounded-3xl" />, ssr: false },
);

const DocumentDetailModal = dynamic(
  () => import("@/features/document/components/DocumentDetailModal").then((m) => m.DocumentDetailModal),
  { ssr: false },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "---";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "---" : date.toLocaleDateString("vi-VN");
}

// ─── DocumentRow — memoized, shadcn TableRow ───────────────────────────────────

interface DocumentRowProps {
  doc: any;
  onDetail: (id: string) => void;
}

const DocumentRow = React.memo(function DocumentRow({ doc, onDetail }: DocumentRowProps) {
  const handleClick = useCallback(() => onDetail(doc.id), [doc.id, onDetail]);
  const handleBtnClick = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onDetail(doc.id); },
    [doc.id, onDetail],
  );

  return (
    <TableRow className="hover:bg-blue-500/[0.02] transition-all group cursor-pointer" onClick={handleClick}>
      {/* Number + type */}
      <TableCell className="px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-black text-foreground tracking-tight">{doc.documentNumber}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold bg-muted/50 text-muted-foreground border-none">
              {doc.typeName || doc.documentType?.name || "Văn bản"}
            </Badge>
            {doc.urgency === "FLASH" && (
              <Badge className="bg-rose-500 text-white border-none text-[10px] font-black">HỎA TỐC</Badge>
            )}
          </div>
        </div>
      </TableCell>

      {/* Abstract + issuer */}
      <TableCell className="px-8 py-6 max-w-md">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-foreground/90 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {doc.abstract || doc.title || "Không có trích yếu"}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-blue-500" />
              {doc.issuerName || doc.issuingAgency || "Nội bộ"}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Issue date */}
      <TableCell className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {formatDate(doc.issueDate || doc.documentDate)}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Ngày văn bản
          </span>
        </div>
      </TableCell>

      {/* Signer */}
      <TableCell className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {doc.signerName || doc.receiverName || "Chưa bàn giao"}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Người ký/xử lý
          </span>
        </div>
      </TableCell>

      {/* Action */}
      <TableCell className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
            onClick={handleBtnClick}
           iconStart={<FileText className="h-4 w-4" />}></Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function IncomingDocumentsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const { syncOnline } = useDocuments();


  const { data: response, isLoading } = useListDocuments({
    isIncoming: true,
    search: searchTerm.length >= 2 ? searchTerm : undefined,
    pageSize: 50,
  });

  const documents = useMemo(() => response?.data ?? [], [response]);

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedDocId(id);
    setIsDetailOpen(true);
  }, []);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncOnline();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncOnline]);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleCloseDetail = useCallback(() => setIsDetailOpen(false), []);


  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600 shadow-sm">
              <Inbox className="h-8 w-8" />
            </div>
            Sổ Văn bản Đến
          </h2>
          <p className="text-muted-foreground font-medium pl-14">
            Quản lý và theo dõi các văn bản tiếp nhận từ cơ quan bên ngoài.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="rounded-xl border-blue-200 text-blue-600 font-bold px-6 h-12 hover:bg-blue-50 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Đang đồng bộ..." : "Đồng bộ Trục VDX/LGSP"}
          </Button>
          <Button
            onClick={handleOpenModal}
            className="rounded-xl shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 font-bold px-6 h-12 active:scale-95"
           iconStart={<Plus className="h-4 w-4" />}>Vào sổ văn bản đến</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
        <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
          <Search placeholder="Tìm theo số ký hiệu, trích yếu, cơ quan..." className="flex-1 min-w-[300px]" />
          <Button variant="outline" className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10" iconStart={<Filter className="h-4 w-4" />}>Bộ lọc</Button>
        </div>

        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30">
                  <TableHead className="px-8 py-5 w-48">Số / Ký hiệu</TableHead>
                  <TableHead className="px-8 py-5">Trích yếu / Cơ quan ban hành</TableHead>
                  <TableHead className="px-8 py-5 w-40">Ngày ban hành</TableHead>
                  <TableHead className="px-8 py-5 w-48">Người tiếp nhận</TableHead>
                  <TableHead className="px-8 py-5 w-24 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-8 py-6"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full rounded-md" />
                          <Skeleton className="h-3 w-1/2 rounded-md" />
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6"><Skeleton className="h-8 w-32 rounded-lg" /></TableCell>
                      <TableCell className="px-8 py-6 text-right"><Skeleton className="h-9 w-9 rounded-xl ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-medium">
                      Không tìm thấy văn bản nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc: any) => (
                    <DocumentRow key={doc.id} doc={doc} onDetail={handleOpenDetail} />
                  ))
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {isModalOpen && (
        <DocumentUploadModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
      {isDetailOpen && (
        <DocumentDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          documentId={selectedDocId}
        />
      )}
    </div>
  );
}
