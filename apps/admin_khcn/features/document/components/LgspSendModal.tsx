/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Building2 } from "lucide-react";
import { useDocuments, useLgspAgencies } from "../hooks/useDocuments";

interface LgspSendModalProps {
  documentId: string | null;
  documentNumber?: string;
  documentTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LgspSendModal({
  documentId,
  documentNumber,
  documentTitle,
  open,
  onOpenChange,
}: LgspSendModalProps) {
  const { sendLgspDocument, isSendingLgsp } = useDocuments();
  const { data: agencies = [] } = useLgspAgencies({ limit: 100 });
  const [receiverCode, setReceiverCode] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId || !receiverCode.trim()) return;

    try {
      await sendLgspDocument({
        id: documentId,
        receiverCode: receiverCode.trim(),
      });
      onOpenChange(false);
      setReceiverCode("");
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl bg-background border shadow-2xl">
        <DialogHeader className="space-y-2 pb-2 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black">Gửi Liên thông Trục LGSP</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Phát hành văn bản điện tử đến cơ quan/đơn vị qua trục LGSP Đắk Lắk
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 py-3">
          <div className="p-3 bg-muted/30 rounded-2xl space-y-1">
            <div className="text-xs font-bold text-foreground">
              Số / Ký hiệu: {documentNumber || "Chưa có"}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              Trích yếu: {documentTitle || "---"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mã đơn vị tiếp nhận (Receiver OrganId)
            </Label>
            <Input
              value={receiverCode}
              onChange={(e) => setReceiverCode(e.target.value)}
              placeholder="VD: 000.00.00.G11 hoặc chọn từ danh sách"
              className="rounded-xl font-mono text-sm"
              required
            />
          </div>

          {Array.isArray(agencies) && agencies.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Gợi ý đơn vị liên thông:</Label>
              <div className="max-h-36 overflow-y-auto space-y-1 p-1 border rounded-xl bg-muted/10">
                {agencies.map((agency: any) => (
                  <button
                    key={agency.code || agency.agency_id}
                    type="button"
                    onClick={() => setReceiverCode(agency.code)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium truncate flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {agency.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground font-bold">
                      {agency.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSendingLgsp || !receiverCode.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-500/20"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSendingLgsp ? "Đang gửi..." : "Gửi văn bản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
