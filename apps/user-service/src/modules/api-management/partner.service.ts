import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  async createPartner(data: {
    code: string;
    name: string;
    description?: string;
    organizationId: string;
  }) {
    return this.prisma.apiPartner.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
      },
    });
  }

  async listPartners(organizationId: string) {
    return this.prisma.apiPartner.findMany({
      where: { organizationId },
      include: {
        keys: {
          select: {
            id: true,
            name: true,
            keyPrefix: true,
            scopes: true,
            status: true,
            expiresAt: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async issueKey(
    partnerId: string,
    name: string,
    scopes: string[],
    expiresAt?: Date,
  ) {
    const partner = await this.prisma.apiPartner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) throw new NotFoundException('Partner not found');

    // Generate one-time key
    const rawKey = crypto.randomBytes(32).toString('base64url');
    // Format: daklak_partnerCode_rawKey
    const fullKey = `daklak_${partner.code}_${rawKey}`;

    // Hash for storage
    const hashedKey = crypto.createHash('sha256').update(fullKey).digest('hex');
    const keyPrefix = fullKey.substring(0, 15) + '...';

    const keyRecord = await this.prisma.apiPartnerKey.create({
      data: {
        partnerId,
        name,
        keyPrefix,
        hashedKey,
        scopes,
        expiresAt,
      },
    });

    return {
      record: {
        id: keyRecord.id,
        name: keyRecord.name,
        keyPrefix: keyRecord.keyPrefix,
        scopes: keyRecord.scopes,
        status: keyRecord.status,
        expiresAt: keyRecord.expiresAt,
      },
      oneTimeKey: fullKey, // NEVER returned again
    };
  }

  async revokeKey(keyId: string) {
    return this.prisma.apiPartnerKey.update({
      where: { id: keyId },
      data: { status: 'REVOKED' },
    });
  }

  async validateKey(hashedKey: string) {
    const keyRecord = await this.prisma.apiPartnerKey.findFirst({
      where: { hashedKey, status: 'ACTIVE' },
      include: { partner: true },
    });

    if (!keyRecord || keyRecord.partner.status !== 'ACTIVE') {
      return null; // Invalid or revoked
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return null; // Expired
    }

    // Fire and forget update lastUsedAt
    this.prisma.apiPartnerKey
      .update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return {
      partnerId: keyRecord.partnerId,
      partnerCode: keyRecord.partner.code,
      scopes: keyRecord.scopes,
      organizationId: keyRecord.partner.organizationId,
    };
  }
}
