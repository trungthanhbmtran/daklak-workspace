/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { toast } from "sonner";
import { processSwaggerData } from "./parserUtils";

export function useSwaggerParser(onSuccess: (initialData: any) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);

        if (!(data.openapi || data.swagger)) {
          toast.error("File không đúng định dạng Swagger / OpenAPI");
          return;
        }

        const initialData = processSwaggerData(data);
        onSuccess(initialData);
        toast.success(`Đã trích xuất cấu hình: ${initialData.systemName}`);
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        toast.error("Lỗi đọc file JSON Swagger");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return { fileInputRef, handleFileUpload, triggerUpload };
}
