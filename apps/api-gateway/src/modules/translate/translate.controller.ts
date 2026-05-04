import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

interface TranslationService {
  translateSync(data: { text: string; target_lang: string }): Promise<{ translated_text: string }>;
}

@Controller('admin/translate')
@UseGuards(JwtAuthGuard)
export class TranslateController implements OnModuleInit {
  private translateService: TranslationService;

  constructor(
    @Inject(MICROSERVICES.TRANSLATE.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.translateService = this.client.getService<TranslationService>(
      MICROSERVICES.TRANSLATE.SERVICE,
    );
  }

  @Post()
  async translate(@Body() body: { text: string; targetLang: string }) {
    console.log('[TranslateController] Requesting translation:', body);
    const result = await firstValueFrom(
      this.translateService.translateSync({
        text: body.text,
        target_lang: body.targetLang,
      }) as any
    );
    return result;
  }
}
