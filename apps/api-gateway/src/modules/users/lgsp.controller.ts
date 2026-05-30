import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Admin - LGSP (Trục liên thông)')
@Controller('admin/lgsp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LgspController implements OnModuleInit {
  private lgspService: any;

  constructor(
    @Inject(MICROSERVICES.LGSP.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.lgspService = this.client.getService('LgspService');
  }

  @Get('documents/sync')
  @ApiOperation({ summary: 'Đồng bộ văn bản từ trục LGSP' })
  async syncDocuments(@Query('serviceCode') serviceCode: string) {
    return firstValueFrom(
      this.lgspService.SyncDocuments({ configId: serviceCode || 'LGSP_QUAN_LY_VAN_BAN' }),
    );
  }

  @Post('documents/send')
  @ApiOperation({ summary: 'Gửi văn bản lên trục LGSP' })
  async sendDocument(@Body() body: any, @Query('serviceCode') serviceCode: string) {
    return firstValueFrom(this.lgspService.SendDocument({ ...body, serviceCode: serviceCode || 'LGSP_QUAN_LY_VAN_BAN' }));
  }
}
