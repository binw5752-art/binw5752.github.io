import OpenAI from "openai";
import type { ChatRequest, LlmProvider } from "./types";

/**
 * OpenAI Provider
 * 同时兼容任何 OpenAI 协议的服务（Azure、Together、Groq、本地 vLLM 等）
 * 通过 OPENAI_BASE_URL 切换
 */
export class OpenAIProvider implements LlmProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI";
  readonly available: boolean;
  readonly defaultModel: string;

  private client: OpenAI | null;

  constructor() {
    const key = process.env.OPENAI_API_KEY ?? "";
    this.defaultModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    this.available = Boolean(key);
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
        })
      : null;
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.client) throw new Error("OpenAI client not initialized");
    const res = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    if (!this.client) throw new Error("OpenAI client not initialized");
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
