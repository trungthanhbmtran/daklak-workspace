"use client";

import React, { useCallback, useState } from "react";
import {
  CheckCircle2, XCircle, Clock, MessageSquare,
  Mail, Phone, Calendar, MoreHorizontal, Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDocuments, usePublicComments } from "../hooks/useDocuments";

// ─── Pure UI ──────────────────────────────────────────────────────────────────

function CommentStatusBadge({ status }: { status: string }) {
  const config = {
    APPROVED: { label: "Đã duyệt", icon: <CheckCircle2 className="h-2.5 w-2.5" />, className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
    REJECTED: { label: "Từ chối", icon: <XCircle className="h-2.5 w-2.5" />, className: "bg-red-100 text-red-700 hover:bg-red-100" },
  }[status] ?? { label: "Chờ duyệt", icon: <Clock className="h-2.5 w-2.5" />, className: "bg-amber-100 text-amber-700 hover:bg-amber-100" };

  return (
    <Badge className={`font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 gap-1 ${config.className}`}>
      {config.icon}{config.label}
    </Badge>
  );
}

// ─── CommentCard — tự quản lý moderate mutation riêng ─────────────────────────

interface CommentCardProps {
  comment: any;
}

const CommentCard = React.memo(function CommentCard({ comment }: CommentCardProps) {
  const { moderateComment } = useDocuments();

  const handleModerate = useCallback(
    async (status: "APPROVED" | "REJECTED") => {
      try {
        await moderateComment({ id: comment.id, status });
      } catch (err) {
        console.error("Moderation error:", err);
      }
    },
    [comment.id, moderateComment],
  );

  return (
    <Card
      className={`border-none shadow-sm transition-all hover:shadow-md ${
        comment.status === "APPROVED" ? "bg-emerald-50/30" :
        comment.status === "REJECTED" ? "bg-red-50/30" : "bg-background"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Left: author info + content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">
                  {(comment.fullName || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm">{comment.fullName}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                  {comment.email && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />{comment.email}
                    </span>
                  )}
                  {comment.phoneNumber && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />{comment.phoneNumber}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(comment.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed border border-muted/50 italic text-foreground/80">
              "{comment.content}"
            </div>
          </div>

          {/* Right: status + actions */}
          <div className="flex flex-row md:flex-col justify-between items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <CommentStatusBadge status={comment.status} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl shadow-xl">
                  <DropdownMenuItem
                    className="rounded-lg text-xs font-bold py-2 gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                    onClick={() => handleModerate("APPROVED")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Chấp nhận góp ý
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg text-xs font-bold py-2 gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                    onClick={() => handleModerate("REJECTED")}
                  >
                    <XCircle className="h-4 w-4" /> Từ chối góp ý
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg text-xs font-bold py-2 gap-2 cursor-pointer">
                    <Eye className="h-4 w-4" /> Xem chi tiết hồ sơ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {comment.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleModerate("REJECTED")}
                >
                  Từ chối
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleModerate("APPROVED")}
                >
                  Phê duyệt
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Root: chỉ fetch + filter state ──────────────────────────────────────────

interface PublicCommentModerationProps {
  consultationId: string;
}

export const PublicCommentModeration = React.memo(function PublicCommentModeration({
  consultationId,
}: PublicCommentModerationProps) {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const { data: comments, isLoading } = usePublicComments(consultationId, filterStatus);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-5 flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-16 w-full rounded-xl mt-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Kiểm duyệt góp ý công chúng
          </h3>
          <p className="text-xs text-muted-foreground">
            Xem xét và phê duyệt các ý kiến đóng góp từ người dân.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          {comments?.length || 0} Góp ý
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {!comments?.length ? (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-muted/5">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Chưa có góp ý nào cần kiểm duyệt.</p>
          </div>
        ) : (
          // Mỗi card tự quản lý mutation → parent không re-render khi 1 card thay đổi
          comments.map((comment: any) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
});
