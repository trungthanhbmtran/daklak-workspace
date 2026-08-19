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
  if (!str) return "API_ENDPOINT";
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
      if (types.includes(p.in)) {
        let val = p.example !== undefined ? p.example : (p.schema?.example !== undefined ? p.schema.example : "");
        if (typeof val === 'object') val = JSON.stringify(val);
        result.push({ key: p.name || "", value: String(val) });
      }
    }
    return result;
  };

  const extractBody = (details: any, allParams: any[]) => {
    // OpenAPI 3 requestBody
    let reqBody = details.requestBody;
    if (reqBody?.$ref) reqBody = resolveRef(reqBody.$ref) || reqBody;
    
    if (reqBody?.content) {
      const contentKeys = Object.keys(reqBody.content);
      const contentType = contentKeys.includes('application/json') ? 'application/json' : contentKeys[0];
      
      if (contentType) {
          const content = reqBody.content[contentType];
          if (content.example) return typeof content.example === 'string' ? content.example : JSON.stringify(content.example, null, 2);
          if (content.schema) {
             let schema = content.schema;
             if (schema.$ref) schema = resolveRef(schema.$ref) || schema;
             if (schema.example) return typeof schema.example === 'string' ? schema.example : JSON.stringify(schema.example, null, 2);
             
             const skeleton = generateSkeleton(schema);
             return JSON.stringify(skeleton, null, 2);
          }
      }
    }
    
    // Swagger 2 fallback: body parameter
    for (let i = 0; i < allParams.length; i++) {
      const p = resolveParam(allParams[i]);
      if (p.in === 'body') {
        let schema = p.schema;
        if (schema?.$ref) schema = resolveRef(schema.$ref) || schema;
        if (schema?.example) return typeof schema.example === 'string' ? schema.example : JSON.stringify(schema.example, null, 2);
        if (schema) return JSON.stringify(generateSkeleton(schema), null, 2);
        return "{\n  \n}";
      }
    }

    // Swagger 2 fallback: formData parameters
    const formDataParams = allParams.filter(p => resolveParam(p).in === 'formData');
    if (formDataParams.length > 0) {
      const formDataObj: any = {};
      formDataParams.forEach(p => {
         const resolved = resolveParam(p);
         formDataObj[resolved.name] = resolved.example !== undefined ? resolved.example : "";
      });
      return JSON.stringify(formDataObj, null, 2);
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
          params: extractParams(allParams, ['query', 'path']),
          body: extractBody(details, allParams)
        });
      }
    }
  }
  return endpoints;
}

function extractSwaggerAuth(data: any): any {
  let authType = "NONE";
  let authConfig: any = {};

  const schemes = data.securityDefinitions || data.components?.securitySchemes;
  if (schemes) {
    const keys = Object.keys(schemes);
    if (keys.length > 0) {
      const scheme = schemes[keys[0]];
      if (scheme.type === "oauth2") {
        authType = "OAUTH2";
        authConfig.authUrl = scheme.tokenUrl || scheme.authorizationUrl || "";
        authConfig.scope = scheme.scopes ? Object.keys(scheme.scopes).join(" ") : "";
      } else if (scheme.type === "basic") {
        authType = "BASIC";
      } else if (scheme.type === "apiKey") {
        authType = "API_KEY";
        authConfig.clientId = scheme.name || "api_key";
      } else if (scheme.type === "http" && scheme.scheme === "bearer") {
        authType = "BEARER";
      }
    }
  }

  return { authType, authConfig };
}

