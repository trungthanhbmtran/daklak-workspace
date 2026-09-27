import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Controller('admin/hrm/rank-quotas')
export class RankQuotasController {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  private rankQuotaService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.rankQuotaService = this.client.getService('TaskService');
  }

  @Post()
  async saveRankQuotas(@Body() body: any) {
    const data = await firstValueFrom(
      this.rankQuotaService.SaveRankQuotas(body),
    ).catch((e) => this.handleRpcError(e));
    return data;
  }

  @Get(':rankCode')
  async getRankQuotasByRank(
    @Param('rankCode') rankCode: string,
    @Query('domainCode') domainCode: string,
  ) {
    const data = await firstValueFrom(
      this.rankQuotaService.GetRankQuotasByRank({ rankCode, domainCode }),
    ).catch((e) => this.handleRpcError(e));
    return data;
  }
}
