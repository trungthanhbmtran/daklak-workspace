import { Controller, Get, Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Controller('public/portal-configs')
export class PublicPortalConfigController {
  private configService: any;

  constructor(
    @Inject(MICROSERVICES.PORTAL_CONFIG.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.configService = this.client.getService<any>(
      MICROSERVICES.PORTAL_CONFIG.SERVICE,
    );
  }

  @Get()
  async findAll() {
    const res: any = await firstValueFrom(this.configService.getAll({})).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
    return { success: true, data: res.data };
  }
}
