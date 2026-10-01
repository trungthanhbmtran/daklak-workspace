import { Controller, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { AiAssistantService } from './ai-assistant.service';
import { AiService } from '../ai/ai.service';
import { QdrantService } from '../ai/qdrant.service';

@Controller()
export class AiAssistantController implements OnModuleInit {
  private readonly logger = new Logger(AiAssistantController.name);
  private mediaService: any;

  constructor(
    private readonly assistantService: AiAssistantService,
    private readonly aiService: AiService,
    private readonly qdrantService: QdrantService,
    @Inject('AI_QUEUE_SERVICE') private readonly queueClient: any,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: any,
  ) {}

  onModuleInit() {
    this.mediaService = this.mediaClient.getService('MediaService');
  }

  @GrpcMethod('AiAssistantService', 'Chat')
  async chat(data: any) {
    const reply = await this.assistantService.chat(
      data.assistant_id,
      data.message,
      data.user_id,
    );
    return { reply };
  }

  @GrpcMethod('AiAssistantService', 'GetAssistants')
  async getAssistants(data: { userId: number }) {
    const assistants = await this.assistantService.getAssistants(data.userId);
    return {
      assistants: assistants.map((a) => ({
        id: a.id,
        user_id: a.userId,
        name: a.name,
        description: a.description || '',
        system_prompt: a.systemPrompt,
        is_public: a.isPublic,
        created_at: a.createdAt.toISOString(),
        updated_at: a.updatedAt.toISOString(),
        knowledge_sources: a.knowledgeSources.map((k) => ({
          id: k.id,
          assistant_id: k.assistantId,
          type: k.type,
          title: k.title,
          content: k.content || '',
          metadata: k.metadata || '',
          qdrant_id: k.qdrantId || '',
        })),
        tools: a.tools.map((t) => ({
          id: t.id,
          assistant_id: t.assistantId,
          tool_name: t.toolName,
        })),
      })),
    };
  }

  @GrpcMethod('AiAssistantService', 'GetAssistant')
  async getAssistant(data: { id: string }) {
    const a = await this.assistantService.getAssistant(data.id);
    return {
      assistant: {
        id: a.id,
        user_id: a.userId,
        name: a.name,
        description: a.description || '',
        system_prompt: a.systemPrompt,
        is_public: a.isPublic,
        created_at: a.createdAt.toISOString(),
        updated_at: a.updatedAt.toISOString(),
        knowledge_sources: a.knowledgeSources.map((k) => ({
          id: k.id,
          assistant_id: k.assistantId,
          type: k.type,
          title: k.title,
          content: k.content || '',
          metadata: k.metadata || '',
          qdrant_id: k.qdrantId || '',
        })),
        tools: a.tools.map((t) => ({
          id: t.id,
          assistant_id: t.assistantId,
          tool_name: t.toolName,
        })),
      },
    };
  }

  @GrpcMethod('AiAssistantService', 'CreateAssistant')
  async createAssistant(data: any) {
    const a = await this.assistantService.createAssistant({
      userId: data.user_id,
      name: data.name,
      description: data.description,
      systemPrompt: data.system_prompt,
      isPublic: data.is_public,
    });
    return this.getAssistant({ id: a.id });
  }

  @GrpcMethod('AiAssistantService', 'UpdateAssistant')
  async updateAssistant(data: any) {
    const a = await this.assistantService.updateAssistant({
      id: data.id,
      name: data.name,
      description: data.description,
      systemPrompt: data.system_prompt,
      isPublic: data.is_public,
    });
    return this.getAssistant({ id: a.id });
  }

  @GrpcMethod('AiAssistantService', 'DeleteAssistant')
  async deleteAssistant(data: { id: string }) {
    await this.assistantService.deleteAssistant(data.id);
    return { success: true };
  }

  @GrpcMethod('AiAssistantService', 'AddKnowledgeSource')
  async addKnowledgeSource(data: any) {
    this.queueClient.emit('knowledge_source_uploaded', data);
    return { success: true };
  }

  @EventPattern('knowledge_source_uploaded')
  async handleKnowledgeSourceUploaded(data: {
    assistant_id: string;
    type: string;
    title: string;
    content?: string;
    metadata?: string;
    qdrant_id?: string;
    user_id?: number;
  }) {
    this.logger.log(`Worker processing knowledge source: ${data.title}`);
    try {
      let finalContent = data.content || '';
      let qdrantId = data.qdrant_id || require('crypto').randomUUID();
      let fileUrl = '';
      let originalName = '';

      if (data.type === 'FILE' && data.metadata) {
        try {
          const meta = JSON.parse(data.metadata);
          
          // Ưu tiên lấy file qua Media Service nếu có mediaId
          if (meta.mediaId) {
            const { firstValueFrom } = require('rxjs');
            const mediaResponse = (await firstValueFrom(
              this.mediaService.GetMedia({ fileId: meta.mediaId })
            )) as any;
            if (mediaResponse && mediaResponse.downloadUrl) {
              fileUrl = mediaResponse.downloadUrl;
              originalName = mediaResponse.originalName || mediaResponse.fileName || '';
            }
          } else if (meta.url) {
            // Fallback dành cho các file public
            fileUrl = meta.url;
            originalName = meta.originalName || fileUrl.split('?')[0]; // Bỏ query params nếu có
          }

          if (fileUrl) {
            const fileRes = await fetch(fileUrl);
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              
              if (!originalName) originalName = fileUrl.split('?')[0];

              if (originalName.toLowerCase().endsWith('.pdf')) {
                const pdfParse = require('pdf-parse');
                const pdfData = await pdfParse(buffer);
                finalContent = pdfData.text;
              } else if (originalName.toLowerCase().endsWith('.docx')) {
                const mammoth = require('mammoth');
                const docxData = await mammoth.extractRawText({ buffer });
                finalContent = docxData.value;
              } else if (originalName.toLowerCase().match(/\.(txt|md|csv)$/)) {
                finalContent = buffer.toString('utf-8');
              }
            }
          }
        } catch (err: any) {
          this.logger.warn(`Failed to parse file for knowledge source: ${err.message}`);
        }
      }

      if (finalContent) {
        await this.qdrantService.createCollectionIfNotExists(data.assistant_id, 1536);

        // 1. Text Chunking Algorithm (Phân mảnh văn bản)
        const chunks: string[] = [];
        let currentChunk = '';
        // Tách câu dựa trên dấu chấm, hỏi, chấm than
        const sentences = finalContent.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
          if ((currentChunk + ' ' + sentence).length > 1000) {
            if (currentChunk) chunks.push(currentChunk.trim());
            // Overlap khoảng 100 ký tự (nếu có thể) để giữ context
            currentChunk = sentence;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        this.logger.log(`Generated ${chunks.length} chunks for ${data.title}`);

        // 2. Parallel Embedding with Concurrency Control (Tránh treo Event Loop và Rate Limit API)
        const CONCURRENCY_LIMIT = 5;
        const points: any[] = [];
        
        for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
          const batchChunks = chunks.slice(i, i + CONCURRENCY_LIMIT);
          
          // Chạy song song N chunk trong cùng một thời điểm
          const batchPromises = batchChunks.map(async (chunk, index) => {
            // Qdrant point id bắt buộc phải là UUID hợp lệ hoặc UInt64
            const chunkId = require('crypto').randomUUID();
            const embedding = await this.aiService.generateEmbedding(chunk, data.user_id);
            return {
              id: chunkId,
              vector: embedding,
              payload: {
                title: data.title,
                type: data.type,
                content: chunk, // Chỉ lưu nội dung của chunk này
                metadata: data.metadata,
                original_document_id: qdrantId,
                chunk_index: i + index,
              },
            };
          });

          // Đợi batch này nhúng xong mới chạy batch tiếp theo
          const batchPoints = await Promise.all(batchPromises);
          points.push(...batchPoints);
          
          // Node.js Event Loop Yield (Tránh Block Thread nếu file quá lớn)
          await new Promise((resolve) => setImmediate(resolve));
        }

        // 3. Batch Upsert to Qdrant (Bulk insert)
        await this.qdrantService.upsertPoints(data.assistant_id, points);
        this.logger.log(`Successfully upserted ${points.length} points to Qdrant for ${data.title}`);
      }

      await this.assistantService.addKnowledgeSource({
        assistantId: data.assistant_id,
        type: data.type,
        title: data.title,
        content: finalContent,
        metadata: data.metadata,
        qdrantId: qdrantId,
      });
      this.logger.log(`Worker completed knowledge source: ${data.title}`);
    } catch (err: any) {
      this.logger.error(`Worker failed knowledge source task`, err);
    }
  }

  @GrpcMethod('AiAssistantService', 'RemoveKnowledgeSource')
  async removeKnowledgeSource(data: { id: string }) {
    await this.assistantService.removeKnowledgeSource(data.id);
    return { success: true };
  }

  @GrpcMethod('AiAssistantService', 'AddAssistantTool')
  async addAssistantTool(data: any) {
    await this.assistantService.addAssistantTool({
      assistantId: data.assistant_id,
      toolName: data.tool_name,
    });
    return { success: true };
  }

  @GrpcMethod('AiAssistantService', 'RemoveAssistantTool')
  async removeAssistantTool(data: { id: string }) {
    await this.assistantService.removeAssistantTool(data.id);
    return { success: true };
  }
}
