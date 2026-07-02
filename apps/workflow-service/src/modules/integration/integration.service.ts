/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, prettier/prettier, @typescript-eslint/require-await */
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.integrationConnection.create({ data });
  }

  async findAll() {
    return this.prisma.integrationConnection.findMany();
  }

  async findOne(id: string) {
    return this.prisma.integrationConnection.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.integrationConnection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.integrationConnection.delete({ where: { id } });
  }

  async parsePostmanCollection(jsonString: string) {
    try {
      const collection = JSON.parse(jsonString);
      if (!collection.info || !collection.item) {
        throw new HttpException(
          'Invalid Postman Collection format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const endpoints: any[] = [];

      const extractItems = (items: any[], prefix = '') => {
        for (const item of items) {
          if (item.item) {
            extractItems(item.item, prefix + item.name + ' / ');
          } else if (item.request) {
            const method = item.request.method;
            let path = '';
            if (item.request.url) {
              if (typeof item.request.url === 'string') {
                path = item.request.url;
              } else if (item.request.url.path) {
                path = '/' + item.request.url.path.join('/');
              }
            }
            endpoints.push({
              name: prefix + item.name,
              method: method,
              path: path,
              headers: item.request.header || [],
              body: item.request.body ? item.request.body.raw : null,
            });
          }
        }
      };

      extractItems(collection.item);
      return {
        name: collection.info.name,
        endpoints,
      };
    } catch (e) {
      this.logger.error('Parse postman error', e);
      throw new HttpException(
        'Failed to parse Postman JSON',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async parseSwagger(jsonString: string) {
    try {
      const swagger = JSON.parse(jsonString);
      const endpoints: any[] = [];
      const paths = swagger.paths || {};

      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries<any>(methods as any)) {
          endpoints.push({
            name: details.summary || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            path: path,
            parameters: details.parameters || [],
          });
        }
      }
      return {
        name: swagger.info?.title || 'Imported Swagger',
        baseUrl: swagger.servers?.[0]?.url || '',
        endpoints,
      };
    } catch (e) {
      this.logger.error('Parse swagger error', e);
      throw new HttpException(
        'Failed to parse Swagger JSON',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async executeIntegration(code: string, endpointPath: string, payload: any) {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: { code },
    });
    if (!connection)
      throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
    if (!connection.isActive)
      throw new HttpException(
        'Integration is inactive',
        HttpStatus.BAD_REQUEST,
      );

    const headers: any =
      typeof connection.headers === 'string'
        ? JSON.parse(connection.headers)
        : connection.headers || {};

    // Auth logic
    const auth: any = connection.authConfig;
    if (auth) {
      if (auth.type === 'BEARER' && auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      } else if (auth.type === 'API_KEY' && auth.keyName && auth.token) {
        headers[auth.keyName] = auth.token;
      }
    }

    try {
      const targetUrl = `${connection.baseUrl.replace(/\/$/, '')}${endpointPath}`;
      // Log outgoing request (optional)
      this.logger.log(`Executing integration ${code} -> ${targetUrl}`);

      const response = await axios({
        method: payload.method || 'POST',
        url: targetUrl,
        headers,
        data: payload.data,
        params: payload.params,
      });

      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(
        `Integration execute error ${code}`,
        error.response?.data || error.message,
      );
      return {
        success: false,
        status: error.response?.status || 500,
        error: error.response?.data || error.message,
      };
    }
  }
}
