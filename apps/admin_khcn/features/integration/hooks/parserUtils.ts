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
    return data.servers[0].url;
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

  const resolveParam = (p: any) => {
    if (p.$ref && typeof p.$ref === 'string') {
      const parts = p.$ref.split('/');
      if (parts[1] === 'components' && parts[2] === 'parameters') return data.components?.parameters?.[parts[3]] || p;
      if (parts[1] === 'parameters') return data.parameters?.[parts[2]] || p;
    }
    return p;
  };

  const extractParams = (parameters: any[] | undefined, type: 'query' | 'header') => {
    if (!parameters?.length) return [];
    const result: any[] = [];
    for (let i = 0; i < parameters.length; i++) {
      const p = resolveParam(parameters[i]);
      if (p.in === type) result.push({ key: p.name, value: "" });
    }
    return result;
  };

  const extractBody = (details: any) => {
    if (details.requestBody?.content?.['application/json']) {
      const content = details.requestBody.content['application/json'];
      if (content.example) return typeof content.example === 'string' ? content.example : JSON.stringify(content.example, null, 2);
      if (content.schema?.example) return typeof content.schema.example === 'string' ? content.schema.example : JSON.stringify(content.schema.example, null, 2);
      return "{\n  \n}";
    }
    const params = Array.isArray(details.parameters) ? details.parameters : [];
    for (let i = 0; i < params.length; i++) {
      const p = resolveParam(params[i]);
      if (p.in === 'body') {
        if (p.schema?.example) return typeof p.schema.example === 'string' ? p.schema.example : JSON.stringify(p.schema.example, null, 2);
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
          name: details.summary || details.description || details.operationId || pathKey,
          folder: details.tags?.[0] || "",
          method: lowerMethod.toUpperCase(),
          path: pathKey,
          headers: extractParams(allParams, 'header'),
          params: extractParams(allParams, 'query'),
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
  if (data.variable && Array.isArray(data.variable)) {
    const baseUrlVar = data.variable.find((v: any) => v.key.toLowerCase().includes("url"));
    if (baseUrlVar) return baseUrlVar.value;
  }
  if (data.item?.[0]?.request?.url?.raw) {
    try {
      const rawUrl = data.item[0].request.url.raw as string;
      const match = rawUrl.match(/^(https?:\/\/[^\/]+)/);
      if (match) return match[1];
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

        const queryParams = req.url?.query?.map((q: any) => ({ key: q.key, value: q.value || "" })) || [];
        const headers = req.header?.map((h: any) => ({ key: h.key, value: h.value })) || [];

        endpoints.push({
          id: Math.random().toString(36).substring(2, 11),
          name: item.name || "Unnamed Request",
          folder: parentPath,
          method: req.method || "GET",
          path: rawUrl,
          headers,
          params: queryParams,
          body: req.body?.raw || ""
        });
      }
    });
  };

  parsePostmanItems(data.item);
  return endpoints;
}

export function processPostmanData(data: any): any {
  const initialData: any = {
    isRawMode: true,
    rawConfig: JSON.stringify(data, null, 2),
    type: "POSTMAN",
    systemName: data.info.name || "Postman API",
    integrationCode: toValidCode(data.info.name || "POSTMAN"),
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
