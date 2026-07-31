/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ParsedEndpoint {
  id: string;
  name: string;
  description?: string;
  folder: string;
  method: string;
  path: string;
  headers: Array<{ key: string; value: string }>;
  params: Array<{ key: string; value: string }>;
  body: string;
}

// Helper to normalize string for codes
export const toValidCode = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/đ/g, "d").replace(/Đ/g, "D") // Handle 'đ'
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

function extractSwaggerBaseUrl(data: any): string {
  if (data.servers && data.servers.length > 0) {
    return data.servers[0].url || "";
  }
  if (data.host) {
    const scheme = data.schemes?.[0] || 'https';
    return `${scheme}://${data.host}${data.basePath || ''}`;
  }
  return "";
}

function extractSwaggerEndpoints(data: any): ParsedEndpoint[] {
  const endpoints: ParsedEndpoint[] = [];
  const validMethods: Record<string, boolean> = { get: true, post: true, put: true, delete: true, patch: true };

  const resolveRef = (ref: string) => {
    if (typeof ref !== 'string') return null;
    const parts = ref.split('/');
    if (parts[1] === 'components') {
       if (parts[2] === 'schemas') return data.components?.schemas?.[parts[3]];
       if (parts[2] === 'parameters') return data.components?.parameters?.[parts[3]];
       if (parts[2] === 'requestBodies') return data.components?.requestBodies?.[parts[3]];
    }
    if (parts[1] === 'definitions') return data.definitions?.[parts[2]];
    if (parts[1] === 'parameters') return data.parameters?.[parts[2]];
    return null;
  };

  const resolveParam = (p: any) => {
    if (p.$ref) return resolveRef(p.$ref) || p;
    return p;
  };

  const generateSkeleton = (schema: any, depth = 0): any => {
    if (!schema || depth > 5) return {}; // prevent infinite loops
    if (schema.$ref) schema = resolveRef(schema.$ref) || schema;
    
    if (schema.example !== undefined) return schema.example;
    if (schema.type === 'object' || schema.properties) {
      const obj: any = {};
      for (const key in schema.properties) {
        obj[key] = generateSkeleton(schema.properties[key], depth + 1);
      }
      return obj;
    }
    if (schema.type === 'array' && schema.items) {
      return [generateSkeleton(schema.items, depth + 1)];
    }
    if (schema.type === 'string') return "";
    if (schema.type === 'integer' || schema.type === 'number') return 0;
    if (schema.type === 'boolean') return true;
    return "";
  };

  const extractParams = (parameters: any[] | undefined, types: string[]) => {
    if (!parameters?.length) return [];
    const result: any[] = [];
    for (let i = 0; i < parameters.length; i++) {
      const p = resolveParam(parameters[i]);
      if (types.includes(p.in)) result.push({ key: p.name, value: p.example || p.schema?.example || "" });
    }
    return result;
  };

  const extractBody = (details: any) => {
    let reqBody = details.requestBody;
    if (reqBody?.$ref) reqBody = resolveRef(reqBody.$ref) || reqBody;
    
    if (reqBody?.content) {
      const contentKeys = Object.keys(reqBody.content);
      // Prefer application/json, fallback to first available
      const contentType = contentKeys.includes('application/json') ? 'application/json' : contentKeys[0];
      
      if (contentType) {
          const content = reqBody.content[contentType];
          if (content.example) return typeof content.example === 'string' ? content.example : JSON.stringify(content.example, null, 2);
          if (content.schema) {
             let schema = content.schema;
             if (schema.$ref) schema = resolveRef(schema.$ref) || schema;
             if (schema.example) return typeof schema.example === 'string' ? schema.example : JSON.stringify(schema.example, null, 2);
             
             const skeleton = generateSkeleton(schema);
             if (contentType === 'application/x-www-form-urlencoded' || contentType === 'multipart/form-data') {
                 // Format as JSON anyway for the UI to display, or just return JSON string
                 return JSON.stringify(skeleton, null, 2);
             }
             return JSON.stringify(skeleton, null, 2);
          }
      }
    }
    
    const params = Array.isArray(details.parameters) ? details.parameters : [];
    for (let i = 0; i < params.length; i++) {
      const p = resolveParam(params[i]);
      if (p.in === 'body') {
        let schema = p.schema;
        if (schema?.$ref) schema = resolveRef(schema.$ref) || schema;
        if (schema?.example) return typeof schema.example === 'string' ? schema.example : JSON.stringify(schema.example, null, 2);
        if (schema) return JSON.stringify(generateSkeleton(schema), null, 2);
        return "{\n  \n}";
      }
    }
    return "";
  };

  if (data.paths) {
    for (const pathKey in data.paths) {
      const pathMethods = data.paths[pathKey];
      const pathParams = Array.isArray(pathMethods.parameters) ? pathMethods.parameters : [];

      for (const method in pathMethods) {
        const lowerMethod = method.toLowerCase();
        if (!validMethods[lowerMethod]) continue;

        const details = pathMethods[method];
        const methodParams = Array.isArray(details.parameters) ? details.parameters : [];
        const allParams = [...pathParams, ...methodParams];

        endpoints.push({
          id: Math.random().toString(36).substring(2, 11),
          name: details.summary || details.operationId || pathKey,
          description: details.description || "",
          folder: details.tags?.[0] || "",
          method: lowerMethod.toUpperCase(),
          path: pathKey,
          headers: extractParams(allParams, ['header']),
          params: extractParams(allParams, ['query', 'path', 'formData']),
          body: extractBody(details)
        });
      }
    }
  }
  return endpoints;
}

