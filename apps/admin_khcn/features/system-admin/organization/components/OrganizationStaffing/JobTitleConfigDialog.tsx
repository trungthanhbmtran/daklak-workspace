"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Settings2, Network, MapPin, Users, Loader2 } from "lucide-react";
import type { JobTitleItem } from "../../types";

type JobTitleConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: JobTitleItem | null;
  domainId: string;
  onDomainIdChange: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
  domainsForUnit: { id: number; name: string }[];
  unitName?: string;
};

export function JobTitleConfigDialog({
  open,
  onOpenChange,
  jobTitle,
  domainId,
  onDomainIdChange,
  onSave,
  isSaving,
  domainsForUnit,
  unitName,
}: JobTitleConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden shadow-lg border-primary/20">
        
        {/* HEADER */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 bg-muted/10 border-b">
          <DialogTitle className="text-lg flex items-center gap-2 text-primary">
            <Settings2 className="h-5 w-5" />
            Tiêu chuẩn chức danh {jobTitle ? `— ${jobTitle.name}` : ""}
          </DialogTitle>
          <DialogDescription className="mt-2">
            Thiết lập phạm vi quản lý mặc định cho chức danh này.
          </DialogDescription>
        </DialogHeader>

        {jobTitle && (
          <div className="space-y-6 px-6 py-5 overflow-y-auto flex-1 min-h-0 bg-background">
            
            {/* ALERT BOX GIẢI THÍCH NGHIỆP VỤ */}
            <div className="flex gap-3 items-start bg-blue-50 text-blue-800 p-3.5 rounded-lg border border-blue-100 text-sm">
              <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
              <p className="leading-relaxed">
                Đây là cấu hình <strong>khung tiêu chuẩn chung</strong> cho toàn bộ các vị trí thuộc chức danh <em>{jobTitle.name}</em>. Bạn có thể tinh chỉnh lại chi tiết nhiệm vụ cho từng cá nhân cụ thể ở phần <strong>"Phân công nhiệm vụ chi tiết"</strong> bên ngoài.
              </p>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Network className="h-4 w-4 text-muted-foreground" />
                Lĩnh vực phụ trách chung
              </label>
              <Select value={domainId} onValueChange={onDomainIdChange}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder="-- Chọn lĩnh vực phụ trách --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Không quy định lĩnh vực</SelectItem>
                  {domainsForUnit.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {domainsForUnit.length === 0 && unitName != null && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-2">
                  Đơn vị chưa được giao lĩnh vực. Vui lòng cập nhật thông tin đơn vị trước.
                </p>
              )}
            </div>


          </div>
        )}

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-2">
          <Button variant="outline" className="min-w-[100px]" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button className="min-w-[120px]" onClick={onSave} disabled={isSaving || !jobTitle}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thiết lập"
            )}
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
}
