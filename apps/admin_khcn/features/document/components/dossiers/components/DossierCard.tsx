import React from "react";
import Link from "next/link";
import { FolderOpen, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DossierStatusBadge } from "@/components/shared/badges/DocumentBadges";

interface DossierCardProps {
  hs: any;
}

export const DossierCard = React.memo(function DossierCard({ hs }: DossierCardProps) {
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
               iconStart={<ChevronRight className="h-5 w-5" />}></Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
