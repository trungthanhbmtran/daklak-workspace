"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, Layers, AlignStartVertical, Users, Loader2 } from "lucide-react";
import { hrmPlansApi, hrmObjectivesApi } from "@/features/hrm/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { HrmMasterPlan } from "@/features/hrm/types";

interface PlanAutoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: HrmMasterPlan;
  onSuccess: () => void;
}

type Framework = "OKRs" | "BSC" | "SMART" | "RACI";

const FRAMEWORKS = [
  {
    id: "OKRs",
    name: "OKRs",
    description: "Tập trung vào 1 Mục tiêu cốt lõi và 3-5 Kết quả then chốt đo lường được.",
    icon: Target,
    color: "indigo"
  },
  {
    id: "BSC",
    name: "BSC",
    description: "Cân bằng 4 viễn cảnh: Tài chính, Khách hàng, Nội bộ, Học hỏi.",
    icon: Layers,
    color: "emerald"
  },
  {
    id: "SMART",
    name: "SMART",
    description: "Cụ thể, Đo lường được, Khả thi, Thực tế, Có thời hạn.",
    icon: AlignStartVertical,
    color: "amber"
  },
  {
    id: "RACI",
    name: "RACI",
    description: "Chú trọng ma trận phân quyền và luồng công việc liên phòng ban.",
    icon: Users,
    color: "blue"
  }
];

