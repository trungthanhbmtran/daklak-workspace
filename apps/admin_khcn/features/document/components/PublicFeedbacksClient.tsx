"use client";

import React, { useCallback, useState } from "react";
import {
  CheckCircle2, XCircle, Clock, Globe,
  Mail, Phone, User, CheckSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDocuments, usePublicComments } from "@/features/document/hooks/useDocuments";

// ─── Status badge ─────────────────────────────────────────────────────────────

function FeedbackStatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    APPROVED: { icon: <CheckCircle2 className="h-2.5 w-2.5" />, label: "Đã duyệt", cls: "bg-emerald-100 text-emerald-700" },
    REJECTED: { icon: <XCircle className="h-2.5 w-2.5" />, label: "Từ chối", cls: "bg-red-100 text-red-700" },
    PENDING: { icon: <Clock className="h-2.5 w-2.5" />, label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
  };
  const cfg = map[status] ?? map.PENDING;
  return (
    <Badge className={`shadow-none font-bold text-[10px] uppercase px-2 py-0.5 gap-1 ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </Badge>
  );
}

// ─── FeedbackCard — tự xử lý moderate mutation ────────────────────────────────

interface FeedbackCardProps {
  fb: any;
}

const FeedbackCard = React.memo(function FeedbackCard({ fb }: FeedbackCardProps) {
  const { moderateComment, isLoading: isActionLoading } = useDocuments();

  const handleModerate = useCallback(
    async (status: "APPROVED" | "REJECTED" | "PENDING") => {
      try {
        await moderateComment({ id: fb.id, status });
      } catch (err) {
        console.error("Moderation error:", err);
      }
    },
    [fb.id, moderateComment],
  );

  return (
    <div
      className={`p-5 transition-colors ${
        fb.status === "APPROVED" ? "bg-emerald-50/20" :
        fb.status === "REJECTED" ? "bg-red-50/20" :
        "bg-background hover:bg-muted/10"
      }`}
    >
      {/* Header: draft title + status badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Góp ý cho dự thảo:
          </p>
          <h4 className="font-bold text-sm text-foreground">{fb.draftTitle || "Văn bản dự thảo"}</h4>
        </div>
        <FeedbackStatusBadge status={fb.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sender info */}
        <div className="lg:col-span-1 border-r pr-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                {(fb.fullName || "A").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-bold text-foreground">{fb.fullName}</p>
          </div>
          <div className="text-[11px] text-muted-foreground space-y-1.5 pl-10">
            {fb.email && (
              <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{fb.email}</p>
            )}
            {fb.phoneNumber && (
              <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{fb.phoneNumber}</p>
            )}
            <p className="mt-2 text-primary/60 font-bold">
              {new Date(fb.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Content + actions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-muted/30 p-4 rounded-xl border border-muted/50 text-sm text-foreground leading-relaxed italic">
            &ldquo;{fb.content}&rdquo;
          </div>
          <div className="flex items-center gap-2 pt-2">
            {fb.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold text-xs h-9 px-4"
                  onClick={() => handleModerate("APPROVED")}
                  disabled={isActionLoading}
                >
                  <CheckSquare className="h-4 w-4 mr-1.5" /> Phê duyệt cho hiển thị
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-100 hover:bg-red-50 font-bold text-xs h-9 px-4"
                  onClick={() => handleModerate("REJECTED")}
                  disabled={isActionLoading}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Từ chối / Spam
                </Button>
              </>
            )}
            {fb.status !== "PENDING" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-muted-foreground"
                onClick={() => handleModerate("PENDING")}
              >
                Khôi phục trạng thái chờ duyệt
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Root: chỉ fetch + filter state ──────────────────────────────────────────

export function PublicFeedbacksClient() {
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");

  const { data: comments, isLoading } = usePublicComments(undefined, filterStatus);

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Duyệt Góp ý Công chúng
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kiểm duyệt và phê duyệt ý kiến đóng góp từ người dân, doanh nghiệp.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        {/* Filter bar */}
        <div className="p-4 border-b bg-background flex flex-wrap gap-3 items-center rounded-t-xl">
          <div className="relative flex-1 min-w-[280px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên người gửi, nội dung..." className="pl-9 h-10 bg-muted/20" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] h-10 font-medium">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ kiểm duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt (Hiện trên web)</SelectItem>
              <SelectItem value="REJECTED">Từ chối / Spam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ))
            ) : !comments?.length ? (
              <div className="py-20 text-center text-muted-foreground">Không có góp ý nào.</div>
            ) : (
              comments.map((fb: any) => (
                <FeedbackCard key={fb.id} fb={fb} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
