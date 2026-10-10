import { Injectable, BadRequestException } from '@nestjs/common';
import * as yaml from 'js-yaml';
import { Collection } from 'postman-collection';

export interface ParsedEndpoint {
  id?: string;
  folder?: string;
  method: string;
  path: string;
  name: string;
  description: string;
  status?: 'NEW' | 'CONFLICT';
  headers?: Array<{
    key: string;
    value: string;
    type?: string;
    required?: boolean;
    enabled?: boolean;
    description?: string;
  }>;
  params?: Array<{
    key: string;
    value: string;
    in?: 'query' | 'path';
    type?: string;
    required?: boolean;
    enabled?: boolean;
    description?: string;
  }>;
  body?: string;
  bodyType?: 'none' | 'raw' | 'x-www-form-urlencoded' | 'form-data';
  formItems?: Array<{
    key: string;
    value: string;
    enabled?: boolean;
    description?: string;
  }>;
}

export interface ParseResult {
  systemName: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
}

@Injectable()
export class ImportParserService {
  async parseFileOrText(
    content: string,
    filename?: string,
  ): Promise<ParseResult> {
    const isYaml =
      filename?.endsWith('.yaml') ||
      filename?.endsWith('.yml') ||
      (!content.trim().startsWith('{') && !content.trim().startsWith('curl'));
    const isCurl = content.trim().toLowerCase().startsWith('curl');

    if (isCurl) {
      return this.parseCurl(content);
    }

    let parsedJson: any;
    try {
      if (isYaml) {
        parsedJson = yaml.load(content);
      } else {
        parsedJson = JSON.parse(content);
      }
    } catch (e) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ (Không phải JSON hoặc YAML hợp lệ).',
      );
    }

    if (parsedJson.info && parsedJson.item) {
      return this.parsePostman(parsedJson);
    } else if (parsedJson.swagger || parsedJson.openapi) {
      return this.parseSwaggerOpenApi(parsedJson);
    } else {
      throw new BadRequestException(
        'Không nhận diện được định dạng (Chỉ hỗ trợ OpenAPI/Swagger, Postman, cURL).',
      );
    }
  }

  private async parseSwaggerOpenApi(apiObj: any): Promise<ParseResult> {
    try {
      const endpoints: ParsedEndpoint[] = [];
      const paths = apiObj.paths || {};

      let baseUrl = '';
      if (apiObj.servers && apiObj.servers.length > 0) {
        baseUrl = apiObj.servers[0].url;
      } else if (apiObj.host) {
        const scheme = apiObj.schemes?.[0] || 'https';
        baseUrl = `${scheme}://${apiObj.host}${apiObj.basePath || ''}`;
      }

      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, detailsObj] of Object.entries(methods as any)) {
          if (
            !['get', 'post', 'put', 'delete', 'patch'].includes(
              method.toLowerCase(),
            )
          )
            continue;
          const details: any = detailsObj;

          const headers: any[] = [];
          const params: any[] = [];
          const pathParameters = Array.isArray((methods as any).parameters)
            ? (methods as any).parameters
            : [];
          const operationParameters = Array.isArray(details.parameters)
            ? details.parameters
            : [];
          [...pathParameters, ...operationParameters].forEach((p: any) => {
            const value =
              p.example ?? p.schema?.example ?? p.schema?.default ?? '';
            if (p.in === 'header')
              headers.push({
                key: p.name,
                value,
                type: p.schema?.type || 'string',
                required: p.required === true,
                description: p.description,
                enabled: true,
              });
            if (p.in === 'query')
              params.push({
                key: p.name,
                value,
                in: 'query',
                type: p.schema?.type || 'string',
                required: p.required === true,
                description: p.description,
                enabled: true,
              });
            if (p.in === 'path')
              params.push({
                key: p.name,
                value,
                in: 'path',
                type: p.schema?.type || 'string',
                required: p.required !== false,
                description: p.description,
                enabled: true,
              });
          });

          let body = '';
          let bodyType = 'none';
          if (details.requestBody && details.requestBody.content) {
            const contentTypes = Object.keys(details.requestBody.content);
            if (contentTypes.length > 0) {
              const mainType = contentTypes[0];
              bodyType =
                mainType.includes('json') ||
                mainType.includes('xml') ||
                mainType.includes('text')
                  ? 'raw'
                  : mainType.includes('x-www-form-urlencoded')
                    ? 'x-www-form-urlencoded'
                    : mainType.includes('form')
                      ? 'form-data'
                      : 'raw';
              const mediaType = details.requestBody.content[mainType];
              const bodyExample =
                mediaType.example ?? mediaType.schema?.example;
              if (bodyExample !== undefined) {
                body =
                  typeof bodyExample === 'string'
                    ? bodyExample
                    : JSON.stringify(bodyExample, null, 2);
              } else if (mediaType.schema) {
                body = JSON.stringify(mediaType.schema, null, 2);
              }
            }
          }

          endpoints.push({
            id: `ep-${Math.random().toString(36).substring(2, 9)}`,
            folder: '',
            method: method.toUpperCase(),
            path: this.normalizePath(path),
            name: details.summary || details.operationId || path,
            description: details.description || '',
            headers,
            params,
            body,
            bodyType: bodyType as any,
          });
        }
      }

      return {
        systemName: apiObj.info?.title || 'Imported Swagger/OpenAPI',
        baseUrl,
        endpoints,
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi phân tích OpenAPI/Swagger file.');
    }
  }

  private parsePostman(data: any): ParseResult {
    try {
      const collection = new Collection(data);
      const endpoints: ParsedEndpoint[] = [];

      let baseUrl = '';
      if (data.variable && Array.isArray(data.variable)) {
        const baseUrlVar = data.variable.find(
          (v: any) =>
            v.key.toLowerCase().includes('url') ||
            v.key.toLowerCase().includes('host'),
        );
        if (baseUrlVar) baseUrl = baseUrlVar.value;
      }

      collection.forEachItem((item) => {
        const req = item.request;
        if (req) {
          const rawUrl =
            typeof req.url === 'string' ? req.url : req.url?.toString() || '';
          if (!baseUrl && rawUrl.startsWith('http')) {
            const match = rawUrl.match(/^(https?:\/\/[^\/]+)/);
            if (match) baseUrl = match[1];
          }

          let path = '';
          if (typeof req.url !== 'string' && req.url?.path) {
            path = '/' + req.url.path.join('/');
          } else {
            const urlObj = new URL(
              rawUrl.startsWith('http')
                ? rawUrl
                : `http://dummy${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`,
            );
            path = urlObj.pathname;
          }

          const desc: any = req.description;

          const headers = req.headers
            ? req.headers.map((h: any) => ({
                key: h.key,
                value: h.value,
                enabled: h.disabled !== true,
                description: h.description,
              }))
            : [];
          const params =
            typeof req.url !== 'string' && req.url?.query
              ? req.url.query.map((q: any) => ({
                  key: q.key,
                  value: q.value,
                  enabled: q.disabled !== true,
                  description: q.description,
                }))
              : [];

          let body = '';
          let bodyType = 'none';
          let formItems: any[] = [];

          if (req.body) {
            if (req.body.mode === 'raw') {
              body = req.body.raw || '';
              bodyType = 'raw';
            } else if (req.body.mode === 'formdata') {
              bodyType = 'form-data';
              if (Array.isArray(req.body.formdata)) {
                formItems = req.body.formdata.map((f: any) => ({
                  key: f.key,
                  value: f.value || '',
                  enabled: f.disabled !== true,
                }));
              }
            } else if (req.body.mode === 'urlencoded') {
              bodyType = 'x-www-form-urlencoded';
              if (Array.isArray(req.body.urlencoded)) {
                formItems = req.body.urlencoded.map((f: any) => ({
                  key: f.key,
                  value: f.value || '',
                  enabled: f.disabled !== true,
                }));
              }
            }
          }

          endpoints.push({
            id: `ep-${Math.random().toString(36).substring(2, 9)}`,
            folder: '',
            method: req.method?.toUpperCase() || 'GET',
            path: this.normalizePath(path),
            name: item.name || path,
            description:
              desc?.content || (typeof desc === 'string' ? desc : ''),
            headers,
            params,
            body,
            bodyType: bodyType as any,
            formItems,
          });
        }
      });

      return {
        systemName: data.info?.name || 'Imported Postman Collection',
        baseUrl,
        endpoints,
      };
    } catch (e: any) {
      console.error('Postman parse error:', e);
      throw new BadRequestException(
        `Lỗi khi phân tích Postman file: ${e.message || 'Lỗi không xác định'}`,
      );
    }
  }

  private parseCurl(curlString: string): ParseResult {
    try {
      let url = '';
      const urlMatch = curlString.match(/'(https?:\/\/[^']+)'/);
      if (urlMatch) {
        url = urlMatch[1];
      } else {
        const fallbackMatch = curlString.match(
          /curl (?:\s+--location)?\s+['"]?(https?:\/\/[^\s'"]+)['"]?/,
        );
        if (fallbackMatch) {
          url = fallbackMatch[1];
        }
      }

      if (!url) {
        throw new Error('No URL found');
      }

      const urlObj = new URL(url);

      let dataStr = '';
      const dataMatch = curlString.match(/--data(?:-raw)?\s+'([^']+)'/);
      if (dataMatch) {
        dataStr = dataMatch[1];
      } else {
        const dataMatchDouble = curlString.match(/--data(?:-raw)?\s+"([^"]+)"/);
        if (dataMatchDouble) {
          dataStr = dataMatchDouble[1];
        }
      }

      let method = dataStr ? 'POST' : 'GET';
      const methodMatch = curlString.match(/-(?:X|request)\s+'?([A-Z]+)'?/);
      if (methodMatch) {
        method = methodMatch[1].toUpperCase();
      }

      const path = urlObj.pathname;

      const headers: any[] = [];
      const headerRegex = /-(?:H|-header)\s+['"]([^:]+):\s*([^'"]+)['"]/g;
      let headerMatch;
      while ((headerMatch = headerRegex.exec(curlString)) !== null) {
        headers.push({
          key: headerMatch[1],
          value: headerMatch[2],
          enabled: true,
        });
      }

      const params: any[] = [];
      urlObj.searchParams.forEach((val, key) => {
        params.push({ key, value: val, enabled: true });
      });

      return {
        systemName: urlObj.hostname || 'Imported cURL',
        baseUrl: `${urlObj.protocol}//${urlObj.host}`,
        endpoints: [
          {
            id: `ep-${Math.random().toString(36).substring(2, 9)}`,
            folder: '',
            method,
            path: this.normalizePath(path),
            name: 'API từ cURL',
            description: '',
            headers,
            params,
            body: dataStr,
            bodyType: dataStr ? 'raw' : 'none',
          },
        ],
      };
    } catch (e) {
      throw new BadRequestException('Lỗi phân tích lệnh cURL.');
    }
  }

  private normalizePath(path: string): string {
    if (!path) return '/';
    // Replace swagger/postman params {id}, :id with uniform format or just keep them
    // Ensure starts with /
    if (!path.startsWith('/')) path = '/' + path;
    // Remove trailing slash
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }
}
