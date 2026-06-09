import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../constants/services';

@Injectable()
export class EndpointDiscoveryService implements OnApplicationBootstrap {
  private pbacService: any;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
  ) {}

  async onApplicationBootstrap() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
    
    // KhO*i dOng chO- 2 giAy dO? pbac service sn sAng
    setTimeout(async () => {
      try {
        const adapter = this.httpAdapterHost.httpAdapter;
        const instance = adapter.getInstance();
        const routes: { method: string; path: string }[] = [];
        
        instance._router.stack.forEach((layer: any) => {
          if (layer.route) {
            const path = layer.route?.path;
            const method = Object.keys(layer.route.methods)[0]?.toUpperCase();
            if (path && method) {
              routes.push({ method, path });
            }
          }
        });

        // LOai bO? cAc route khOng cAAn thiOt (swagger, etc)
        const filteredRoutes = routes.filter(r => r.path.startsWith('/admin') || r.path.startsWith('/api'));
        
        if (filteredRoutes.length > 0) {
           await firstValueFrom(this.pbacService.SyncEndpoints({ endpoints: filteredRoutes }));
           console.log("[Auto-Discovery] Synced " + filteredRoutes.length + " endpoints to Database");
        }
      } catch (err) {
        console.error('[Auto-Discovery] Failed to sync endpoints:', err);
      }
    }, 2000);
  }
}