export const PlanAutoGeneratorModal = ({ isOpen, onClose, plan, onSuccess }: PlanAutoGeneratorModalProps) => {
  const [objectiveText, setObjectiveText] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<Framework>("OKRs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleGenerate = async () => {
    if (!objectiveText.trim()) {
      toast.error("Vui lòng nhập mục tiêu mong muốn!");
      return;
    }

    setIsGenerating(true);
    setLoadingText("Đang phân tích ngữ nghĩa mục tiêu...");

    try {
      // Simulate AI Processing Steps
      await new Promise(r => setTimeout(r, 1000));
      setLoadingText(`Đang áp dụng mô hình quản trị ${selectedFramework}...`);
      await new Promise(r => setTimeout(r, 1500));
      setLoadingText("Đang tạo cấu trúc và phân bổ nguồn lực...");
      await new Promise(r => setTimeout(r, 1000));

      const newPerspectives = [...(plan.perspectives || [])];
      const newObjectivesToCreate = [];

      // MOCK ENGINE LOGIC
      if (selectedFramework === "OKRs") {
        const objId = "okr_obj_" + Date.now();
        newPerspectives.push({ id: objId, title: "Objective: " + objectiveText, colorClass: "indigo" });

        newObjectivesToCreate.push({
          perspective: objId, title: "KR1: Đạt doanh thu kỳ vọng", metric: "VND", target: "2 Tỷ", weight: 40, status: "TODO" as const, departmentIds: [5]
        });
        newObjectivesToCreate.push({
          perspective: objId, title: "KR2: Ký hợp đồng đối tác chiến lược", metric: "Hợp đồng", target: "5", weight: 30, status: "TODO" as const, departmentIds: [5]
        });
        newObjectivesToCreate.push({
          perspective: objId, title: "KR3: Tỷ lệ chuyển đổi khách hàng", metric: "%", target: "> 15%", weight: 30, status: "TODO" as const, departmentIds: [2]
        });

      } else if (selectedFramework === "BSC") {
        const p1 = "bsc_fin_" + Date.now();
        const p2 = "bsc_cus_" + Date.now();
        const p3 = "bsc_int_" + Date.now();
        const p4 = "bsc_lea_" + Date.now();

        newPerspectives.push(
          { id: p1, title: "Tài chính", colorClass: "emerald" },
          { id: p2, title: "Khách hàng", colorClass: "blue" },
          { id: p3, title: "Quy trình nội bộ", colorClass: "amber" },
          { id: p4, title: "Học hỏi & Phát triển", colorClass: "purple" }
        );

        newObjectivesToCreate.push(
          { perspective: p1, title: "Tối ưu hóa chi phí cho " + objectiveText, metric: "Chi phí", target: "Giảm 10%", weight: 100, status: "TODO" as const, departmentIds: [4] },
          { perspective: p2, title: "Khảo sát nhu cầu cho " + objectiveText, metric: "NPS", target: "> 80", weight: 100, status: "TODO" as const, departmentIds: [5] },
          { perspective: p3, title: "Xây dựng luồng xử lý tự động", metric: "Thời gian", target: "< 24h", weight: 100, status: "TODO" as const, departmentIds: [2] },
          { perspective: p4, title: "Đào tạo nhân sự về " + objectiveText, metric: "Nhân sự", target: "100%", weight: 100, status: "TODO" as const, departmentIds: [3] }
        );

      } else if (selectedFramework === "SMART") {
        const pId = "smart_" + Date.now();
        newPerspectives.push({ id: pId, title: "Mục tiêu SMART", colorClass: "rose" });

        newObjectivesToCreate.push({
          perspective: pId,
          title: objectiveText,
          metric: "Hoàn thành",
          target: "100%",
          weight: 100,
          status: "TODO" as const,
          departmentIds: [1, 2, 5],
          cases: [
            { id: "c1", title: "Cụ thể hóa yêu cầu (S)", isDone: false },
            { id: "c2", title: "Thiết lập hệ thống đo lường (M)", isDone: false },
            { id: "c3", title: "Phân bổ ngân sách khả thi (A)", isDone: false },
            { id: "c4", title: "Rà soát tính thực tế (R)", isDone: false },
            { id: "c5", title: "Đảm bảo đúng deadline (T)", isDone: false }
          ]
        });

      } else if (selectedFramework === "RACI") {
        const pId = "raci_" + Date.now();
        newPerspectives.push({ id: pId, title: "Ma trận RACI: " + objectiveText, colorClass: "cyan" });

        newObjectivesToCreate.push({
          perspective: pId,
          title: "Thiết kế giải pháp " + objectiveText,
          metric: "Tài liệu",
          target: "Approved",
          weight: 50,
          status: "TODO" as const,
          departmentIds: [2, 3],
          cases: [
            { id: "c1", title: "(R) Chịu trách nhiệm thực thi: Phòng Kỹ Thuật", isDone: false },
            { id: "c2", title: "(A) Phê duyệt: Ban Giám Đốc", isDone: false },
            { id: "c3", title: "(C) Tư vấn: Chuyên gia bên ngoài", isDone: false },
            { id: "c4", title: "(I) Nhận thông tin: Phòng Kinh doanh", isDone: false }
          ]
        });
      }

      // Update plan with new perspectives
      await hrmPlansApi.update(plan.id, { perspectives: newPerspectives });

      // Create objectives
      for (const obj of newObjectivesToCreate) {
        await hrmObjectivesApi.create({ planId: plan.id, ...obj });
      }

      toast.success("Đã khởi tạo kế hoạch tự động bằng AI thành công!");
      onSuccess();
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo kế hoạch");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl overflow-hidden p-0 bg-slate-50 border-0 shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>

        <div className="p-8 relative">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-800">
              Trợ lý Lập kế hoạch AI
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-base">
              Chỉ cần nhập mục tiêu cốt lõi, AI sẽ tự động phân rã và xây dựng kế hoạch theo chuẩn quản trị quốc tế.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700">Mục tiêu cốt lõi bạn muốn đạt được?</Label>
              <textarea
                placeholder="Ví dụ: Đạt mốc 10.000 người dùng trong quý 3, hoặc Chuyển đổi số toàn diện công ty..."
                value={objectiveText}
                onChange={(e) => setObjectiveText(e.target.value)}
                className="w-full min-h-[100px] p-4 rounded-2xl border-0 shadow-inner bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 placeholder:text-slate-400 resize-none"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700">Chọn mô hình quản trị</Label>
              <div className="grid grid-cols-2 gap-3">
                {FRAMEWORKS.map((fw) => {
                  const isSelected = selectedFramework === fw.id;
                  const Icon = fw.icon;
                  return (
                    <button
                      key={fw.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setSelectedFramework(fw.id as Framework)}
                      className={cn(
                        "text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-2",
                        isSelected
                          ? `border-${fw.color}-500 bg-${fw.color}-50/50 shadow-sm ring-1 ring-${fw.color}-500`
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg", isSelected ? `bg-${fw.color}-500 text-white` : "bg-slate-100 text-slate-500")}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={cn("font-bold", isSelected ? `text-${fw.color}-700` : "text-slate-700")}>{fw.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {fw.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 items-center">
          {isGenerating ? (
            <div className="flex items-center gap-3 text-indigo-600 font-semibold mr-auto">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm animate-pulse">{loadingText}</span>
            </div>
          ) : (
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold h-11 px-6 text-slate-500">
              Hủy bỏ
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !objectiveText.trim()}
            className={cn(
              "rounded-xl font-bold h-11 px-8 shadow-lg transition-all",
              isGenerating ? "bg-indigo-400 opacity-50" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 hover:shadow-indigo-200 text-white"
            )}
          >
            {isGenerating ? "Đang xử lý..." : "Khởi tạo Kế hoạch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
