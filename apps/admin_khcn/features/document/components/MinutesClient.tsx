/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo } from "react";
import {
  Plus, Filter, Eye, Download, Users,
  ClipboardCheck, ArrowLeft, Clock, MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MinutesForm } from "@/features/document/components/MinutesForm";
import { useListMinutes } from "@/features/document/hooks/useDocuments";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseParticipants(raw: any): string[] {
  if (typeof raw !== "string") return [];
  return raw.split(",").map((p) => p.trim()).filter(Boolean);
}

// ─── MinutesRow — memoized, không mutation ────────────────────────────────────

interface MinutesRowProps {
  minutes: any;
}

const MinutesRow = React.memo(function MinutesRow({ minutes: m }: MinutesRowProps) {
  const participants = useMemo(() => parseParticipants(m.participants), [m.participants]);
  const dateStr = m.startTime ? new Date(m.startTime).toLocaleDateString("vi-VN") : "---";
  const timeStr = m.startTime
    ? new Date(m.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : "---";

  return (
    <TableRow className="hover:bg-primary/[0.02] transition-all group cursor-pointer">
      {/* Time + Location */}
      <TableCell className="px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground">{dateStr}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase">
            <Clock className="h-3 w-3" /> {timeStr}
          </span>
          <span className="text-[10px] text-primary/70 flex items-center gap-1 mt-1 font-medium italic">
            <MapPin className="h-3 w-3" /> {m.location || "Chưa xác định"}
          </span>
        </div>
      </TableCell>

      {/* Title + status */}
      <TableCell className="px-6 py-5">
        <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          {m.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shadow-none"
          >
            {m.status === "PUBLISHED" ? "Đã ký phát hành" : "Bản nháp"}
          </Badge>
        </div>
      </TableCell>

      {/* Participants */}
      <TableCell className="px-6 py-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Users className="h-3.5 w-3.5 text-muted-foreground" /> {participants.length} thành viên
          </div>
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((p, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary uppercase"
              >
                {p.charAt(0) || "U"}
              </div>
            ))}
            {participants.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                +{participants.length - 3}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="rounded-full shadow-sm" iconStart={<Eye className="h-4 w-4" />}></Button>
          <Button variant="secondary" size="icon" className="rounded-full shadow-sm" iconStart={<Download className="h-4 w-4" />}></Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

// ─── MinutesTable — presentational ───────────────────────────────────────────

interface MinutesTableProps {
  data: any[];
  isLoading: boolean;
}

const MinutesTable = React.memo(function MinutesTable({ data, isLoading }: MinutesTableProps) {
  return (
    <Card className="border-none shadow-xl shadow-foreground/5 bg-background/60 backdrop-blur-sm rounded-2xl overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground w-48">
                Thời gian / Địa điểm
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                Tiêu đề biên bản
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground w-64">
                Người tham dự
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j} className="px-6 py-5">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-20 text-center text-muted-foreground">
                  Chưa có biên bản nào được ghi nhận.
                </TableCell>
              </TableRow>
            ) : (
              data.map((m: any) => <MinutesRow key={m.id} minutes={m} />)
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      {data.length > 0 && (
        <div className="p-8 text-center bg-muted/5 border-t">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Hiển thị {data.length} biên bản
          </p>
        </div>
      )}
    </Card>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function MinutesClient() {
  const [view, setView] = useState<"LIST" | "CREATE">("LIST");
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const { data: minutesData, isLoading } = useListMinutes({ search: searchTerm });
  const minutes = minutesData?.data ?? [];

  const handleSwitchToCreate = useCallback(() => setView("CREATE"), []);
  const handleSwitchToList = useCallback(() => setView("LIST"), []);

  if (view === "CREATE") {
    return (
      <div className="p-6 bg-muted/5 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={handleSwitchToList} className="mb-6 hover:bg-background" iconStart={<ArrowLeft className="h-4 w-4" />}>Quay lại danh sách</Button>
          <MinutesForm onComplete={handleSwitchToList} onCancel={handleSwitchToList} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-primary" /> Quản lý Biên bản cuộc họp
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Lưu trữ và quản lý diễn biến các cuộc họp, hội thảo tại đơn vị.
          </p>
        </div>
        <Button
          onClick={handleSwitchToCreate}
          className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-xl px-6 transition-all active:scale-95"
         iconStart={<Plus className="h-4 w-4" />}>Tạo biên bản mới</Button>
      </div>

      {/* Filter bar — outside of table, so it doesn't trigger table re-render */}
      <div className="p-5 border rounded-xl bg-background flex flex-wrap gap-3 items-center shadow-sm">
        <Search
          placeholder="Tìm theo tiêu đề, địa điểm, thành phần tham dự..."
          className="flex-1 min-w-[300px]"
        />
        <Button variant="outline" className="h-11 rounded-xl border-dashed border-2 hover:bg-muted/10" iconStart={<Filter className="h-4 w-4" />}>Bộ lọc</Button>
      </div>

      <MinutesTable data={minutes} isLoading={isLoading} />
    </div>
  );
}
