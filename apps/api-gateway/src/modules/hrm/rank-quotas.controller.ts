import { Controller, Post, Get, Body, Param, Query, Inject } from '@nestjs/common';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Controller('admin/hrm/rank-quotas')
export class RankQuotasController {
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
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
    return data;
  }

  @Get(':rankCode')
  async getRankQuotasByRank(
    @Param('rankCode') rankCode: string,
    @Query('domainCode') domainCode: string
  ) {
    const data = await firstValueFrom(
          this.rankQuotaService.GetRankQuotasByRank({ rankCode, domainCode }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
    return data;
  }
}
