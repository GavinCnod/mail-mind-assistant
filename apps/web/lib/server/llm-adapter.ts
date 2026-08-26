/**
 * LLM adapter for OpenAI-compatible endpoints
 */
import OpenAI from 'openai';
import { type LlmConfig } from '@mailmind/contracts';

export class LlmAdapter {
  private client: OpenAI;
  readonly model: string;

  constructor(config: LlmConfig) {
    this.model = config.model;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs || 45000,
      maxRetries: 1,
    });
  }

  async analyzeEmail(input: {
    systemPrompt: string;
    userPrompt: string;
    model: string;
  }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: input.model,
      messages: [
        { role: 'system', content: input.systemPrompt },
        { role: 'user', content: input.userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    return content;
  }

  async generateDigest(input: {
    systemPrompt: string;
    userPrompt: string;
    model: string;
  }): Promise<string> {
    return this.analyzeEmail(input);
  }
}
