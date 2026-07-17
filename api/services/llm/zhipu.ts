import OpenAI from "openai";
import type { ChatRequest, LlmProvider } from "./types";

/**
 * 智谱 GLM Provider
 * 通过 GLM 兼容 OpenAI 协议接入
 */
export class ZhipuProvider implements LlmProvider {
  readonly id = "zhipu" as const;
  readonly name = "智谱 GLM";
  readonly available: boolean;
  readonly defaultModel: string;

  private client: OpenAI | null;

  constructor() {
    const key = process.env.ZHIPU_API_KEY ?? "";
    this.defaultModel = process.env.ZHIPU_MODEL ?? "glm-4-plus";
    this.available = Boolean(key);
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL: process.env.ZHIPU_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4",
        })
      : null;
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.client) throw new Error("Zhipu client not initialized");
    const res = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    if (!this.client) throw new Error("Zhipu client not initialized");
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
