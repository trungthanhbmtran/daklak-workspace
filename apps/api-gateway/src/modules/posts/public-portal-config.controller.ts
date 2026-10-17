import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Controller('public/portal-configs')
export class PublicPortalConfigController {
  private readonly logger = new Logger(PublicPortalConfigController.name);
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
        this.logger.error(`RPC Call Failed: ${e.message}`);
        return null;
      },
    );
    return { data: res.data };
  }
}
