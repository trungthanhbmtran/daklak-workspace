import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class GatewayRegistryService implements OnModuleInit {
  private readonly logger = new Logger(GatewayRegistryService.name);
  private grpcService: any;
  /** Fail-fast: token nội bộ bắt buộc từ env, không fallback */
  private readonly internalToken: string;

  // Local Memory Cache for Gateway
  private activeConnections = new Map<string, any>();
  private connectionsByCode = new Map<string, any>();
  private currentRevisionVersion = 0;
  private currentRevisionChecksum = '';

  constructor(
    @Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)
    private readonly client: ClientGrpc,
  ) {
    const token = process.env.INTERNAL_TOKEN;
    if (!token) {
      throw new Error('INTERNAL_TOKEN env is required');
    }
    this.internalToken = token;
  }

  async onModuleInit() {
    this.grpcService = this.client.getService('ApiManagementService');
    this.logger.log('Gateway Registry Initialized. Syncing initial connections...');
    try {
      await this.initialSync();
    } catch (e: any) {
      this.logger.warn(`Initial registry sync delayed: ${e?.message}`);
    }
  }

  async initialSync() {
    try {
      const meta = new Metadata();
      meta.add('x-internal-token', this.internalToken);
      const res = (await firstValueFrom(
        this.grpcService.ListConnections({ limit: 100, offset: 0 }, meta),
      )) as any;
      if (Array.isArray(res?.data)) {
        for (const conn of res.data) {
          this.activeConnections.set(conn.id, conn);
          this.connectionsByCode.set(conn.code, conn);
        }
        this.logger.log(
          `[Registry] Loaded ${this.activeConnections.size} connections via initial gRPC sync.`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not load initial connections from user-service: ${err?.message}`,
      );
    }
  }

  // Called when API_CONNECTION_DENY is received
  async handleEmergencyDeny(payload: {
    connectionId: string;
    timestamp: string;
  }) {
    this.logger.warn(
      `[Registry] Emergency Deny received for connection ${payload.connectionId}`,
    );
    if (this.activeConnections.has(payload.connectionId)) {
      this.activeConnections.delete(payload.connectionId);
      this.logger.warn(
        `[Registry] Connection ${payload.connectionId} evicted from cache.`,
      );
    }
  }

  // Called when API_REVISION_SYNC is received
  async syncRevision(payload: { revisionVersion: number; checksum: string }) {
    this.logger.log(
      `[Registry] Sync Revision Event: ${payload.revisionVersion}`,
    );

    // Ignore if older or same version
    if (payload.revisionVersion <= this.currentRevisionVersion) {
      this.logger.debug(
        `[Registry] Revision ${payload.revisionVersion} ignored (current: ${this.currentRevisionVersion})`,
      );
      return;
    }

    try {
      // Pull full snapshot via gRPC
      const meta = new Metadata();
      meta.add('x-internal-token', this.internalToken);
      const res = (await firstValueFrom(
        this.grpcService.GetSnapshot(
          {
            currentEtag: this.currentRevisionChecksum,
          },
          meta,
        ),
      )) as any;

      if (!res.connections || !Array.isArray(res.connections)) {
        throw new Error('Invalid snapshot payload received from gRPC');
      }

      // Build new registry map
      const newMap = new Map<string, any>();
      const newCodeMap = new Map<string, any>();
      for (const conn of res.connections) {
        newMap.set(conn.id, conn);
        newCodeMap.set(conn.code, conn);
      }

      // Atomic swap
      this.activeConnections = newMap;
      this.connectionsByCode = newCodeMap;
      this.currentRevisionVersion = payload.revisionVersion;
      this.currentRevisionChecksum = payload.checksum;

      this.logger.log(
        `[Registry] Successfully swapped to Revision v${payload.revisionVersion}. Total connections active: ${newMap.size}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Registry] Failed to sync revision ${payload.revisionVersion}: ${error.message}`,
      );
    }
  }

  getActiveConnectionByCode(code: string) {
    return this.connectionsByCode.get(code);
  }

  getActiveConnection(id: string) {
    return this.activeConnections.get(id);
  }

  getAllConnections() {
    return Array.from(this.activeConnections.values());
  }
}
