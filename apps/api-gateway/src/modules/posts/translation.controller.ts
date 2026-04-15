import { Controller, Get, Post, Put, Delete, Body, Param, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Posts - Translations')
@Controller('posts/translations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TranslationController implements OnModuleInit {
    private translationService: any;

    constructor(@Inject(MICROSERVICES.TRANSLATE.SYMBOL) private readonly client: any) { }

    onModuleInit() {
        this.translationService = this.client.getService(MICROSERVICES.TRANSLATE.SERVICE);
    }

    @Get('post/:postId')
    async getTranslationsByPost(@Param('postId') postId: string) {
        return firstValueFrom(this.translationService.GetTranslationsByPost({ postId }));
    }

    @Get(':id')
    async getTranslationDetail(@Param('id') id: string) {
        return firstValueFrom(this.translationService.GetTranslationDetail({ id }));
    }

    @Put(':id')
    async updateTranslation(@Param('id') id: string, @Body() body: any) {
        return firstValueFrom(this.translationService.UpdateTranslation({ id, ...body }));
    }

    @Post('trigger')
    async triggerTranslation(@Body() body: { postId: string; targetLang: string }) {
        return firstValueFrom(this.translationService.TriggerTranslation(body));
    }

    @Delete(':id')
    async deleteTranslation(@Param('id') id: string) {
        return firstValueFrom(this.translationService.DeleteTranslation({ id }));
    }
}
