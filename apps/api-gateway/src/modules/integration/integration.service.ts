import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  private getNginxConfigPath(): string {
    const cwd = process.cwd();
    // Possible paths depending on where the process is started
    const pathsToTry = [
      path.join(cwd, 'nginx', 'conf.d', 'default.conf'), // If started from workspace root
      path.join(cwd, '..', '..', 'nginx', 'conf.d', 'default.conf'), // If started from apps/api-gateway
      path.join('/app', 'nginx', 'conf.d', 'default.conf'), // If in Docker with volume mounted
      process.env.NGINX_CONF_PATH, // If provided via ENV
    ];

    for (const p of pathsToTry) {
      if (p && fs.existsSync(p)) {
        return p;
      }
    }

    // Default fallback if not found, we'll return the expected workspace path to allow creation or better error
    return path.join(cwd, '..', '..', 'nginx', 'conf.d', 'default.conf');
  }

  async getNginxConfig(): Promise<string> {
    try {
      const confPath = this.getNginxConfigPath();
      if (!fs.existsSync(confPath)) {
        this.logger.warn(`Nginx config not found at: ${confPath}`);
        return '# NGINX configuration file not found.\n# Please ensure the volume is mounted correctly.';
      }
      return await fs.promises.readFile(confPath, 'utf8');
    } catch (error) {
      this.logger.error(`Error reading Nginx config: ${error.message}`);
      throw new HttpException('Không thể đọc file cấu hình Nginx', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateNginxConfig(content: string): Promise<boolean> {
    try {
      const confPath = this.getNginxConfigPath();
      await fs.promises.writeFile(confPath, content, 'utf8');
      this.logger.log(`Updated Nginx config at: ${confPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error writing Nginx config: ${error.message}`);
      throw new HttpException('Không thể ghi file cấu hình Nginx', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // A mock to return current active gateway microservices based on app.module / Swagger
  getGatewayEndpoints() {
    return [
      { id: 'auth', name: 'Auth Service', path: '/api/v1/auth', status: 'Active' },
      { id: 'users', name: 'User Service', path: '/api/v1/users', status: 'Active' },
      { id: 'hrm', name: 'HRM Service', path: '/api/v1/hrm', status: 'Active' },
      { id: 'documents', name: 'Document Service', path: '/api/v1/documents', status: 'Active' },
      { id: 'posts', name: 'Posts Service', path: '/api/v1/posts', status: 'Active' },
      { id: 'media', name: 'Media Service', path: '/api/v1/media', status: 'Active' },
      { id: 'workflow', name: 'Workflow Service', path: '/api/v1/workflow', status: 'Active' },
      { id: 'translate', name: 'Translate Service', path: '/api/v1/translate', status: 'Active' },
      { id: 'ai', name: 'AI Service', path: '/api/v1/ai', status: 'Active' },
    ];
  }

  private getApiPermissionsConfigPath(): string {
    const cwd = process.cwd();
    return path.join(cwd, 'configs', 'api-permissions.json');
  }

  private apiPermissionsCache: any[] | null = null;
  private apiPermissionsCacheTime: number = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getApiPermissions(): Promise<any[]> {
    try {
      const now = Date.now();
      if (this.apiPermissionsCache && now - this.apiPermissionsCacheTime < this.CACHE_TTL) {
        return this.apiPermissionsCache;
      }

      const confPath = this.getApiPermissionsConfigPath();
      if (!fs.existsSync(confPath)) {
        return [];
      }
      const data = await fs.promises.readFile(confPath, 'utf8');
      const rules = JSON.parse(data);
      this.apiPermissionsCache = rules;
      this.apiPermissionsCacheTime = now;
      return rules;
    } catch (error) {
      this.logger.error(`Error reading API permissions config: ${error.message}`);
      return []; // fallback to empty array on error
    }
  }

  async updateApiPermissions(rules: any[]): Promise<boolean> {
    try {
      const confPath = this.getApiPermissionsConfigPath();
      const dir = path.dirname(confPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(confPath, JSON.stringify(rules, null, 2), 'utf8');
      this.logger.log(`Updated API permissions config at: ${confPath}`);
      
      // Update cache immediately
      this.apiPermissionsCache = rules;
      this.apiPermissionsCacheTime = Date.now();
      
      return true;
    } catch (error) {
      this.logger.error(`Error writing API permissions config: ${error.message}`);
      throw new HttpException('Không thể ghi file cấu hình phân quyền API', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
