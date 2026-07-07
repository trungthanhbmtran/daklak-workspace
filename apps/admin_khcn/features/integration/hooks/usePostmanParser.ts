/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { toast } from "sonner";
import { ParsedEndpoint, toValidCode } from "./parserUtils";

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

        const initialData: any = {
          isRawMode: true,
          rawConfig: JSON.stringify(data, null, 2),
        };

        const endpoints: ParsedEndpoint[] = [];

        // Recursive function for Postman
        const parsePostmanItems = (items: any[], parentPath = "") => {
          items.forEach((item: any) => {
            if (item.item) {
              parsePostmanItems(item.item, parentPath ? `${parentPath} / ${item.name}` : item.name);
            } else if (item.request) {
              const req = item.request;
              const rawUrl = req.url?.raw || (typeof req.url === 'string' ? req.url : "");

              let queryParams: any[] = [];
              if (req.url?.query) {
                queryParams = req.url.query.map((q: any) => ({ key: q.key, value: q.value || "" }));
              }

              endpoints.push({
                id: Math.random().toString(36).substr(2, 9),
                name: item.name || "Unnamed Request",
                folder: parentPath,
                method: req.method || "GET",
                path: rawUrl,
                headers: req.header?.map((h: any) => ({ key: h.key, value: h.value })) || [],
                params: queryParams,
                body: req.body?.raw || ""
              });
            }
          });
        };

        initialData.type = "POSTMAN";
        initialData.systemName = data.info.name || "Postman API";
        initialData.integrationCode = toValidCode(data.info.name || "POSTMAN");

        let url = "";
        if (data.variable && Array.isArray(data.variable)) {
          const baseUrlVar = data.variable.find((v: any) => v.key.toLowerCase().includes("url"));
          if (baseUrlVar) url = baseUrlVar.value;
        }
        if (!url && data.item?.[0]?.request?.url?.raw) {
          try {
            const rawUrl = data.item[0].request.url.raw as string;
            const match = rawUrl.match(/^(https?:\/\/[^\/]+)/);
            if (match) url = match[1];
          } catch (e) { }
        }
        initialData.apiUrl = url;

        parsePostmanItems(data.item);

        const finalConfig = {
          ...JSON.parse(initialData.rawConfig),
          _parsedEndpoints: endpoints
        };
        initialData.rawConfig = JSON.stringify(finalConfig, null, 2);

        // Populate the visual endpoints array
        initialData.endpoints = endpoints.map((ep: any) => ({
          path: ep.path,
          method: ep.method,
          description: ep.name || ""
        }));

        onSuccess(initialData);
        toast.success(`Đã trích xuất cấu hình: ${initialData.systemName}`);
      } catch (error) {
        toast.error("Lỗi đọc file JSON Postman");
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
