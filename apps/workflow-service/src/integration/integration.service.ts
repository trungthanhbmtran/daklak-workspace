import { Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';

import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIntegrationDto) {
    try {
      return await this.prisma.integrationConnection.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new RpcException({
          code: 6, // GRPC StatusCode.ALREADY_EXISTS
          message: `Mã tích hợp "${data.code}" đã tồn tại. Vui lòng chọn mã khác.`,
        });
      }
      throw new RpcException({ code: 13, message: 'Lỗi nội bộ khi tạo Integration.' });
    }
  }

  async findAll(search?: string) {
    const whereClause = search
      ? {
          OR: [{ name: { contains: search } }, { code: { contains: search } }],
        }
      : {};

    return this.prisma.integrationConnection.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const conn = await this.prisma.integrationConnection.findUnique({
      where: { id },
    });
    if (!conn) throw new NotFoundException('Integration Connection not found');
    return conn;
  }

  async update(id: string, data: UpdateIntegrationDto) {
    try {
      return await this.prisma.integrationConnection.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new RpcException({ code: 5, message: 'Không tìm thấy Integration Connection.' });
        }
        if (err.code === 'P2002') {
          throw new RpcException({ code: 6, message: 'Mã tích hợp đã tồn tại.' });
        }
      }
      throw new RpcException({ code: 13, message: 'Lỗi nội bộ khi cập nhật Integration.' });
    }
  }

  async remove(id: string) {
    return this.prisma.integrationConnection.delete({ where: { id } });
  }
}
