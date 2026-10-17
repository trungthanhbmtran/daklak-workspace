/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Eye, Plus, Send, Trash2, Building2, User, Calendar,
} from "lucide-react";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDocuments, useListDocuments } from "@/features/document/hooks/useDocuments";
import dynamic from "next/dynamic";

const DocumentUploadModal = dynamic(() => import("@/features/document/components/DocumentUploadModal").then(mod => mod.DocumentUploadModal), {
  ssr: false,
});

const LgspSendModal = dynamic(() => import("@/features/document/components/LgspSendModal").then(mod => mod.LgspSendModal), {
  ssr: false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "---";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "---";
  return date.toLocaleDateString("vi-VN");
}

// ─── DeleteDialog — tự quản lý delete mutation ────────────────────────────────

interface DeleteDialogProps {
  itemId: string | null;
  onClose: () => void;
}

const DeleteDialog = React.memo(function DeleteDialog({ itemId, onClose }: DeleteDialogProps) {
  const { deleteDocument } = useDocuments();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!itemId) return;
    setIsDeleting(true);
    try {
      await deleteDocument(itemId);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  }, [itemId, deleteDocument, onClose]);

  return (
    <AlertDialog open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa văn bản đi</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa văn bản này? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            Xóa văn bản
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

// ─── DocumentRow — memoized ────────────────────────────────────────────────────

interface DocumentRowProps {
  doc: any;
  onDelete: (id: string) => void;
  onSendLgsp: (doc: any) => void;
}

const DocumentRow = React.memo(function DocumentRow({ doc, onDelete, onSendLgsp }: DocumentRowProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(doc.id);
    },
    [doc.id, onDelete],
  );

  return (
    <TableRow className="hover:bg-emerald-500/[0.02] transition-all group cursor-pointer">
      <TableCell className="px-4 py-4 lg:px-6 lg:py-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-black text-foreground tracking-tight">
            {doc.documentNumber || doc.notation}
          </span>
          <Badge variant="secondary" className="text-[10px] font-bold bg-muted/50 text-muted-foreground border-none w-fit">
            {doc.typeName || doc.documentType?.name || "Văn bản"}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4 lg:px-6 lg:py-5 max-w-md">
        <p className="font-bold text-foreground/90 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {doc.abstract || doc.title}
        </p>
      </TableCell>

      <TableCell className="px-4 py-4 lg:px-6 lg:py-5">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="text-xs line-clamp-1">{doc.recipients || "---"}</span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4 lg:px-6 lg:py-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" /> {doc.signerName || "---"}
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(doc.issueDate || doc.createdAt)}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4 lg:px-6 lg:py-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-2 sm:group-hover:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
            title="Gửi liên thông LGSP"
            onClick={(e) => {
              e.stopPropagation();
              onSendLgsp(doc);
            }}
            iconStart={<Send className="h-4 w-4" />}
          />
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-colors"
            iconStart={<Eye className="h-4 w-4" />}
          />
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-xl shadow-sm hover:bg-rose-600 hover:text-white transition-colors"
            onClick={handleDelete}
            iconStart={<Trash2 className="h-4 w-4" />}
          />
        </div>
      </TableCell>
    </TableRow>
  );
});

// ─── DocumentsTable — presentational ─────────────────────────────────────────

interface DocumentsTableProps {
  documents: any[];
  isLoading: boolean;
  error: unknown;
  onDelete: (id: string) => void;
  onSendLgsp: (doc: any) => void;
}

const DocumentsTable = React.memo(function DocumentsTable({
  documents, isLoading, error, onDelete, onSendLgsp,
}: DocumentsTableProps) {
  return (
    <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
      <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
        <Search placeholder="Tìm theo số ký hiệu, trích yếu, nơi nhận..." className="flex-1 min-w-[300px]" />
      </div>

      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <TableHead className="px-4 py-3 lg:px-6 lg:py-4 w-48">Số / Ký hiệu</TableHead>
                <TableHead className="px-4 py-3 lg:px-6 lg:py-4">Trích yếu nội dung</TableHead>
                <TableHead className="px-4 py-3 lg:px-6 lg:py-4 w-64">Nơi nhận</TableHead>
                <TableHead className="px-4 py-3 lg:px-6 lg:py-4 w-48">Người ký & Ngày Ban hành</TableHead>
                <TableHead className="px-4 py-3 lg:px-6 lg:py-4 text-right w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j} className="px-4 py-4 lg:px-6 lg:py-5">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-rose-600 font-bold italic">
                    Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra lại API!
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                    Không có văn bản nào được tìm thấy.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc: any) => (
                  <DocumentRow key={doc.id} doc={doc} onDelete={onDelete} onSendLgsp={onSendLgsp} />
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {documents.length > 0 && (
          <div className="p-6 border-t bg-muted/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Hiển thị {documents.length} văn bản đã phát hành
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ─── Root: fetch + modal/dialog state only ────────────────────────────────────

export function OutgoingDocumentsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [lgspDocToSend, setLgspDocToSend] = useState<any>(null);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const { data: documents = [], isLoading, error } = useListDocuments({
    search: searchTerm,
    isIncoming: false,
  });

  const handleDelete = useCallback((id: string) => setItemToDelete(id), []);
  const handleCloseDelete = useCallback(() => setItemToDelete(null), []);
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleOpenLgspSend = useCallback((doc: any) => setLgspDocToSend(doc), []);
  const handleCloseLgspSend = useCallback(() => setLgspDocToSend(null), []);

  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shadow-xs shrink-0">
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            Sổ Văn bản Đi
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-normal sm:pl-12">
            Quản lý và phát hành các văn bản do Sở ban hành.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenModal}
          className="rounded-xl shadow-xs bg-emerald-600 hover:bg-emerald-700 font-semibold px-4 h-9 text-xs transition-all active:scale-95"
          iconStart={<Plus className="h-3.5 w-3.5" />}>Phát hành văn bản mới</Button>
      </div>

      {/* Table — only re-renders when documents/loading/error changes */}
      <DocumentsTable
        documents={documents}
        isLoading={isLoading}
        error={error}
        onDelete={handleDelete}
        onSendLgsp={handleOpenLgspSend}
      />

      {/* Upload modal */}
      {isModalOpen && (
          <DocumentUploadModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  isIncoming={false}
                />
          )}

      {/* Delete dialog — tự quản lý deleteDocument call */}
      <DeleteDialog itemId={itemToDelete} onClose={handleCloseDelete} />

      {/* LGSP Interoperability Send Modal */}
      <LgspSendModal
        open={Boolean(lgspDocToSend)}
        onOpenChange={(open) => {
          if (!open) handleCloseLgspSend();
        }}
        documentId={lgspDocToSend?.id || null}
        documentNumber={lgspDocToSend?.documentNumber || lgspDocToSend?.notation}
        documentTitle={lgspDocToSend?.abstract || lgspDocToSend?.title}
      />
    </div>
  );
}

