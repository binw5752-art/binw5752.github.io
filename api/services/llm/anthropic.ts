import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequest, LlmProvider, ChatMessage } from "./types";

/**
 * Anthropic Claude Provider
 * Claude 3.5 Sonnet，长文本与文学创作表现优异
 */
export class AnthropicProvider implements LlmProvider {
  readonly id = "anthropic" as const;
  readonly name = "Anthropic Claude";
  readonly available: boolean;
  readonly defaultModel: string;

  private client: Anthropic | null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY ?? "";
    this.defaultModel =
      process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";
    this.available = Boolean(key);
    this.client = key
      ? new Anthropic({
          apiKey: key,
          baseURL: process.env.ANTHROPIC_BASE_URL,
        })
      : null;
  }

  /** 把通用 messages 拆成 system + messages */
  private splitMessages(messages: ChatMessage[]): {
    system: string;
    messages: Anthropic.MessageParam[];
  } {
    const systemParts = messages.filter((m) => m.role === "system");
    const rest = messages.filter((m) => m.role !== "system");
    return {
      system: systemParts.map((m) => m.content).join("\n\n"),
      messages: rest.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    };
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.client) throw new Error("Anthropic client not initialized");
    const { system, messages } = this.splitMessages(req.messages);
    const res = await this.client.messages.create({
      model: this.defaultModel,
      system,
      messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    if (!this.client) throw new Error("Anthropic client not initialized");
    const { system, messages } = this.splitMessages(req.messages);
    const stream = await this.client.messages.stream({
      model: this.defaultModel,
      system,
      messages,
      temperature: req.temperature ?? 0.8,
      max_tokens: req.maxTokens ?? 2048,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}
