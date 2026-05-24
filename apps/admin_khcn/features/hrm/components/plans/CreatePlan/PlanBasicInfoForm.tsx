import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, ArrowLeft } from "lucide-react";

export interface PlanBasicInfoData {
  title: string;
  objective: string;
  type: string;
  startDate: string;
  endDate: string;
}

interface PlanBasicInfoFormProps {
  plan: PlanBasicInfoData;
  onChange: (plan: PlanBasicInfoData) => void;
  onNext: () => void;
}

export function PlanBasicInfoForm({ plan, onChange, onNext }: PlanBasicInfoFormProps) {
  return (
    <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      <CardContent className="p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <LayoutTemplate className="text-indigo-500 w-6 h-6" /> Định hình Mục tiêu Cấp cao
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 md:col-span-2">
            <Label className="font-bold text-slate-700">Tên Kế hoạch / Chiến dịch <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="VD: Kế hoạch Chuyển đổi số toàn diện Quý 3/2026"
              value={plan.title}
              onChange={(e) => onChange({ ...plan, title: e.target.value })}
              className="h-14 text-lg font-bold bg-slate-50 focus:bg-white rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="font-bold text-slate-700">Mục tiêu Cốt lõi (Objective - O) <span className="text-rose-500">*</span></Label>
            <Textarea
              placeholder="Mô tả tham vọng, tác động và kết quả kỳ vọng ở mức vĩ mô..."
              value={plan.objective}
              onChange={(e) => onChange({ ...plan, objective: e.target.value })}
              className="min-h-[120px] bg-slate-50 focus:bg-white rounded-xl border-slate-200 resize-none text-base p-4"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Mô hình Quản trị</Label>
            <Select value={plan.type} onValueChange={(val) => onChange({ ...plan, type: val })}>
              <SelectTrigger className="h-12 bg-slate-50 rounded-xl">
                <SelectValue placeholder="Chọn mô hình quản trị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MASTER_PLAN">Kế hoạch Tổng thể (Master Plan)</SelectItem>
                <SelectItem value="OKR">Quản trị theo Mục tiêu (OKR)</SelectItem>
                <SelectItem value="PROJECT">Dự án trọng điểm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Khung thời gian (Timeframe)</Label>
            <div className="flex items-center gap-3">
              <Input type="date" className="h-12 bg-slate-50 rounded-xl flex-1" value={plan.startDate} onChange={(e) => onChange({ ...plan, startDate: e.target.value })} />
              <span className="text-slate-400 font-bold">→</span>
              <Input type="date" className="h-12 bg-slate-50 rounded-xl flex-1" value={plan.endDate} onChange={(e) => onChange({ ...plan, endDate: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
          <Button onClick={onNext} className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8">
            Tiếp theo: Phân rã Mục tiêu <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
