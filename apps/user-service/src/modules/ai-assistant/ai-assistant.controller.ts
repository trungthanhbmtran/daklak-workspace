import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AiAssistantService } from './ai-assistant.service';

@Controller()
export class AiAssistantController {
  private readonly logger = new Logger(AiAssistantController.name);
  constructor(private readonly assistantService: AiAssistantService) {}

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
    await this.assistantService.addKnowledgeSource({
      assistantId: data.assistant_id,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: data.metadata,
      qdrantId: data.qdrant_id,
    });
    return { success: true };
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
