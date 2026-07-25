import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PropertiesPanelComponentProps } from "../types";

export const BasicConfig = ({ data, handleChange }: PropertiesPanelComponentProps) => {
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Tên bước xử lý (Label)
        </label>
        <Input type="text"
          name="label"
          value={data.label || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder="VD: Giao việc, Duyệt báo cáo..."
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Loại thao tác (Action Type)
        </label>
        <NativeSelect
          name="actionName"
          value={data.actionName || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="">(Tùy chọn) Chọn loại thao tác...</NativeSelectOption>
          <NativeSelectOption value="ASSIGN">Giao việc / Phân công</NativeSelectOption>
          <NativeSelectOption value="APPROVE">Phê duyệt / Ký duyệt</NativeSelectOption>
          <NativeSelectOption value="REJECT">Từ chối / Trả lại</NativeSelectOption>
          <NativeSelectOption value="SUBMIT">Hoàn thành / Báo cáo</NativeSelectOption>
        </NativeSelect>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Yêu cầu xử lý
        </label>
        <Textarea
          name="description"
          value={data.description || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          placeholder="Mô tả chi tiết công việc cần thực hiện ở bước này..."
        />
      </div>
    </>
  );
};
