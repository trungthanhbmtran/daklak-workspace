import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  constructor(private prisma: PrismaService) {}

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
