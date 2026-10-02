import { Injectable, BadRequestException } from '@nestjs/common';
import * as yaml from 'js-yaml';
import { Collection } from 'postman-collection';

export interface ParsedEndpoint {
  method: string;
  path: string;
  name: string;
  description: string;
  status?: 'NEW' | 'CONFLICT';
}

export interface ParseResult {
  systemName: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
}

@Injectable()
export class ImportParserService {
  async parseFileOrText(content: string, filename?: string): Promise<ParseResult> {
    const isYaml = filename?.endsWith('.yaml') || filename?.endsWith('.yml') || (!content.trim().startsWith('{') && !content.trim().startsWith('curl'));
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
      throw new BadRequestException('Định dạng file không hợp lệ (Không phải JSON hoặc YAML hợp lệ).');
    }

    if (parsedJson.info && parsedJson.item) {
      return this.parsePostman(parsedJson);
    } else if (parsedJson.swagger || parsedJson.openapi) {
      return this.parseSwaggerOpenApi(parsedJson);
    } else {
      throw new BadRequestException('Không nhận diện được định dạng (Chỉ hỗ trợ OpenAPI/Swagger, Postman, cURL).');
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
          if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) continue;
          const details: any = detailsObj;
          endpoints.push({
            method: method.toUpperCase(),
            path: this.normalizePath(path),
            name: details.summary || details.operationId || path,
            description: details.description || '',
          });
        }
      }

      return {
        systemName: apiObj.info?.title || 'Imported Swagger/OpenAPI',
        baseUrl,
        endpoints
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
        const baseUrlVar = data.variable.find((v: any) => v.key.toLowerCase().includes("url") || v.key.toLowerCase().includes("host"));
        if (baseUrlVar) baseUrl = baseUrlVar.value;
      }

      collection.forEachItem((item) => {
        const req = item.request;
        if (req) {
          const rawUrl = typeof req.url === 'string' ? req.url : req.url?.getRaw() || '';
          if (!baseUrl && rawUrl.startsWith('http')) {
             const match = rawUrl.match(/^(https?:\/\/[^\/]+)/);
             if (match) baseUrl = match[1];
          }
          
          let path = '';
          if (typeof req.url !== 'string' && req.url?.path) {
            path = '/' + req.url.path.join('/');
          } else {
            const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `http://dummy${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`);
            path = urlObj.pathname;
          }
          
          const desc: any = req.description;
          endpoints.push({
            method: req.method?.toUpperCase() || 'GET',
            path: this.normalizePath(path),
            name: item.name || path,
            description: desc?.content || (typeof desc === 'string' ? desc : ''),
          });
        }
      });

      return {
        systemName: data.info?.name || 'Imported Postman Collection',
        baseUrl,
        endpoints
      };
    } catch (e) {
      throw new BadRequestException('Lỗi khi phân tích Postman file.');
    }
  }

  private parseCurl(curlString: string): ParseResult {
    try {
      let url = "";
      const urlMatch = curlString.match(/'(https?:\/\/[^']+)'/);
      if (urlMatch) {
        url = urlMatch[1];
      } else {
        const fallbackMatch = curlString.match(/curl (?:\s+--location)?\s+['"]?(https?:\/\/[^\s'"]+)['"]?/);
        if (fallbackMatch) {
          url = fallbackMatch[1];
        }
      }

      if (!url) {
        throw new Error('No URL found');
      }

      const urlObj = new URL(url);
      
      let dataStr = "";
      const dataMatch = curlString.match(/--data(?:-raw)?\s+'([^']+)'/);
      if (dataMatch) {
        dataStr = dataMatch[1];
      } else {
        const dataMatchDouble = curlString.match(/--data(?:-raw)?\s+"([^"]+)"/);
        if (dataMatchDouble) {
          dataStr = dataMatchDouble[1];
        }
      }

      let method = dataStr ? "POST" : "GET";
      const methodMatch = curlString.match(/-(?:X|request)\s+'?([A-Z]+)'?/);
      if (methodMatch) {
        method = methodMatch[1].toUpperCase();
      }

      const path = urlObj.pathname;

      return {
        systemName: urlObj.hostname || 'Imported cURL',
        baseUrl: `${urlObj.protocol}//${urlObj.host}`,
        endpoints: [
          {
            method,
            path: this.normalizePath(path),
            name: 'API từ cURL',
            description: ''
          }
        ]
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
