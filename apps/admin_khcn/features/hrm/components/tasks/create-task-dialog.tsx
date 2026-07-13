"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string; // Nếu có parentId thì đây là form Tạo nhiệm vụ con
}

export function CreateTaskDialog({ open, onOpenChange, parentId }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [assignee, setAssignee] = useState("");
  
  const isSubTask = !!parentId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic lưu công việc mới sẽ ở đây
    alert(`Đã lưu ${isSubTask ? "nhiệm vụ con" : "công việc mới"}:\n- Tiêu đề: ${title}\n- Người/Đơn vị xử lý: ${assignee}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isSubTask ? "Giao việc con (Phân rã công việc)" : "Giao việc mới"}</DialogTitle>
          <DialogDescription>
            {isSubTask ? `Công việc này sẽ phụ thuộc vào nhiệm vụ cha: ${parentId}` : "Điền thông tin chi tiết để giao một nhiệm vụ mới."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề công việc <span className="text-red-500">*</span></label>
            <Input 
              required 
              placeholder="Nhập tiêu đề công việc..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung chi tiết</label>
            <Textarea 
              placeholder="Mô tả chi tiết yêu cầu công việc..." 
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mức độ ưu tiên</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Thấp</SelectItem>
                  <SelectItem value="NORMAL">Bình thường</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Thời hạn hoàn thành <span className="text-red-500">*</span></label>
              <Input required type="date" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Người / Đơn vị xử lý <span className="text-red-500">*</span></label>
            <Select value={assignee} onValueChange={setAssignee} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người hoặc phòng ban nhận việc..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground uppercase font-semibold">Gợi ý (Năng lực / Phù hợp nhất)</SelectLabel>
                  <SelectItem value="EMP_202">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>👤 Phạm Thị D (Chuyên viên)</span>
                      <div className="flex gap-1">
                        <Badge variant="default" className="text-[10px] h-4 px-1 py-0 leading-none">Phù hợp nhất</Badge>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent">Năng lực tốt</Badge>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="DEPT_10">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>🏢 Phòng Công nghệ thông tin</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent">Đúng chuyên môn</Badge>
                    </div>
                  </SelectItem>
                </SelectGroup>
                
                <SelectSeparator />
                
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground uppercase font-semibold">Cần lưu ý (Hiệu suất thấp)</SelectLabel>
                  <SelectItem value="EMP_203">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>👤 Lê Văn C (Chuyên viên)</span>
                      <Badge variant="destructive" className="text-[10px] h-4 px-1 py-0 leading-none">Hiệu suất thấp</Badge>
                    </div>
                  </SelectItem>
                </SelectGroup>

                <SelectSeparator />

                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground uppercase font-semibold">Danh sách khác</SelectLabel>
                  <SelectItem value="DEPT_11">
                    <div className="flex items-center justify-between w-full">
                      <span>🏢 Phòng Hành chính - Tổng hợp</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EMP_201">
                    <div className="flex items-center justify-between w-full">
                      <span>👤 Trần Thị B (Chuyên viên)</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ bỏ</Button>
            <Button type="submit">Lưu công việc</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
