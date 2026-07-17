/**
 * 多 Provider 图片生成抽象层 - 统一接口
 * ----------------------------------------------
 * 支持的 Provider：
 *   - openai      (DALL-E 3)
 *   - stability   (Stable Diffusion XL)
 *   - zhipu       (智谱 CogView-3)
 *   - volcengine  (字节 Seedream / 即梦)
 *   - mock        (返回占位图 URL)
 */

export type ImageProviderId =
  | "openai"
  | "stability"
  | "zhipu"
  | "volcengine"
  | "mock";

export interface ImageRequest {
  prompt: string;
  /** 期望尺寸，会被各 Provider 映射到支持的最近尺寸 */
  size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  /** 风格附加描述（用于漫画/真实/动漫等切换） */
  styleHint?: string;
}

export interface ImageResult {
  /** 最终可访问的图片 URL */
  url: string;
  /** Provider 标识 */
  provider: ImageProviderId;
  /** 生成耗时（毫秒） */
  elapsedMs: number;
  /** 是否为兜底占位图 */
  fallback: boolean;
}

export interface ImageProvider {
  readonly id: ImageProviderId;
  readonly name: string;
  readonly available: boolean;
  generate(req: ImageRequest): Promise<ImageResult>;
}
