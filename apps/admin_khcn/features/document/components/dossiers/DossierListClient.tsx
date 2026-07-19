/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  FolderOpen, Search, Filter, Plus,
  Calendar, Clock, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateDossierModal } from "./CreateDossierModal";
import { useDossierList } from "../../hooks/useDocumentFormData";
import { DossierStatusBadge } from "@/components/shared/badges/DocumentBadges";

// ─── DossierCard — memoized ───────────────────────────────────────────────────

interface DossierCardProps {
  hs: any;
}

const DossierCard = React.memo(function DossierCard({ hs }: DossierCardProps) {
  const completeness = hs.completeness || 0;
  const totalRequired = hs.totalRequired || 1;
  const progress = totalRequired > 0 ? Math.round((completeness / totalRequired) * 100) : 0;

  const progressColor =
    progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-blue-500" : "bg-amber-500";

  return (
    <Card className="group border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
      <CardContent className="p-0">
        <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          {/* Left */}
          <div className="flex gap-4 items-start flex-1">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm font-semibold text-muted-foreground">{hs.code}</span>
                <DossierStatusBadge code={hs.status} />
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                {hs.procedureName || "Hồ sơ chưa phân loại"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Người nộp: <span className="font-medium text-foreground">{hs.senderName}</span>
              </p>
            </div>
          </div>

          {/* Right: progress + dates */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tiến độ nộp:</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Nộp: {new Date(hs.receiveDate || hs.createdAt).toLocaleDateString("vi-VN")}
              </div>
              <div className="flex items-center gap-1 text-rose-500 font-medium">
                <Clock className="h-3 w-3" />
                Hạn: {new Date(hs.dueDate || hs.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Arrow link */}
          <div className="hidden md:flex items-center justify-center pl-4 border-l border-border">
            <Link href={`/services/documents/dossiers/${hs.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function DossierListClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: dossiers = [], isLoading, refetch } = useDossierList();

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleModalChange = useCallback((open: boolean) => setIsModalOpen(open), []);
  const handleSuccess = useCallback(() => refetch(), [refetch]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quản lý Hồ sơ TTHC
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Theo dõi tiến độ, tiếp nhận và yêu cầu bổ sung thành phần hồ sơ.
          </p>
        </div>
        <Button onClick={handleOpenModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Tiếp nhận hồ sơ mới
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã hồ sơ, người nộp..."
            className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="h-4 w-4 mr-2" /> Lọc Trạng thái
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-muted text-foreground hover:bg-muted/80">
            Đang xử lý
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-5 flex gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dossiers.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 bg-muted/30 rounded-xl border border-dashed border-border">
          Chưa có hồ sơ nào được tiếp nhận.
        </p>
      ) : (
        <div className="grid gap-4">
          {dossiers.map((hs: any) => (
            <DossierCard key={hs.id} hs={hs} />
          ))}
        </div>
      )}

      <CreateDossierModal
        open={isModalOpen}
        onOpenChange={handleModalChange}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