export function processSwaggerData(data: any): any {
  const initialData: any = {
    isRawMode: false,
    rawConfig: JSON.stringify(data, null, 2),
    type: "LGSP",
    systemName: data.info?.title || "Swagger API",
    integrationCode: toValidCode(data.info?.title || "SWAGGER"),
    apiUrl: extractSwaggerBaseUrl(data)
  };

  const endpoints = extractSwaggerEndpoints(data);

  const finalConfig = {
    ...JSON.parse(initialData.rawConfig),
    _parsedEndpoints: endpoints
  };
  initialData.rawConfig = JSON.stringify(finalConfig, null, 2);

  return initialData;
}

function extractPostmanBaseUrl(data: any): string {
  // First try to find base URL from variables
  if (data.variable && Array.isArray(data.variable)) {
    const baseUrlVar = data.variable.find((v: any) => v.key.toLowerCase().includes("url"));
    if (baseUrlVar) return baseUrlVar.value;
  }
  
  // Helper to find the first request in the collection deeply
  const findFirstRequest = (items: any[]): any => {
    if (!items || !Array.isArray(items)) return null;
    for (const item of items) {
      if (item.request) return item.request;
      if (item.item) {
        const req = findFirstRequest(item.item);
        if (req) return req;
      }
    }
    return null;
  };

  const firstReq = findFirstRequest(data.item);
  if (firstReq?.url?.raw) {
    try {
      const rawUrl = firstReq.url.raw as string;
      const match = rawUrl.match(/^(https?:\/\/[^\/]+)/);
      if (match) return match[1];
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (e) { }
  }
  return "";
}

function extractPostmanEndpoints(data: any): ParsedEndpoint[] {
  const endpoints: ParsedEndpoint[] = [];

  const parsePostmanItems = (items: any[], parentPath = "") => {
    items?.forEach((item: any) => {
      if (item.item) {
        parsePostmanItems(item.item, parentPath ? `${parentPath} / ${item.name}` : item.name);
      } else if (item.request) {
        const req = item.request;
        const rawUrl = req.url?.raw || (typeof req.url === 'string' ? req.url : "");

        // Safely extract query parameters
        let queryParams: any[] = [];
        if (Array.isArray(req.url?.query)) {
           queryParams = req.url.query.map((q: any) => ({ key: q.key, value: q.value || "" }));
        }

        // Safely extract path variables
        let pathVars: any[] = [];
        if (Array.isArray(req.url?.variable)) {
           pathVars = req.url.variable.map((v: any) => ({ key: v.key, value: v.value || "" }));
        }

        // Safely extract headers
        let headers: any[] = [];
        if (Array.isArray(req.header)) {
           headers = req.header.map((h: any) => ({ key: h.key, value: h.value || "" }));
        } else if (typeof req.header === 'string') {
           // Postman sometimes stores headers as a raw string
           headers = req.header.split('\n').filter(Boolean).map((line: string) => {
              const parts = line.split(':');
              return { key: parts[0]?.trim() || "", value: parts.slice(1).join(':')?.trim() || "" };
           }).filter((h: any) => h.key);
        }

        let bodyStr = "";
        if (req.body?.mode === 'raw') {
            bodyStr = req.body.raw || "";
        } else if (req.body?.mode === 'urlencoded') {
            bodyStr = JSON.stringify(req.body.urlencoded || [], null, 2);
        } else if (req.body?.mode === 'formdata') {
            bodyStr = JSON.stringify(req.body.formdata || [], null, 2);
        } else if (req.body) {
            bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
        }

        let pathStr = rawUrl;
        if (req.url?.path) {
            const pathParts = Array.isArray(req.url.path) 
               ? req.url.path.map((p: any) => typeof p === 'string' ? p : p.value || "") 
               : [req.url.path];
            pathStr = "/" + pathParts.join('/');
        } else if (rawUrl) {
            try {
                // remove protocol and domain if present, or variables like {{baseUrl}}
                const noHost = rawUrl.replace(/^(?:https?:\/\/[^\/]+|{{[^}]+}})/, '');
                pathStr = noHost.startsWith('/') ? noHost : '/' + noHost;
            } catch (e) {
                pathStr = rawUrl;
            }
        }
        
        pathStr = pathStr.split('?')[0];

        endpoints.push({
          id: Math.random().toString(36).substring(2, 11),
          name: item.name || req.name || "Unnamed Request",
          description: req.description || item.description || "",
          folder: parentPath,
          method: (req.method || "GET").toUpperCase(),
          path: pathStr,
          headers,
          params: [...queryParams, ...pathVars],
          body: bodyStr
        });
      }
    });
  };

  parsePostmanItems(data.item);
  return endpoints;
}

export function processPostmanData(data: any): any {
  const initialData: any = {
    isRawMode: false,
    rawConfig: JSON.stringify(data, null, 2),
    type: "POSTMAN",
    systemName: data.info?.name || "Postman API",
    integrationCode: toValidCode(data.info?.name || "POSTMAN"),
    apiUrl: extractPostmanBaseUrl(data)
  };

  const endpoints = extractPostmanEndpoints(data);

  const finalConfig = {
    ...JSON.parse(initialData.rawConfig),
    _parsedEndpoints: endpoints
  };
  initialData.rawConfig = JSON.stringify(finalConfig, null, 2);

  return initialData;
}
