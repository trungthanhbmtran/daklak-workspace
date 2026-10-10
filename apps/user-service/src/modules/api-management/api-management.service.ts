import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiManagementService {
  private readonly logger = new Logger(ApiManagementService.name);
  constructor(private readonly prisma: PrismaService) {}

  // --- T011: Credential Binding & Encryption ---
  private readonly encryptionKey =
    process.env.CREDENTIAL_SECRET_KEY || '12345678901234567890123456789012'; // 32 bytes

  private encryptSecret(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey.substring(0, 32)),
      iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  private decryptSecret(encryptedString: string): string {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');

    const cipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey.substring(0, 32)),
      iv,
    );
    cipher.setAuthTag(authTag);
    let decrypted = cipher.update(encryptedText, undefined, 'utf8');
    decrypted += cipher.final('utf8');
    return decrypted;
  }

  async resolveCredential(opaqueRef: string) {
    const binding = await this.prisma.credentialBinding.findUnique({
      where: { opaqueRef },
    });
    if (!binding) throw new NotFoundException('Credential binding not found');

    return {
      rawSecret: this.decryptSecret(binding.encryptedData || ''),
      kind: binding.kind,
    };
  }

  private async bindCredential(tx: any, auth: any): Promise<any> {
    if (!auth || typeof auth !== 'object') return auth;

    // If there is a raw secret, encrypt it and create a binding
    if (auth.secret) {
      const opaqueRef = 'cred_' + crypto.randomBytes(8).toString('hex');
      const encryptedData = this.encryptSecret(auth.secret);

      await tx.credentialBinding.create({
        data: {
          opaqueRef,
          kind: auth.kind || 'unknown',
          encryptedData,
        },
      });

      const boundAuth = { ...auth, secretRef: opaqueRef };
      delete boundAuth.secret;
      return boundAuth;
    }

    return auth;
  }

  async listConnections(organizationId: string, limit = 50, offset = 0) {
    const data = await this.prisma.apiConnection.findMany({
      where: { organizationId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      // OPTIMIZED: Removed include: { endpoints: true } to prevent N+1 and OOM issues
    });
    const total = await this.prisma.apiConnection.count({
      where: { organizationId },
    });
    return { data, total };
  }

  async getConnection(id: string) {
    const conn = await this.prisma.apiConnection.findUnique({
      where: { id },
      include: { endpoints: true },
    });
    if (!conn) throw new NotFoundException('Connection not found');
    return conn;
  }

  async createConnection(data: any, userId: string) {
    const boundAuth = await this.bindCredential(this.prisma, data.auth);
    data.auth = boundAuth;
    return this.prisma.apiConnection.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
      include: { endpoints: true },
    });
  }

  async updateConnection(
    id: string,
    data: any,
    expectedVersion: number,
    userId: string,
  ) {
    if (data.auth) {
      data.auth = await this.bindCredential(this.prisma, data.auth);
    }
    const conn = await this.getConnection(id);
    if (conn.version !== expectedVersion) {
      throw new Error('Version mismatch (OCC)');
    }
    return this.prisma.apiConnection.update({
      where: { id },
      data: {
        ...data,
        version: { increment: 1 },
        updatedBy: userId,
      },
      include: { endpoints: true },
    });
  }

  async deleteConnection(id: string) {
    await this.prisma.apiEndpoint.deleteMany({ where: { connectionId: id } });
    await this.prisma.apiConnection.delete({ where: { id } });
    return { success: true };
  }

  // --- Endpoints CRUD ---
  async createEndpoint(data: any, userId: string) {
    const conn = await this.getConnection(data.connectionId);
    const existing = await this.prisma.apiEndpoint.findFirst({
      where: {
        connectionId: data.connectionId,
        method: data.method,
        pathTemplate: data.pathTemplate,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Endpoint with same method and path already exists',
      );
    }
    const ep = await this.prisma.apiEndpoint.create({
      data: {
        connectionId: data.connectionId,
        method: data.method,
        pathTemplate: data.pathTemplate,
        schema: data.schema ? JSON.parse(data.schema) : {},
      },
    });
    await this.prisma.apiConnection.update({
      where: { id: data.connectionId },
      data: { version: { increment: 1 }, updatedBy: userId },
    });
    return { ...ep, schema: JSON.stringify(ep.schema) };
  }

  async updateEndpoint(id: string, data: any, userId: string) {
    const ep = await this.prisma.apiEndpoint.findUnique({ where: { id } });
    if (!ep) throw new NotFoundException('Endpoint not found');

    const updated = await this.prisma.apiEndpoint.update({
      where: { id },
      data: {
        method: data.method,
        pathTemplate: data.pathTemplate,
        schema: data.schema ? JSON.parse(data.schema) : undefined,
      },
    });
    await this.prisma.apiConnection.update({
      where: { id: ep.connectionId },
      data: { version: { increment: 1 }, updatedBy: userId },
    });
    return { ...updated, schema: JSON.stringify(updated.schema) };
  }

  async deleteEndpoint(id: string, userId: string) {
    const ep = await this.prisma.apiEndpoint.findUnique({ where: { id } });
    if (!ep) throw new NotFoundException('Endpoint not found');

    await this.prisma.apiEndpoint.delete({ where: { id } });
    await this.prisma.apiConnection.update({
      where: { id: ep.connectionId },
      data: { version: { increment: 1 }, updatedBy: userId },
    });
    return { success: true };
  }
  // --- T009: Validate / Publish / Disable ---

  async disableConnection(id: string, expectedVersion: number, userId: string) {
    const conn = await this.getConnection(id);
    if (conn.version !== expectedVersion)
      throw new Error('Version mismatch (OCC)');

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.apiConnection.update({
        where: { id },
        data: { enabled: false, version: { increment: 1 }, updatedBy: userId },
      });

      await tx.apiOutbox.create({
        data: {
          topic: 'API_CONNECTION_DENY',
          payload: {
            connectionId: id,
            code: updated.code,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return updated;
    });

    this.logger.log(`[Emergency Deny] Connection ${id} disabled by ${userId}`);
    return result;
  }

  async validateGlobalSnapshot() {
    const activeConns = await this.prisma.apiConnection.findMany({
      where: { enabled: true },
      include: { endpoints: true },
    });

    for (const conn of activeConns) {
      if (conn.endpoints.length === 0) {
        throw new BadRequestException(
          `Connection ${conn.code} is enabled but has no endpoints.`,
        );
      }
      if (
        conn.baseUrl.includes('localhost') ||
        conn.baseUrl.includes('127.0.0.1')
      ) {
        throw new BadRequestException(
          `Connection ${conn.code} uses forbidden local address.`,
        );
      }
    }
    return activeConns;
  }

  async getSnapshot(currentEtag: string) {
    const latestRev = await this.prisma.apiRevision.findFirst({
      orderBy: { version: 'desc' },
    });

    if (!latestRev) {
      return { version: 0, etag: '', connections: [] };
    }

    if (latestRev.checksum === currentEtag) {
      return {
        version: latestRev.version,
        etag: latestRev.checksum,
        connections: [],
      }; // Gateway should know to use its own cache
    }

    return {
      version: latestRev.version,
      etag: latestRev.checksum,
      connections: latestRev.snapshot,
    };
  }

  async publishRevision(userId: string) {
    const activeConns = await this.validateGlobalSnapshot();

    const snapshotStr = JSON.stringify(activeConns, (key, value) =>
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'createdBy' ||
      key === 'updatedBy'
        ? undefined
        : value,
    );

    const checksum = crypto
      .createHash('sha256')
      .update(snapshotStr)
      .digest('hex');

    const revision = await this.prisma.$transaction(async (tx) => {
      const lastRev = await tx.apiRevision.findFirst({
        orderBy: { version: 'desc' },
      });
      if (lastRev && lastRev.checksum === checksum) {
        throw new BadRequestException(
          'No changes detected since last publish.',
        );
      }

      const rev = await tx.apiRevision.create({
        data: {
          checksum,
          snapshot: JSON.parse(snapshotStr),
        },
      });

      await tx.apiOutbox.create({
        data: {
          topic: 'API_REVISION_SYNC',
          payload: { revisionVersion: rev.version, checksum },
        },
      });

      return rev;
    });

    this.logger.log(
      `[Publish] New API Revision v${revision.version} created by ${userId}. Checksum: ${checksum}`,
    );
    return revision;
  }

  // --- T010: Importer Server ---

  async createImportSession(data: any) {
    const contentToHash = JSON.stringify({
      sys: data.systemName,
      base: data.baseUrl,
      ep: data.endpoints,
    });
    const inputHash = crypto
      .createHash('sha256')
      .update(contentToHash)
      .digest('hex');

    const diffs: any[] = [];
    let existingEndpoints: any[] = [];
    if (data.targetConnectionId) {
      existingEndpoints = await this.prisma.apiEndpoint.findMany({
        where: { connectionId: data.targetConnectionId },
      });
    }

    for (const ep of data.endpoints) {
      const match = existingEndpoints.find(
        (e) => e.method === ep.method && e.pathTemplate === ep.path,
      );
      if (match) {
        diffs.push({
          method: ep.method,
          path: ep.path,
          status: 'CONFLICT',
          existingEndpointId: match.id,
        });
      } else {
        diffs.push({
          method: ep.method,
          path: ep.path,
          status: 'NEW',
          existingEndpointId: '',
        });
      }
    }

    const ttl = new Date();
    ttl.setHours(ttl.getHours() + 2);

    const session = await this.prisma.apiImportSession.create({
      data: {
        inputHash,
        previewData: {
          systemName: data.systemName,
          baseUrl: data.baseUrl,
          endpoints: data.endpoints,
          targetConnectionId: data.targetConnectionId,
          organizationId: data.organizationId,
        },
        ttl,
        status: 'PENDING',
      },
    });

    return {
      sessionId: session.id,
      inputHash,
      diffs,
    };
  }

  async commitImportSession(data: any, userId: string) {
    const session = await this.prisma.apiImportSession.findUnique({
      where: { id: data.sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'PENDING')
      throw new BadRequestException('Session already processed');
    if (new Date() > session.ttl)
      throw new BadRequestException('Session expired');

    const preview = session.previewData as any;
    let connId = preview.targetConnectionId;

    const result = await this.prisma.$transaction(async (tx) => {
      if (!connId) {
        let baseCode = preview.systemName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_');
        if (!baseCode)
          baseCode =
            'API_' + crypto.randomBytes(4).toString('hex').toUpperCase();

        let counter = 0;
        let code = baseCode;
        while (await tx.apiConnection.findUnique({ where: { code } })) {
          counter++;
          code = `${baseCode}_${counter}`;
        }

        const newConn = await tx.apiConnection.create({
          data: {
            code,
            displayName: preview.systemName || 'Imported API',
            networkZone: 'external',
            baseUrl: preview.baseUrl || 'https://example.com',
            auth: { kind: 'none' },
            organizationId: preview.organizationId,
            createdBy: userId,
            updatedBy: userId,
          },
        });
        connId = newConn.id;
      }

      let created = 0;
      let updated = 0;

      const existingEndpoints = await tx.apiEndpoint.findMany({
        where: { connectionId: connId },
      });

      const createData: any[] = [];
      const updatePromises: any[] = [];

      const toEndpointSchema = (ep: any) => {
        const normalizeType = (type: any) => {
          if (type === 'number' || type === 'integer') return 'number';
          if (type === 'boolean') return 'boolean';
          return 'string';
        };
        const parameters = [
          ...(Array.isArray(ep.params) ? ep.params : []).map((param: any) => ({
            name: param.name || param.key || '',
            in: param.in || 'query',
            type: normalizeType(param.type),
            required: Boolean(param.required),
            value: param.value ?? '',
            enabled: param.enabled !== false,
            description: param.description || '',
          })),
          ...(Array.isArray(ep.headers) ? ep.headers : []).map(
            (header: any) => ({
              name: header.name || header.key || '',
              in: 'header',
              type: normalizeType(header.type),
              required: Boolean(header.required),
              value: header.value ?? '',
              enabled: header.enabled !== false,
              description: header.description || '',
            }),
          ),
        ].filter((parameter: any) => parameter.name);

        let body = ep.body ?? '';
        if (typeof body === 'string' && body.trim()) {
          try {
            body = JSON.parse(body);
          } catch {
            // Preserve text and non-JSON request bodies as strings.
          }
        }

        return {
          name: ep.name || '',
          description: ep.description || '',
          parameters,
          body,
          bodyType: ep.bodyType || (body ? 'raw' : 'none'),
          formItems: Array.isArray(ep.formItems) ? ep.formItems : [],
        };
      };

      for (const ep of preview.endpoints) {
        const resolution = data.resolutions?.find(
          (r: any) => r.method === ep.method && r.path === ep.path,
        );
        const action = resolution?.action || 'OVERWRITE';

        if (action === 'SKIP') continue;

        const match = existingEndpoints.find(
          (e) => e.method === ep.method && e.pathTemplate === ep.path,
        );

        if (match && action === 'OVERWRITE') {
          const schema = toEndpointSchema(ep);
          let existingSchema = match.schema;
          if (typeof existingSchema === 'string') {
            try {
              existingSchema = JSON.parse(existingSchema);
            } catch {
              existingSchema = {};
            }
          }
          updatePromises.push(
            tx.apiEndpoint.update({
              where: { id: match.id },
              data: {
                schema: {
                  ...(existingSchema && typeof existingSchema === 'object'
                    ? existingSchema
                    : {}),
                  ...schema,
                },
              },
            }),
          );
          updated++;
        } else if (!match) {
          createData.push({
            connectionId: connId,
            method: ep.method,
            pathTemplate: ep.path,
            schema: toEndpointSchema(ep),
          });
          created++;
        }
      }

      // OPTIMIZED: Bulk insert using createMany
      if (createData.length > 0) {
        await tx.apiEndpoint.createMany({ data: createData });
      }

      // OPTIMIZED: Chunked parallel updates
      const CHUNK_SIZE = 50;
      for (let i = 0; i < updatePromises.length; i += CHUNK_SIZE) {
        await Promise.all(updatePromises.slice(i, i + CHUNK_SIZE));
      }

      await tx.apiImportSession.update({
        where: { id: session.id },
        data: { status: 'COMMITTED' },
      });

      return {
        connectionId: connId,
        endpointsCreated: created,
        endpointsUpdated: updated,
      };
    });

    return result;
  }
}
