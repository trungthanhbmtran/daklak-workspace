import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PropertiesPanelComponentProps } from "../types";

export const BasicConfig = ({ data, handleChange, orgRoles }: PropertiesPanelComponentProps) => {
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

      <div className="pt-2 border-t border-border/60">
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Người thực hiện (Assignee)
        </label>
        <NativeSelect
          name="assignmentStrategy"
          value={data.assignmentStrategy || "ANY"}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-2"
        >
          <NativeSelectOption value="ANY">Không giới hạn (Bất kỳ ai)</NativeSelectOption>
          <NativeSelectOption value="ASSIGNER">Người tạo / Người bước trước giao</NativeSelectOption>
          <NativeSelectOption value="DIRECT_MANAGER">Quản lý trực tiếp</NativeSelectOption>
          <NativeSelectOption value="BY_ROLE">Theo Chức danh (Role)</NativeSelectOption>
          <NativeSelectOption value="DIRECT_USER">Giao đích danh nhân viên</NativeSelectOption>
        </NativeSelect>

        {data.assignmentStrategy === "BY_ROLE" && orgRoles && orgRoles.length > 0 && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-1">
            <NativeSelect
              name="targetRole"
              value={data.targetRole || ""}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <NativeSelectOption value="">-- Chọn chức danh --</NativeSelectOption>
              {orgRoles.map((role: any) => (
                <NativeSelectOption key={role.code} value={role.code}>
                  {role.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}

        {data.assignmentStrategy === "DIRECT_USER" && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-1">
            <Input type="text"
              name="employeeCode"
              value={data.employeeCode || ""}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Nhập mã nhân viên (VD: NV001)"
            />
          </div>
        )}
      </div>
    </>
  );
};
