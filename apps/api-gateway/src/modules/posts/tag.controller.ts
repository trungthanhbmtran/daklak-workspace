import { Controller, Get, Post, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Posts - Tags')
@Controller('admin/posts/tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TagController implements OnModuleInit {
    private tagService: any;

    constructor(@Inject(MICROSERVICES.POSTS_TAG.SYMBOL) private readonly client: any) { }

    onModuleInit() {
        this.tagService = this.client.getService(MICROSERVICES.POSTS_TAG.SERVICE);
    }

    @Get()
    async listTags(@Query() query: any) {
        const req = {
            page: parseInt(query.page) || 1,
            limit: parseInt(query.limit) || 10,
        };
        return firstValueFrom(this.tagService.ListTags(req));
    }

    @Post()
    async createTag(@Body() body: any) {
        return firstValueFrom(this.tagService.CreateTag(body));
    }
}
