import React from 'react';
import { Info } from "lucide-react";
import { PropertiesPanelComponentProps } from "./types";

export const GatewayProperties = ({ selectedNode }: PropertiesPanelComponentProps) => {
  if (!selectedNode) return null;
  const { type } = selectedNode;
  
  return (
    <div className="space-y-4">
      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-orange-600 shrink-0" />
          <p className="text-[11px] text-orange-800 leading-normal">
            {type === "exclusive_gateway"
              ? "Sử dụng Edit Edge (đường nối) để cấu hình biểu thức rẽ nhánh (expression)."
              : "Tất cả các luồng đầu ra sẽ thực thi song song. Hệ thống tự động chờ (Join) ở các nút tiếp theo nếu có nhiều nhánh đi vào."}
          </p>
        </div>
      </div>
    </div>
  );
};
