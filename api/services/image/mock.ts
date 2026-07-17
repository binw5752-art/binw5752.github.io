import type { ImageProvider, ImageRequest, ImageResult } from "./types";

/**
 * Mock 图片 Provider - 兜底
 * 没有真实 Key 时，使用 trae 内置的 text_to_image 接口生成占位图
 * 或退化为纯色占位图（最坏情况）
 */
export class MockImageProvider implements ImageProvider {
  readonly id = "mock" as const;
  readonly name = "Mock (本地占位)";
  readonly available = true;

  async generate(req: ImageRequest): Promise<ImageResult> {
    const start = Date.now();
    const size = req.size ?? "square";
    // 优先用 trae 内置图片接口（保证有图）
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      req.prompt
    )}&image_size=${size}`;
    return {
      url,
      provider: this.id,
      elapsedMs: Date.now() - start,
      fallback: true,
    };
  }
}
