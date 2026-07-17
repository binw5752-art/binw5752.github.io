/**
 * 多 Provider LLM 抽象层 - 统一接口定义
 * ----------------------------------------------------
 * 支持的 Provider：
 *   - openai      (GPT-4o / GPT-4o-mini)
 *   - anthropic   (Claude 3.5 Sonnet)
 *   - zhipu       (智谱 GLM-4-Plus)
 *   - qwen        (阿里通义 qwen-plus)
 *   - deepseek    (DeepSeek-Chat)
 *   - moonshot    (Moonshot Kimi)
 *
 * 每个 Provider 实现以下接口：
 *   - chat()       一次性返回完整文本
 *   - chatStream() 流式输出（async generator，逐 token yield）
 */

export type LlmProviderId =
  | "openai"
  | "anthropic"
  | "zhipu"
  | "qwen"
  | "deepseek"
  | "moonshot"
  | "mock";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /** 温度 0-2，越高越发散 */
  temperature?: number;
  /** 最大输出 token 数 */
  maxTokens?: number;
  /** 可选中止信号 */
  signal?: AbortSignal;
}

export interface ProviderInfo {
  id: LlmProviderId;
  name: string;
  /** 是否已配置有效 Key（运行时探测） */
  available: boolean;
  /** 默认模型名 */
  defaultModel: string;
}

export interface LlmProvider {
  readonly id: LlmProviderId;
  readonly name: string;
  readonly available: boolean;
  readonly defaultModel: string;

  /** 一次性返回完整文本 */
  chat(req: ChatRequest): Promise<string>;

  /** 流式输出，逐 token yield */
  chatStream(req: ChatRequest): AsyncGenerator<string, void, unknown>;
}
