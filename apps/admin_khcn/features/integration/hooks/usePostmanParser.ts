/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { toast } from "sonner";
import { processPostmanData } from "./parserUtils";

export function usePostmanParser(onSuccess: (initialData: any) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);

        if (!(data.info && data.item)) {
          toast.error("File không đúng định dạng Postman Collection");
          return;
        }

        const initialData = processPostmanData(data);

        onSuccess(initialData);
        toast.success(`Đã trích xuất cấu hình: ${initialData.systemName}`);
       
      } catch (error) {
        toast.error((error as any)?.response?.data?.message || "Lỗi đọc file JSON Postman");
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
