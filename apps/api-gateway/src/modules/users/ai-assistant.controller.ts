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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { AiService } from '../ai/ai.service';
import { QdrantService } from '../ai/qdrant.service';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';

@ApiTags('AI Assistants')
@Controller('admin/ai-assistants')
@UseGuards(JwtAuthGuard)
export class AiAssistantGatewayController implements OnModuleInit {
  private aiAssistantService: any;

  constructor(
    @Inject(MICROSERVICES.AI_ASSISTANT.SYMBOL) private readonly client: any,
    private readonly aiService: AiService,
    private readonly qdrantService: QdrantService,
  ) {}

  onModuleInit() {
    this.aiAssistantService = this.client.getService('AiAssistantService');
  }

  @Get()
  async getAssistants(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.ListAssistants({ userId }),
      )) as any;
      return response.assistants || [];
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Get(':id')
  async getAssistant(@Param('id') id: string) {
    try {
      const response = (await firstValueFrom(
        this.aiAssistantService.GetAssistant({ id }),
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
        this.aiAssistantService.CreateAssistant({
          userId,
          name: body.name,
          description: body.description,
          systemPrompt: body.system_prompt,
          isPublic: body.is_public,
        }),
      )) as any;
      return response.assistant;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Put(':id')
  async updateAssistant(
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
        this.aiAssistantService.UpdateAssistant({
          id,
          name: body.name,
          description: body.description,
          systemPrompt: body.system_prompt,
          isPublic: body.is_public,
        }),
      )) as any;
      return response.assistant;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Delete(':id')
  async deleteAssistant(@Param('id') id: string) {
    try {
      await firstValueFrom(this.aiAssistantService.DeleteAssistant({ id }));
      return { success: true };
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
      let qdrantId = body.qdrant_id;
      let finalContent = body.content || '';

      // If type is FILE and there is a URL in metadata, fetch and parse it
      if (body.type === 'FILE' && body.metadata) {
        try {
          const meta = JSON.parse(body.metadata);
          if (meta.url) {
            const fileRes = await fetch(meta.url);
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              if (meta.url.toLowerCase().endsWith('.pdf')) {
                const pdfData = await pdfParse(buffer);
                finalContent = pdfData.text;
              } else if (meta.url.toLowerCase().endsWith('.docx')) {
                const docxData = await mammoth.extractRawText({ buffer });
                finalContent = docxData.value;
              } else if (meta.url.toLowerCase().match(/\.(txt|md|csv)$/)) {
                finalContent = buffer.toString('utf-8');
              }
            }
          }
        } catch (err: any) {
          console.warn(
            'Failed to parse file for knowledge source',
            err.message,
          );
        }
      }

      // If content is provided or extracted, embed it and save to Qdrant
      if (finalContent) {
        // Ensure collection exists
        await this.qdrantService.createCollectionIfNotExists(id, 1536); // Assuming OpenAI ada-002 size for simplicity

        const embedding = await this.aiService.generateEmbedding(
          finalContent,
          req.user?.id,
        );

        qdrantId = Date.now().toString(); // simple ID generation
        await this.qdrantService.upsertPoints(id, [
          {
            id: qdrantId,
            vector: embedding,
            payload: {
              title: body.title,
              type: body.type,
              content: finalContent,
              metadata: body.metadata,
            },
          },
        ]);
      }

      await firstValueFrom(
        this.aiAssistantService.AddKnowledgeSource({
          assistantId: id,
          type: body.type,
          title: body.title,
          content: finalContent,
          metadata: body.metadata,
          qdrantId: qdrantId,
        }),
      );
      return { success: true };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Delete('knowledge-sources/:sourceId')
  async removeKnowledgeSource(@Param('sourceId') sourceId: string) {
    try {
      await firstValueFrom(
        this.aiAssistantService.RemoveKnowledgeSource({ id: sourceId }),
      );
      return { success: true };
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
      // 1. Fetch assistant
      const response = (await firstValueFrom(
        this.aiAssistantService.GetAssistant({ id }),
      )) as any;
      const assistant = response.assistant;
      if (!assistant) throw new Error('Assistant not found');

      // 2. Embed user question
      const questionEmbedding = await this.aiService.generateEmbedding(
        body.message,
        userId,
      );

      // 3. Search Qdrant for context
      let contextText = '';
      try {
        const searchResults = await this.qdrantService.search(
          id, // use assistant id as collection name
          questionEmbedding,
          3,
        );
        if (searchResults && searchResults.length > 0) {
          contextText = searchResults
            .map((res: any) => res.payload?.content)
            .filter((c) => !!c)
            .join('\n\n---\n\n');
        }
      } catch (err: any) {
        // If collection doesn't exist or search fails, we just proceed without context
        console.warn(`Qdrant search failed for assistant ${id}:`, err.message);
      }

      // 4. Compose system prompt
      let finalSystemPrompt = assistant.system_prompt;
      if (contextText) {
        finalSystemPrompt += `\n\nDưới đây là một số thông tin nền (nguồn tri thức) có thể giúp ích cho bạn trả lời câu hỏi. Dựa vào thông tin này nếu nó liên quan:\n\n${contextText}`;
      }

      // 5. Call LLM
      const reply = await this.aiService.generateText(
        body.message,
        finalSystemPrompt,
        userId,
      );

      return {
        reply,
      };
    } catch (e: any) {
      throw new InternalServerErrorException(
        e.message || 'Failed to chat with assistant',
      );
    }
  }
}
