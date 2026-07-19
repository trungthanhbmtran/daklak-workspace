/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PropertiesPanelComponentProps } from "./types";

export const ServiceTaskProperties = ({ data, handleChange, availableServices = [] }: PropertiesPanelComponentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Dịch vụ mục tiêu
        </label>
        <NativeSelect
          name="service"
          value={data.service || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="">Chọn microservice...</NativeSelectOption>
          {availableServices.map((svc: any) => (
            <NativeSelectOption key={svc.code || svc.id} value={svc.code || svc.id}>
              {svc.name || svc.title}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Hành động
        </label>
        <NativeSelect
          name="action"
          value={data.action || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="">Chọn hành động...</NativeSelectOption>
          {(data.service === 'user-service' || data.service === 'USER_SERVICE') && (
            <>
              <NativeSelectOption value="findOne">Tìm kiếm người dùng</NativeSelectOption>
              <NativeSelectOption value="setUserActive">Kích hoạt tài khoản</NativeSelectOption>
            </>
          )}
          {(data.service === 'hrm-service' || data.service === 'HRM_SERVICE') && (
            <>
              <NativeSelectOption value="getEmployee">Lấy thông tin nhân sự</NativeSelectOption>
              <NativeSelectOption value="updateContract">Cập nhật hợp đồng</NativeSelectOption>
            </>
          )}
          {(data.service === 'posts-service' || data.service === 'POST_SERVICE') && (
            <>
              <NativeSelectOption value="submitPost">Gửi duyệt bài viết</NativeSelectOption>
              <NativeSelectOption value="reviewPost">Đang duyệt bài viết</NativeSelectOption>
              <NativeSelectOption value="approvePost">Phê duyệt bài viết</NativeSelectOption>
              <NativeSelectOption value="rejectPost">Từ chối bài viết</NativeSelectOption>
              <NativeSelectOption value="publishPost">Xuất bản bài viết</NativeSelectOption>
            </>
          )}
          {(data.service === 'document-service' || data.service === 'DOCUMENT_SERVICE') && (
            <>
              <NativeSelectOption value="receiveDocument">Tiếp nhận văn bản</NativeSelectOption>
              <NativeSelectOption value="processDocument">Xử lý văn bản</NativeSelectOption>
              <NativeSelectOption value="finalizeDocument">Hoàn tất văn bản</NativeSelectOption>
            </>
          )}
          <NativeSelectOption value="notify">Gửi thông báo hệ thống</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
};
