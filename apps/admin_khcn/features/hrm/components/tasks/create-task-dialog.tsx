"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CalendarIcon, FlagIcon, UserIcon, AlignLeftIcon, TypeIcon, CheckCircle2, UserCircle2, BriefcaseIcon } from "lucide-react";

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
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 pb-5 border-b bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <BriefcaseIcon className="w-4 h-4" />
               </div>
               {isSubTask ? "Giao việc con (Phân rã công việc)" : "Giao việc mới"}
            </DialogTitle>
            <DialogDescription className="ml-10">
              {isSubTask ? `Công việc này sẽ phụ thuộc vào nhiệm vụ cha: ${parentId}` : "Thiết lập thông tin và phân công nhiệm vụ cho nhân sự hoặc phòng ban."}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col md:flex-row max-h-[65vh] overflow-y-auto bg-white dark:bg-slate-950">
            {/* Cột trái: Thông tin chính */}
            <div className="flex-1 p-6 space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <TypeIcon className="w-4 h-4 text-slate-400"/> Tiêu đề công việc <span className="text-red-500">*</span>
                </Label>
                <Input 
                  required 
                  placeholder="VD: Cập nhật tài liệu kỹ thuật dự án A..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base h-11 transition-all focus-visible:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <AlignLeftIcon className="w-4 h-4 text-slate-400"/> Nội dung chi tiết
                </Label>
                <Textarea 
                  placeholder="Mô tả chi tiết yêu cầu công việc, đính kèm link, kết quả mong đợi..." 
                  className="min-h-[160px] resize-y transition-all focus-visible:ring-blue-500 text-base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Cột phải: Thiết lập */}
            <div className="w-full md:w-[320px] bg-slate-50 dark:bg-slate-900/30 p-6 md:border-l space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <UserIcon className="w-4 h-4 text-slate-400"/> Người / Đơn vị nhận việc <span className="text-red-500">*</span>
                </Label>
                <Select value={assignee} onValueChange={setAssignee} required>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm">
                    <SelectValue placeholder="Chọn người nhận..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectGroup>
                      <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Gợi ý (Năng lực / Phù hợp nhất)</SelectLabel>
                      <SelectItem value="EMP_202">
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="w-4 h-4 text-blue-500" />
                            <span>Phạm Thị D (Chuyên viên)</span>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="default" className="text-[10px] h-4 px-1 py-0 leading-none">Phù hợp</Badge>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none bg-blue-100 text-blue-800 border-transparent">Năng lực tốt</Badge>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="DEPT_10">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>🏢 P. Công nghệ thông tin</span>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none bg-blue-100 text-blue-800 border-transparent">Đúng chuyên môn</Badge>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                    
                    <SelectSeparator />
                    
                    <SelectGroup>
                      <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Cần lưu ý (Hiệu suất thấp)</SelectLabel>
                      <SelectItem value="EMP_203">
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="w-4 h-4 text-red-500" />
                            <span>Lê Văn C (Chuyên viên)</span>
                          </div>
                          <Badge variant="destructive" className="text-[10px] h-4 px-1 py-0 leading-none bg-red-100 text-red-700 hover:bg-red-200 border-transparent">Hiệu suất thấp</Badge>
                        </div>
                      </SelectItem>
                    </SelectGroup>

                    <SelectSeparator />

                    <SelectGroup>
                      <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Danh sách khác</SelectLabel>
                      <SelectItem value="DEPT_11">
                        <div className="flex items-center justify-between w-full">
                          <span>🏢 P. Hành chính - Tổng hợp</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="EMP_201">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="w-4 h-4 text-slate-400" />
                            <span>Trần Thị B (Chuyên viên)</span>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="w-4 h-4 text-slate-400"/> Thời hạn <span className="text-red-500">*</span>
                </Label>
                <Input required type="date" className="bg-white dark:bg-slate-950 h-11 focus-visible:ring-blue-500 shadow-sm" />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <FlagIcon className="w-4 h-4 text-slate-400"/> Mức độ ưu tiên
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-blue-500 shadow-sm">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></div> Thấp</div>
                    </SelectItem>
                    <SelectItem value="NORMAL">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div> Bình thường</div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div> Cao</div>
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm animate-pulse"></div> Khẩn cấp</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <DialogFooter className="flex justify-end gap-3 sm:space-x-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                Huỷ bỏ
              </Button>
              <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <CheckCircle2 className="w-4 h-4" /> Giao việc ngay
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
