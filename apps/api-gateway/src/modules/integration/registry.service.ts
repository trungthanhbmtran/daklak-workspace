import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { Pool } from 'undici';
import CircuitBreaker from 'opossum';
import { EventPattern, Payload } from '@nestjs/microservices';
import { checkUpstreamNetwork, guardedUpstreamLookup } from './upstream-network';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

export interface UpstreamConfig {
  name: string;
  type: string; // 'internal' | 'external'
  baseUrl: string;
  allowedPaths: string[];
  allowedMethods: string[];
  auth: any;
  timeoutMs: number;
  retry: any;
  cacheTtlSec: number;
  rateLimit: any;
  roles: string[];
  scopes: string[];
  version: number;
  enabled?: boolean;
}

export interface UpstreamState {
  config: UpstreamConfig;
  pool: Pool;
  breaker: CircuitBreaker<any, any>;
}

@Injectable()
export class RegistryService implements OnModuleInit {
  private readonly logger = new Logger(RegistryService.name);
  
  private upstreams = new Map<string, UpstreamState>();
  private currentVersion = 0;
  private currentEtag = '';
  private isReady = false;
  private grpcService: any;

  constructor(@Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any) {}

  async onModuleInit() {
    this.grpcService = this.client.getService(MICROSERVICES.INTEGRATION.SERVICE);

    await this.fetchInitialSnapshot();
    
    setInterval(() => {
      this.pollSnapshot().catch(err => this.logger.error(`Polling failed: ${err.message}`));
    }, 30000);
  }

  private async fetchInitialSnapshot() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.pollSnapshot();
        this.isReady = true;
        this.logger.log('Initial registry snapshot loaded successfully.');
        return;
      } catch (err: any) {
        this.logger.warn(`Failed to fetch initial snapshot. Retries left: ${retries - 1}. Error: ${err.message}`);
        retries--;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    this.logger.error('CRITICAL: Could not fetch initial snapshot. Gateway cannot serve traffic.');
  }

  private async pollSnapshot() {
    try {
      const data = (await firstValueFrom(this.grpcService.GetSnapshot({}))) as any;
      if (!data || data.etag === this.currentEtag) {
        return; // No changes
      }

      let upstreamsList: UpstreamConfig[] = [];
      try {
        upstreamsList = JSON.parse(data.upstreams);
      } catch (e) {
        this.logger.error('Failed to parse upstreams JSON from gRPC', e);
        return;
      }

      await this.applySnapshot(upstreamsList, data.version, data.etag);
    } catch (error) {
      throw error;
    }
  }

  private async applySnapshot(upstreamsList: UpstreamConfig[], version: number, etag: string) {
    const newUpstreams = new Map<string, UpstreamState>();

    for (const conf of upstreamsList) {
      if (!conf.enabled) continue;

      const existing = this.upstreams.get(conf.name);
      if (existing && existing.config.version === conf.version) {
        newUpstreams.set(conf.name, existing);
        continue;
      }

      // SSRF Check at snapshot time
      try {
        await this.checkSsrf(conf);
      } catch (err: any) {
        this.logger.error(`SSRF Protection triggered for ${conf.name}: ${err.message}. Skipping upstream.`);
        continue;
      }

      // Need to create new Pool & Breaker
      const pool = new Pool(conf.baseUrl, {
        connections: 100, // Bulkhead
        keepAliveTimeout: 10000,
        keepAliveMaxTimeout: 15000,
        connect: { lookup: guardedUpstreamLookup(conf.type) },
      });

      const executeRequest = async (reqOptions: any) => {
        return pool.request(reqOptions);
      };

      const breaker = new CircuitBreaker(executeRequest, {
        timeout: conf.timeoutMs || 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
      });

      // Handle old pool cleanup
      if (existing) {
        existing.pool.close().catch(() => {});
      }

      newUpstreams.set(conf.name, { config: conf, pool, breaker });
    }

    // Close removed upstreams
    for (const [name, state] of this.upstreams.entries()) {
      if (!newUpstreams.has(name)) {
        state.pool.close().catch(() => {});
      }
    }

    this.upstreams = newUpstreams;
    this.currentVersion = version;
    this.currentEtag = etag || '';
    this.logger.log(`Applied new registry snapshot v${version}`);
  }

  @EventPattern('registry.changed')
  async handleRegistryChanged(@Payload() data: any) {
    this.logger.log(`Received registry.changed event for ${data.upstream}`);
    // Trigger an immediate poll to get the authoritative state
    await this.pollSnapshot().catch(err => this.logger.error(`Event sync failed: ${err.message}`));
  }

  public getUpstream(name: string): UpstreamState | undefined {
    return this.upstreams.get(name);
  }

  public getReportSourceConfigs(): UpstreamConfig[] {
    return [...this.upstreams.values()].map(state => state.config);
  }

  public checkReady(): boolean {
    return this.isReady;
  }

  private async checkSsrf(conf: UpstreamConfig) {
    await checkUpstreamNetwork(conf.baseUrl, conf.type);
  }
}
