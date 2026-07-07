/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { toast } from "sonner";
import { ParsedEndpoint, toValidCode } from "./parserUtils";

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

        const initialData: any = {
          isRawMode: false,
          rawConfig: JSON.stringify(data, null, 2),
        };

        const endpoints: ParsedEndpoint[] = [];

        initialData.type = "LGSP";
        initialData.systemName = data.info?.title || "Swagger API";
        initialData.integrationCode = toValidCode(data.info?.title || "SWAGGER");

        let baseUrl = "";
        if (data.servers && data.servers.length > 0) {
          baseUrl = data.servers[0].url;
        } else if (data.host) {
          const scheme = data.schemes?.[0] || 'https';
          baseUrl = `${scheme}://${data.host}${data.basePath || ''}`;
        }
        initialData.apiUrl = baseUrl;

        if (data.paths) {
          Object.keys(data.paths).forEach(pathKey => {
            const pathMethods = data.paths[pathKey];
            Object.keys(pathMethods).forEach(method => {
              if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
                const details = pathMethods[method];

                const queryParams: any[] = [];
                const headers: any[] = [];

                if (details.parameters) {
                  details.parameters.forEach((p: any) => {
                    if (p.in === 'query') queryParams.push({ key: p.name, value: "" });
                    if (p.in === 'header') headers.push({ key: p.name, value: "" });
                  });
                }

                endpoints.push({
                  id: Math.random().toString(36).substr(2, 9),
                  name: details.summary || details.operationId || pathKey,
                  folder: details.tags?.[0] || "",
                  method: method.toUpperCase(),
                  path: pathKey,
                  headers: headers,
                  params: queryParams,
                  body: ""
                });
              }
            });
          });
        }

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
