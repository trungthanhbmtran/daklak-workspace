/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useListDocuments } from "@/features/document/hooks/useDocuments";

import { ProcessingHeader } from "./processing/ProcessingHeader";
import { ProcessingFilterBar } from "./processing/ProcessingFilterBar";
import { ProcessingRow } from "./processing/ProcessingRow";

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
      <ProcessingHeader />

      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
        <ProcessingFilterBar statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

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