export function processSwaggerData(data: any): any {
  const authInfo = extractSwaggerAuth(data);

  const initialData: any = {
    isRawMode: false,
    rawConfig: JSON.stringify(data, null, 2),
    type: "LGSP",
    systemName: data.info?.title || "Swagger API",
    integrationCode: toValidCode(data.info?.title || "SWAGGER"),
    apiUrl: extractSwaggerBaseUrl(data),
    authType: authInfo.authType,
    authConfig: authInfo.authConfig
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
    const baseUrlVar = data.variable.find((v: any) => v.key.toLowerCase().includes("url") || v.key.toLowerCase().includes("host"));
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
  if (firstReq?.url?.raw || typeof firstReq?.url === 'string') {
    try {
      const rawUrl = typeof firstReq.url === 'string' ? firstReq.url : (firstReq.url.raw as string);
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
           queryParams = req.url.query.map((q: any) => {
              let val = q.value !== undefined ? q.value : "";
              if (typeof val === 'object') val = JSON.stringify(val);
              return { key: String(q.key || ""), value: String(val) };
           });
        }

        // Safely extract path variables
        let pathVars: any[] = [];
        if (Array.isArray(req.url?.variable)) {
           pathVars = req.url.variable.map((v: any) => {
              let val = v.value !== undefined ? v.value : "";
              if (typeof val === 'object') val = JSON.stringify(val);
              return { key: String(v.key || ""), value: String(val) };
           });
        }

        // Safely extract headers
        let headers: any[] = [];
        if (Array.isArray(req.header)) {
           headers = req.header.map((h: any) => {
              let val = h.value !== undefined ? h.value : "";
              return { key: String(h.key || ""), value: String(val) };
           });
        } else if (typeof req.header === 'string') {
           // Postman sometimes stores headers as a raw string
           headers = req.header.split('\n').filter(Boolean).map((line: string) => {
              const parts = line.split(':');
              return { key: parts[0]?.trim() || "", value: parts.slice(1).join(':')?.trim() || "" };
           }).filter((h: any) => h.key);
        }

        const mapFormDataToObject = (formDataArr: any[]) => {
           if (!Array.isArray(formDataArr)) return {};
           const obj: any = {};
           formDataArr.forEach(item => {
               if (item.key) obj[item.key] = item.value !== undefined ? item.value : "";
           });
           return obj;
        };

        let bodyStr = "";
        if (req.body?.mode === 'raw') {
            bodyStr = req.body.raw || "";
        } else if (req.body?.mode === 'urlencoded') {
            bodyStr = JSON.stringify(mapFormDataToObject(req.body.urlencoded), null, 2);
        } else if (req.body?.mode === 'formdata') {
            bodyStr = JSON.stringify(mapFormDataToObject(req.body.formdata), null, 2);
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
          headers: headers.filter(h => h.key),
          params: [...queryParams, ...pathVars].filter(p => p.key),
          body: bodyStr
        });
      }
    });
  };

  parsePostmanItems(data.item);
  return endpoints;
}

function extractPostmanAuth(data: any): any {
  let authType = "NONE";
  let authConfig: any = {};

  if (data.auth && data.auth.type) {
    if (data.auth.type === "oauth2") authType = "OAUTH2";
    else if (data.auth.type === "bearer") authType = "BEARER";
    else if (data.auth.type === "basic") authType = "BASIC";
    else if (data.auth.type === "apikey") authType = "API_KEY";
    
    if (Array.isArray(data.auth[data.auth.type])) {
      data.auth[data.auth.type].forEach((item: any) => {
        if (item.key === "accessTokenUrl" || item.key === "authUrl") authConfig.authUrl = item.value;
        if (item.key === "clientId") authConfig.clientId = item.value;
        if (item.key === "clientSecret") authConfig.clientSecret = item.value;
        if (item.key === "scope") authConfig.scope = item.value;
        if (item.key === "token") authConfig.apiToken = item.value;
      });
    }
  }

  const scanForTokenRequest = (items: any[]) => {
    if (!items || !Array.isArray(items)) return;
    for (const item of items) {
      if (item.request && item.request.body?.mode === 'urlencoded') {
        const urlencoded = item.request.body.urlencoded;
        if (Array.isArray(urlencoded)) {
          const isClientCredentials = urlencoded.some(x => x.key === 'grant_type' && x.value === 'client_credentials');
          if (isClientCredentials) {
            authType = "OAUTH2";
            const rawUrl = item.request.url?.raw || (typeof item.request.url === 'string' ? item.request.url : "");
            if (rawUrl) authConfig.authUrl = rawUrl.split('?')[0];
            authConfig.clientId = urlencoded.find(x => x.key === 'client_id')?.value || authConfig.clientId;
            authConfig.clientSecret = urlencoded.find(x => x.key === 'client_secret')?.value || authConfig.clientSecret;
            authConfig.scope = urlencoded.find(x => x.key === 'scope')?.value || authConfig.scope;
          }
        }
      }
      if (item.item) scanForTokenRequest(item.item);
    }
  };

  scanForTokenRequest(data.item);

  return { authType, authConfig };
}

export function processPostmanData(data: any): any {
  const authInfo = extractPostmanAuth(data);

  const initialData: any = {
    isRawMode: false,
    rawConfig: JSON.stringify(data, null, 2),
    type: "POSTMAN",
    systemName: data.info?.name || "Postman API",
    integrationCode: toValidCode(data.info?.name || "POSTMAN"),
    apiUrl: extractPostmanBaseUrl(data),
    authType: authInfo.authType,
    authConfig: authInfo.authConfig
  };

  const endpoints = extractPostmanEndpoints(data);

  const finalConfig = {
    ...JSON.parse(initialData.rawConfig),
    _parsedEndpoints: endpoints
  };
  initialData.rawConfig = JSON.stringify(finalConfig, null, 2);

  return initialData;
}
