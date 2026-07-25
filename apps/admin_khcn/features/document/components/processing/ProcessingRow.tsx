import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PROCESSING: { label: "Đang xử lý", cls: "bg-blue-100 text-blue-700" },
  PENDING_APPROVAL: { label: "Chờ phê duyệt", cls: "bg-amber-100 text-amber-700" },
  OVERDUE: { label: "Quá hạn", cls: "bg-rose-100 text-rose-700" },
};

interface ProcessingRowProps {
  doc: any;
}

export const ProcessingRow = React.memo(function ProcessingRow({ doc }: ProcessingRowProps) {
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
           iconStart={<ChevronRight className="h-5 w-5" />}></Button>
        </Link>
      </TableCell>
    </TableRow>
  );
});
