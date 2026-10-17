import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  OnModuleInit,
  UseGuards,
  Req,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@ApiTags('AI Assistants')
@Controller('admin/ai-assistants')
@UseGuards(JwtAuthGuard)
export class AiAssistantGatewayController implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  private aiAssistantService: any;

  constructor(
    @Inject(MICROSERVICES.AI_ASSISTANT.SYMBOL) private readonly client: any,
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
    this.aiAssistantService = this.client.getService('AiAssistantService');
  }

  @Get()
  async getAssistants(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.ListAssistants(
          { userId },
          this.getGrpcMetadata(req),
        ),
      )) as any;
      return response.assistants || [];
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Get(':id')
  async getAssistant(@Req() req: any, @Param('id') id: string) {
    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.GetAssistant({ id }, this.getGrpcMetadata(req)),
      )) as any;
      return response.assistant;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post()
  async createAssistant(
    @Req() req: any,
    @Body()
    body: {
      name: string;
      description?: string;
      system_prompt: string;
      is_public?: boolean;
    },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new InternalServerErrorException('User ID missing');
    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.CreateAssistant(
          {
            userId,
            name: body.name,
            description: body.description,
            systemPrompt: body.system_prompt,
            isPublic: body.is_public,
          },
          this.getGrpcMetadata(req),
        ),
      )) as any;
      return response.assistant;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Put(':id')
  async updateAssistant(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      name: string;
      description?: string;
      system_prompt: string;
      is_public?: boolean;
    },
  ) {
    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.UpdateAssistant(
          {
            id,
            name: body.name,
            description: body.description,
            systemPrompt: body.system_prompt,
            isPublic: body.is_public,
          },
          this.getGrpcMetadata(req),
        ),
      )) as any;
      return response.assistant;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Delete(':id')
  async deleteAssistant(@Req() req: any, @Param('id') id: string) {
    try {
      await firstValueFrom(
        this.aiAssistantService.DeleteAssistant(
          { id },
          this.getGrpcMetadata(req),
        ),
      );
      return { };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post(':id/knowledge-sources')
  async addKnowledgeSource(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      type: string;
      title: string;
      content?: string;
      metadata?: string;
      qdrant_id?: string;
    },
  ) {
    try {
      await firstValueFrom(
        this.aiAssistantService.AddKnowledgeSource(
          {
            assistantId: id,
            type: body.type,
            title: body.title,
            content: body.content || '',
            metadata: body.metadata || '',
            qdrantId: body.qdrant_id || '',
          },
          this.getGrpcMetadata(req),
        ),
      );
      return { };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Delete('knowledge-sources/:sourceId')
  async removeKnowledgeSource(
    @Req() req: any,
    @Param('sourceId') sourceId: string,
  ) {
    try {
      await firstValueFrom(
        this.aiAssistantService.RemoveKnowledgeSource(
          { id: sourceId },
          this.getGrpcMetadata(req),
        ),
      );
      return { };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post(':id/chat')
  async chatWithAssistant(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { message: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new InternalServerErrorException('User ID missing');

    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.Chat(
          {
            assistantId: id,
            message: body.message,
            userId,
          },
          this.getGrpcMetadata(req),
        ),
      )) as any;

      return {
        reply: response.reply,
      };
    } catch (e: any) {
      throw new InternalServerErrorException(
        e.message || 'Failed to chat with assistant',
      );
    }
  }
}
