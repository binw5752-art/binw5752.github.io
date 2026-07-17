import OpenAI from "openai";
import type { ChatRequest, LlmProvider } from "./types";

/**
 * Moonshot Kimi Provider
 * 通过 OpenAI 兼容协议接入，特长上下文
 */
export class MoonshotProvider implements LlmProvider {
  readonly id = "moonshot" as const;
  readonly name = "Moonshot Kimi";
  readonly available: boolean;
  readonly defaultModel: string;

  private client: OpenAI | null;

  constructor() {
    const key = process.env.MOONSHOT_API_KEY ?? "";
    this.defaultModel = process.env.MOONSHOT_MODEL ?? "moonshot-v1-8k";
    this.available = Boolean(key);
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL:
            process.env.MOONSHOT_BASE_URL ?? "https://api.moonshot.cn/v1",
        })
      : null;
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.client) throw new Error("Moonshot client not initialized");
    const res = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    if (!this.client) throw new Error("Moonshot client not initialized");
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
