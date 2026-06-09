import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../constants/services';
import * as http from 'http';

@Injectable()
export class EndpointDiscoveryService implements OnApplicationBootstrap {
  private pbacService: any;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
  ) {}

  async onApplicationBootstrap() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
    
    // Khởi động chờ 2 giây để Swagger tạo xong
    setTimeout(() => {
      try {
        http.get('http://localhost:8080/api/v1/docs-json', (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', async () => {
            try {
              const swagger = JSON.parse(data);
              const routes: { method: string; path: string }[] = [];
              for (const [path, methods] of Object.entries(swagger.paths || {})) {
                for (const method of Object.keys(methods as object)) {
                  routes.push({ method: method.toUpperCase(), path });
                }
              }
              const filteredRoutes = routes.filter(r => r.path.startsWith('/api') || r.path.startsWith('/admin'));
              if (filteredRoutes.length > 0) {
                 await firstValueFrom(this.pbacService.SyncEndpoints({ endpoints: filteredRoutes }));
                 console.log("[Auto-Discovery] Synced " + filteredRoutes.length + " endpoints from Swagger to Database");
              }
            } catch (err) {
               console.error('[Auto-Discovery] Failed to parse swagger or sync endpoints:', err);
            }
          });
        }).on('error', (err) => {
          console.error('[Auto-Discovery] Could not reach Swagger JSON:', err);
        });
      } catch (err) {
        console.error('[Auto-Discovery] Failed to fetch swagger endpoints:', err);
      }
    }, 3000);
  }
}
