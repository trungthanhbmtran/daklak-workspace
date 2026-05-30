import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

interface AiProviderConfig {
  id: string;
  provider: 'OPENAI' | 'GEMINI' | 'CLAUDE';
  model: string;
  apiKey: string;
  priority: number;
  enabled: boolean;
}

@Injectable()
export class AiService implements OnModuleInit {
  private configService: any;
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(MICROSERVICES.SYS_CONFIG.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.configService = this.client.getService('SystemConfigService');
  }

  private async getProviders(): Promise<AiProviderConfig[]> {
    try {
      const response = (await firstValueFrom(
        this.configService.GetConfigs({}),
      )) as any;
      const configs = response.configs || [];
      const aiProvidersConfig = configs.find(
        (c: any) => c.key === 'AI_PROVIDERS',
      );

      if (!aiProvidersConfig || !aiProvidersConfig.value) return [];

      const parsed = JSON.parse(aiProvidersConfig.value);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((p) => p.enabled && p.apiKey)
        .sort((a, b) => a.priority - b.priority);
    } catch (err) {
      this.logger.error('Error fetching AI providers config', err);
      return [];
    }
  }

  async generateText(prompt: string): Promise<string> {
    const providers = await this.getProviders();

    if (providers.length === 0) {
      throw new Error(
        'Không có cấu hình AI nào khả dụng hoặc đang được bật trong hệ thống.',
      );
    }

    let lastError: any = null;

    for (const provider of providers) {
      try {
        this.logger.log(
          `Attempting to use AI Provider: ${provider.provider} (Priority: ${provider.priority}, Model: ${provider.model})`,
        );

        const result = await this.callProvider(provider, prompt);

        this.logger.log(
          `Successfully generated response using ${provider.provider}`,
        );
        return result;
      } catch (err: any) {
        this.logger.warn(
          `Failed using ${provider.provider} (Priority: ${provider.priority}). Error: ${err.message}`,
        );
        lastError = err;
        // Continue to the next provider in the sorted list
      }
    }

    this.logger.error('All AI providers failed. Out of tokens or bad configs.');
    throw new Error(
      'Tất cả các dịch vụ AI đều đang bận hoặc lỗi. Chi tiết lỗi cuối cùng: ' +
        lastError?.message,
    );
  }

  private async callProvider(
    config: AiProviderConfig,
    prompt: string,
  ): Promise<string> {
    switch (config.provider) {
      case 'OPENAI':
        return this.callOpenAI(config, prompt);
      case 'GEMINI':
        return this.callGemini(config, prompt);
      case 'CLAUDE':
        return this.callClaude(config, prompt);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private async callOpenAI(
    config: AiProviderConfig,
    prompt: string,
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API Error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callGemini(
    config: AiProviderConfig,
    prompt: string,
  ): Promise<string> {
    const model = config.model || 'gemini-1.5-pro';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callClaude(
    config: AiProviderConfig,
    prompt: string,
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API Error: ${err}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  async listModels(provider: string, apiKey: string): Promise<string[]> {
    if (!apiKey) {
      throw new Error('API Key is required to fetch models');
    }

    switch (provider) {
      case 'OPENAI': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        if (!res.ok) throw new Error('OpenAI API Error: ' + (await res.text()));
        const data = await res.json();
        return (
          data.data
            ?.map((m: any) => m.id)
            .filter((id: string) => id.includes('gpt') || id.includes('o1')) ||
          []
        );
      }
      case 'GEMINI': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        if (!res.ok) throw new Error('Gemini API Error: ' + (await res.text()));
        const data = await res.json();
        return (
          data.models?.map((m: any) => m.name.replace('models/', '')) || []
        );
      }
      case 'CLAUDE': {
        const res = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        });
        if (!res.ok) throw new Error('Claude API Error: ' + (await res.text()));
        const data = await res.json();
        return data.data?.map((m: any) => m.id) || [];
      }
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
