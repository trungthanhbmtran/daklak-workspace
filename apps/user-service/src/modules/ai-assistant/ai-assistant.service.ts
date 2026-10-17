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
    const assistant = await this.getChatScopedAssistant(assistantId, userId);
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

  async getAssistant(id: string, userId: number) {
    const assistant = await this.prisma.aiAssistant.findUnique({
      where: { id, userId },
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

  /**
   * Chat cho phép assistant của chính người dùng hoặc assistant công khai (isPublic).
   */
  private getChatScopedAssistant(id: string, userId: number) {
    return this.prisma.aiAssistant.findFirst({
      where: {
        id,
        OR: [{ userId }, { isPublic: true }],
      },
      select: { id: true, userId: true, systemPrompt: true },
    });
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

  async updateAssistant(
    data: {
      id: string;
      name: string;
      description?: string;
      systemPrompt: string;
      isPublic: boolean;
    },
    userId: number,
  ) {
    const existing = await this.prisma.aiAssistant.findUnique({
      where: { id: data.id, userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Assistant not found');

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

  async deleteAssistant(id: string, userId: number) {
    const deleted = await this.prisma.aiAssistant.deleteMany({
      where: { id, userId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Assistant not found');
    }
    return true;
  }

  async addKnowledgeSource(
    data: {
      assistantId: string;
      type: string;
      title: string;
      content?: string;
      metadata?: string;
      qdrantId?: string;
    },
    ownerId: number,
  ) {
    // Đảm bảo ownerId hợp lệ để tránh bỏ qua scope khi không xác định (filter undefined bị Prisma bỏ qua).
    if (!Number.isInteger(ownerId)) {
      throw new NotFoundException('Assistant not found');
    }
    const assistant = await this.prisma.aiAssistant.findUnique({
      where: { id: data.assistantId, userId: ownerId },
      select: { id: true },
    });
    if (!assistant) throw new NotFoundException('Assistant not found');

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

  async removeKnowledgeSource(id: string, ownerId: number) {
    // deleteMany + filter qua relation assistant: atomic và không rò rỉ sự tồn tại của bản ghi người khác.
    const deleted = await this.prisma.aiKnowledgeSource.deleteMany({
      where: {
        id,
        assistant: { userId: ownerId },
      },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Knowledge source not found');
    }
    return true;
  }

  async addAssistantTool(
    data: { assistantId: string; toolName: string },
    ownerId: number,
  ) {
    if (!Number.isInteger(ownerId)) {
      throw new NotFoundException('Assistant not found');
    }
    const assistant = await this.prisma.aiAssistant.findUnique({
      where: { id: data.assistantId, userId: ownerId },
      select: { id: true },
    });
    if (!assistant) throw new NotFoundException('Assistant not found');

    await this.prisma.aiAssistantTool.create({
      data: {
        assistantId: data.assistantId,
        toolName: data.toolName,
      },
    });
    return true;
  }

  async removeAssistantTool(id: string, ownerId: number) {
    const deleted = await this.prisma.aiAssistantTool.deleteMany({
      where: {
        id,
        assistant: { userId: ownerId },
      },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Assistant tool not found');
    }
    return true;
  }
}
