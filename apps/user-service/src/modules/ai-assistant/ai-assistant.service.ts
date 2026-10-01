import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AiService } from '../ai/ai.service';
import { QdrantService } from '../ai/qdrant.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  constructor(
    private prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly qdrantService: QdrantService,
  ) {}

  async chat(assistantId: string, message: string, userId: number) {
    const assistant = await this.getAssistant(assistantId);
    if (!assistant) throw new NotFoundException('Assistant not found');

    const questionEmbedding = await this.aiService.generateEmbedding(
      message,
      userId,
    );

    let contextText = '';
    try {
      const searchResults = await this.qdrantService.search(
        assistantId,
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
      this.logger.warn(`Qdrant search failed: ${err.message}`);
    }

    let finalSystemPrompt = assistant.systemPrompt || '';
    if (contextText) {
      finalSystemPrompt += `\n\nDưới đây là một số thông tin nền (nguồn tri thức) có thể giúp ích cho bạn trả lời câu hỏi. Dựa vào thông tin này nếu nó liên quan:\n\n${contextText}`;
    }

    const reply = await this.aiService.generateText(
      message,
      finalSystemPrompt,
      userId,
    );

    return reply;
  }

  async getAssistants(userId: number) {
    const assistants = await this.prisma.aiAssistant.findMany({
      where: { userId },
      include: {
        knowledgeSources: true,
        tools: true,
      },
    });
    return assistants;
  }

  async getAssistant(id: string) {
    const assistant = await this.prisma.aiAssistant.findUnique({
      where: { id },
      include: {
        knowledgeSources: true,
        tools: true,
      },
    });
    if (!assistant) {
      throw new NotFoundException('Assistant not found');
    }
    return assistant;
  }

  async createAssistant(data: {
    userId: number;
    name: string;
    description?: string;
    systemPrompt: string;
    isPublic: boolean;
  }) {
    return this.prisma.aiAssistant.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        isPublic: data.isPublic,
      },
      include: {
        knowledgeSources: true,
        tools: true,
      },
    });
  }

  async updateAssistant(data: {
    id: string;
    name: string;
    description?: string;
    systemPrompt: string;
    isPublic: boolean;
  }) {
    return this.prisma.aiAssistant.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        isPublic: data.isPublic,
      },
      include: {
        knowledgeSources: true,
        tools: true,
      },
    });
  }

  async deleteAssistant(id: string) {
    await this.prisma.aiAssistant.delete({
      where: { id },
    });
    return true;
  }

  async addKnowledgeSource(data: {
    assistantId: string;
    type: string;
    title: string;
    content?: string;
    metadata?: string;
    qdrantId?: string;
  }) {
    await this.prisma.aiKnowledgeSource.create({
      data: {
        assistantId: data.assistantId,
        type: data.type,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        qdrantId: data.qdrantId,
      },
    });
    return true;
  }

  async removeKnowledgeSource(id: string) {
    await this.prisma.aiKnowledgeSource.delete({
      where: { id },
    });
    return true;
  }

  async addAssistantTool(data: { assistantId: string; toolName: string }) {
    await this.prisma.aiAssistantTool.create({
      data: {
        assistantId: data.assistantId,
        toolName: data.toolName,
      },
    });
    return true;
  }

  async removeAssistantTool(id: string) {
    await this.prisma.aiAssistantTool.delete({
      where: { id },
    });
    return true;
  }
}
