import React from "react";
import { Users, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  responses: any[] | undefined;
  isLoadingResponses: boolean;
}

export function InternalResponsesTab({ responses, isLoadingResponses }: Props) {
  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/10 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Danh sách phản hồi từ các đơn vị phối hợp
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoadingResponses ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Đang tải phản hồi...</div>
        ) : !responses?.length ? (
          <div className="p-12 text-center text-muted-foreground italic text-sm">Chưa có đơn vị nào phản hồi.</div>
        ) : (
          <div className="divide-y">
            {responses.map((res: any) => (
              <div key={res.id} className="p-5 hover:bg-muted/5 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-foreground">{res.unitName || `Đơn vị ID: ${res.unitId}`}</p>
                    {res.respondedAt && <p className="text-[10px] text-muted-foreground">Phản hồi lúc: {new Date(res.respondedAt).toLocaleString('vi-VN')}</p>}
                  </div>
                  <Badge className={res.status === 'RESPONDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                    {res.status === 'RESPONDED' ? 'Đã phản hồi' : 'Đang chờ'}
                  </Badge>
                </div>
                {res.content && <div className="bg-muted/30 p-3 rounded-lg text-sm italic text-muted-foreground border mt-2">&ldquo;{res.content}&rdquo;</div>}
                {res.fileId && <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-primary font-bold" iconStart={<Download className="h-3 w-3" />}>Tải tệp đính kèm</Button>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
