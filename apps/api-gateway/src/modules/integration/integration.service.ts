import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(private readonly prisma: PrismaService) { }

  private getNginxConfigPath(): string {
    const cwd = process.cwd();
    const pathsToTry = [
      path.join(cwd, 'nginx', 'conf.d', 'default.conf'),
      path.join(cwd, '..', '..', 'nginx', 'conf.d', 'default.conf'),
      path.join('/app', 'nginx', 'conf.d', 'default.conf'),
      process.env.NGINX_CONF_PATH,
    ];

    for (const p of pathsToTry) {
      if (p && fs.existsSync(p)) {
        return p;
      }
    }
    return path.join(cwd, '..', '..', 'nginx', 'conf.d', 'default.conf');
  }

  async applyGatewayConfig(id: string) {
    const config = await this.prisma.gatewayConfig.findUnique({
      where: { id },
      include: { routes: true },
    });
    if (!config)
      throw new HttpException(
        'Không tìm thấy cấu hình Gateway',
        HttpStatus.NOT_FOUND,
      );

    // Xử lý ghi file SSL nếu HTTPS được bật
    if (config.enableHttps && config.sslCert && config.sslKey) {
      const sslDir = path.join(process.cwd(), 'nginx', 'ssl');
      if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(sslDir, 'gateway.crt'),
        config.sslCert,
        'utf8',
      );
      await fs.promises.writeFile(
        path.join(sslDir, 'gateway.key'),
        config.sslKey,
        'utf8',
      );
      this.logger.log('Đã cập nhật file SSL vật lý.');
    }

    let contentToApply = config.rawConfig;
    if (!contentToApply) {
      // Sinh cấu hình cơ bản nếu không có cấu hình thô
      contentToApply = `# Auto-generated config cho ${config.provider}\n`;
      contentToApply += `server {\n    listen ${config.httpPort};\n`;
      if (config.enableHttps)
        contentToApply += `    listen ${config.httpsPort} ssl;\n`;
      contentToApply += `\n    # Routes\n`;
      for (const route of config.routes) {
        contentToApply += `    location ${route.path} {\n        proxy_pass ${route.targetService};\n    }\n`;
      }
      contentToApply += `}\n`;
    }

    try {
      const confPath = this.getNginxConfigPath();
      const dir = path.dirname(confPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await fs.promises.writeFile(confPath, contentToApply, 'utf8');
      this.logger.log(`Updated Gateway config at: ${confPath}`);

      // Kích hoạt config này trong DB
      await this.prisma.gatewayConfig.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
      await this.prisma.gatewayConfig.update({
        where: { id },
        data: { isActive: true },
      });

      return true;
    } catch (error) {
      this.logger.error(`Lỗi ghi cấu hình: ${error.message}`);
      throw new HttpException(
        'Không thể ghi file cấu hình Gateway',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGatewayConfigs() {
    return this.prisma.gatewayConfig.findMany({ include: { routes: true } });
  }

  async getActiveGatewayConfig() {
    return this.prisma.gatewayConfig.findFirst({
      where: { isActive: true },
      include: { routes: true },
    });
  }

  async createGatewayConfig(data: any) {
    const { routes, ...rest } = data;
    return this.prisma.gatewayConfig.create({
      data: {
        ...rest,
        routes: routes ? { create: routes } : undefined,
      },
      include: { routes: true },
    });
  }

  async updateGatewayConfig(id: string, data: any) {
    const { routes, ...rest } = data;
    // Cập nhật routes: đơn giản xoá routes cũ, tạo routes mới
    if (routes) {
      await this.prisma.gatewayRoute.deleteMany({ where: { gatewayId: id } });
    }
    return this.prisma.gatewayConfig.update({
      where: { id },
      data: {
        ...rest,
        routes: routes ? { create: routes } : undefined,
      },
      include: { routes: true },
    });
  }

  async deleteGatewayConfig(id: string) {
    return this.prisma.gatewayConfig.delete({ where: { id } });
  }

  async getGatewayEndpoints() {
    return this.prisma.serviceEndpoint.findMany();
  }

  async addServiceEndpoint(data: any) {
    return this.prisma.serviceEndpoint.create({ data });
  }

  async getApiPermissions(): Promise<any[]> {
    try {
      const rules = await this.prisma.apiPermission.findMany({
        select: {
          path: true,
          method: true,
          permissions: true,
        },
      });
      return rules;
    } catch (error) {
      this.logger.error(
        `Error reading API permissions from DB: ${error.message}`,
      );
      return [];
    }
  }

  async updateApiPermissions(rules: any[]): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.apiPermission.deleteMany();
        if (rules.length > 0) {
          await prisma.apiPermission.createMany({
            data: rules.map((rule) => ({
              path: rule.path,
              method: rule.method,
              permissions: rule.permissions,
            })),
          });
        }
      });
      this.logger.log('Updated API permissions config in DB');
      return true;
    } catch (error) {
      this.logger.error(
        `Error writing API permissions config: ${error.message}`,
      );
      throw new HttpException(
        'Không thể ghi dữ liệu phân quyền API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLgspConfigs() {
    return this.prisma.lgspIntegrationConfig.findMany();
  }

  async addLgspConfig(data: any) {
    return this.prisma.lgspIntegrationConfig.create({ data });
  }

  async executeLgspService(id: string, dynamicParams?: any) {
    const config = await this.prisma.lgspIntegrationConfig.findUnique({
      where: { id },
    });
    if (!config)
      throw new HttpException(
        'Không tìm thấy cấu hình LGSP',
        HttpStatus.NOT_FOUND,
      );

    let token = config.cachedToken;
    if (config.authType === 'LOGIN_ENDPOINT' && config.authUrl) {
      const now = new Date();
      if (!token || !config.tokenExpiresAt || config.tokenExpiresAt < now) {
        try {
          const loginRes = await fetch(config.authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config.authPayload || {}),
          });
          const loginData = await loginRes.json();

          if (config.tokenPath) {
            token = config.tokenPath
              .split('.')
              .reduce((o: any, i: string) => (o ? o[i] : null), loginData);

            await this.prisma.lgspIntegrationConfig.update({
              where: { id },
              data: {
                cachedToken: token,
                tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
              },
            });
          }
        } catch (err: any) {
          this.logger.error(`LGSP Auth Error: ${err.message}`);
          throw new HttpException(
            'Lỗi xác thực LGSP',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }

    const requestParams = {
      ...((config.requestParams as any) || {}),
      ...(dynamicParams || {}),
    };

    // Placeholder cho gọi api thật. UI có thể dùng dữ liệu này để gọi hoặc Backend fetch và trả data
    return {
      success: true,
      serviceName: config.name,
      apiUrl: config.apiUrl,
      resolvedToken: token,
      paramsToUse: requestParams,
      displayType: config.displayType,
      chartConfig: config.chartConfig,
    };
  }
}
