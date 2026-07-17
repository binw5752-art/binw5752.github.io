import type { ChatRequest, LlmProvider } from "./types";
import { mockScript } from "./mock-data";

/**
 * Mock Provider - 兜底
 * 在没有任何真实 Key 时使用，模拟流式输出
 */
export class MockProvider implements LlmProvider {
  readonly id = "mock" as const;
  readonly name = "Mock (本地演示)";
  readonly available = true;
  readonly defaultModel = "mock-v1";

  async chat(req: ChatRequest): Promise<string> {
    const userMsg = req.messages.find((m) => m.role === "user")?.content ?? "";
    await delay(800);
    return mockScript(userMsg);
  }

  async *chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown> {
    const userMsg = req.messages.find((m) => m.role === "user")?.content ?? "";
    const full = mockScript(userMsg);
    // 模拟逐 token 流式输出
    await delay(400);
    const chunks = full.match(/.{1,4}/gs) ?? [full];
    for (const c of chunks) {
      await delay(20 + Math.random() * 40);
      yield c;
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
