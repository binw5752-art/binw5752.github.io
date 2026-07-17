import OpenAI from "openai";
import type { ChatRequest, LlmProvider } from "./types";

/**
 * 阿里通义千问 Provider
 * 通过 DashScope 兼容 OpenAI 协议接入
 */
export class QwenProvider implements LlmProvider {
  readonly id = "qwen" as const;
  readonly name = "通义千问";
  readonly available: boolean;
  readonly defaultModel: string;

  private client: OpenAI | null;

  constructor() {
    const key = process.env.QWEN_API_KEY ?? "";
    this.defaultModel = process.env.QWEN_MODEL ?? "qwen-plus";
    this.available = Boolean(key);
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL:
            process.env.QWEN_BASE_URL ??
            "https://dashscope.aliyuncs.com/compatible-mode/v1",
        })
      : null;
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.client) throw new Error("Qwen client not initialized");
    const res = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    if (!this.client) throw new Error("Qwen client not initialized");
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
