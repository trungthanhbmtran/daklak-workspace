import {
  InternalServerErrorException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  Req,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@ApiTags('Documents')
@Controller('admin/documents/minutes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MinutesController implements OnModuleInit {
  private readonly logger = new Logger(MinutesController.name);
  private minutesService: any;

  constructor(
    @Inject(MICROSERVICES.MINUTES.SYMBOL)
    private readonly client: microservices.ClientGrpc,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  onModuleInit() {
    this.minutesService = this.client.getService(MICROSERVICES.MINUTES.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'List meeting minutes' })
  async listMinutes(@Req() req: any, @Query() query: any) {
    return firstValueFrom(
      this.minutesService.ListMinutes(query, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get minutes detail' })
  async getMinutes(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.minutesService.GetMinutes({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create meeting minutes' })
  async createMinutes(@Req() req: any, @Body() body: any) {
    return firstValueFrom(
      this.minutesService.CreateMinutes(body, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meeting minutes' })
  async updateMinutes(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return firstValueFrom(
      this.minutesService.UpdateMinutes(
        { id, ...body },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meeting minutes' })
  async deleteMinutes(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.minutesService.DeleteMinutes({ id }, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }
}
