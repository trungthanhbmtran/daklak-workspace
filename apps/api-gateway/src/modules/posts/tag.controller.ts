import { Controller, Get, Post, Body, Param, Query, Inject, UseGuards, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Lấy danh sách tag' })
    @ApiResponse({ status: 200, description: 'Mảng các tag' })
    async listTags(@Query() query: any) {
        try {
            const req = {
                page: parseInt(query.page) || 1,
                limit: parseInt(query.limit) || 10,
            };
            return await firstValueFrom(this.tagService.ListTags(req));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post()
    @ApiOperation({ summary: 'Tạo tag mới' })
    @ApiResponse({ status: 201, description: 'Tag đã được tạo' })
    async createTag(@Body() body: any) {
        try {
            return await firstValueFrom(this.tagService.CreateTag(body));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        const message = error.details || error.message || 'Internal Server Error';
        if (error.code === 3) throw new BadRequestException(message);
        if (error.code === 5) throw new NotFoundException(message);
        throw new BadRequestException(message);
    }
}
