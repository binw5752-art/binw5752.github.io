import OpenAI from "openai";
import type { ChatRequest, LlmProvider } from "./types";

/**
 * DeepSeek Provider
 * 通过 OpenAI 兼容协议接入
 */
export class DeepSeekProvider implements LlmProvider {
  readonly id = "deepseek" as const;
  readonly name = "DeepSeek";
  readonly available: boolean;
  readonly defaultModel: string;

  private client: OpenAI | null;

  constructor() {
    const key = process.env.DEEPSEEK_API_KEY ?? "";
    this.defaultModel = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    this.available = Boolean(key);
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
        })
      : null;
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.client) throw new Error("DeepSeek client not initialized");
    const res = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    if (!this.client) throw new Error("DeepSeek client not initialized");
    const stream = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
      stream: true,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) yield delta;
    }
  }
}
