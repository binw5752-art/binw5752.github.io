import type { LlmProvider, LlmProviderId, ProviderInfo } from "./types";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { ZhipuProvider } from "./zhipu";
import { QwenProvider } from "./qwen";
import { DeepSeekProvider } from "./deepseek";
import { MoonshotProvider } from "./moonshot";
import { MockProvider } from "./mock";

/**
 * 所有 Provider 注册表
 */
const registry: Record<LlmProviderId, () => LlmProvider> = {
  openai: () => new OpenAIProvider(),
  anthropic: () => new AnthropicProvider(),
  zhipu: () => new ZhipuProvider(),
  qwen: () => new QwenProvider(),
  deepseek: () => new DeepSeekProvider(),
  moonshot: () => new MoonshotProvider(),
  mock: () => new MockProvider(),
};

/**
 * 列出所有 Provider 状态
 */
export function listProviders(): ProviderInfo[] {
  return (Object.keys(registry) as LlmProviderId[]).map((id) => {
    const p = registry[id]();
    return {
      id,
      name: p.name,
      available: p.available,
      defaultModel: p.defaultModel,
    };
  });
}

/**
 * 根据 ID 获取 Provider 实例
 */
export function getProvider(id: LlmProviderId): LlmProvider {
  return registry[id]();
}

/**
 * 自动选择默认 Provider
 * 优先级：环境变量 LLM_PROVIDER → 第一个有 Key 的真实 Provider → Mock
 */
export function getDefaultProvider(): LlmProvider {
  const configured = (process.env.LLM_PROVIDER ?? "") as LlmProviderId;
  if (configured && registry[configured]) {
    const p = registry[configured]();
    if (p.available) return p;
    console.warn(
      `[llm] LLM_PROVIDER=${configured} 但 Key 未配置，回退到自动选择`
    );
  }
  // 自动探测：按顺序找第一个 available 的
  const order: LlmProviderId[] = [
    "openai",
    "anthropic",
    "zhipu",
    "qwen",
    "deepseek",
    "moonshot",
  ];
  for (const id of order) {
    const p = registry[id]();
    if (p.available) {
      console.log(`[llm] 自动选用 Provider: ${p.name}`);
      return p;
    }
  }
  console.log("[llm] 未找到任何真实 LLM Key，降级到 Mock 模式");
  return new MockProvider();
}

/** 单例 - 默认 Provider */
let _default: LlmProvider | null = null;
export function defaultProvider(): LlmProvider {
  if (!_default) _default = getDefaultProvider();
  return _default;
}

/** 失效缓存的默认 Provider，下次 defaultProvider() 会重新探测 */
export function invalidateDefaultProvider(): void {
  _default = null;
}

export type { LlmProvider, LlmProviderId, ChatRequest, ChatMessage, ProviderInfo } from "./types";
