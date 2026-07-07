import { useRef } from "react";
import { toast } from "sonner";

export interface ParsedEndpoint {
  id: string;
  name: string;
  folder: string;
  method: string;
  path: string;
  headers: Array<{ key: string; value: string }>;
  params: Array<{ key: string; value: string }>;
  body: string;
}

export function useApiParser(onSuccess: (initialData: any) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        
        const initialData: any = {
          isRawMode: false,
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

        // Helper to normalize string for codes
        const toValidCode = (str: string) => {
          return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/đ/g, "d").replace(/Đ/g, "D") // Handle 'đ'
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        };

        // Detect Postman Collection
        if (data.info && data.item) {
          initialData.isRawMode = true;
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
            } catch (e) {}
          }
          initialData.apiUrl = url;

          parsePostmanItems(data.item);
        } 
        // Detect Swagger / OpenAPI
        else if (data.openapi || data.swagger) {
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
        } else {
          toast.error("Không nhận diện được định dạng Swagger hoặc Postman");
          return;
        }

        const finalConfig = {
          ...JSON.parse(initialData.rawConfig),
          _parsedEndpoints: endpoints
        };
        initialData.rawConfig = JSON.stringify(finalConfig, null, 2);
        
        // Populate the visual endpoints array
        initialData.endpoints = endpoints.map(ep => ({
          path: ep.path,
          method: ep.method,
          description: ep.name || ""
        }));

        onSuccess(initialData);
        toast.success(`Đã trích xuất cấu hình: ${initialData.systemName}`);
      } catch (error) {
        toast.error("Lỗi đọc file JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return { fileInputRef, handleFileUpload, triggerUpload };
}
