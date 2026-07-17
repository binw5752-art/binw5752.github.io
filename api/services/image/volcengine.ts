import type { ImageProvider, ImageRequest, ImageResult } from "./types";

/**
 * 火山方舟 (Volcengine Ark) 图片生成
 * 支持 Seedream (即梦) 系列模型
 *
 * API 文档：https://www.volcengine.com/docs/82379
 *
 * 流程：调用方舟文生图接口，返回图片 URL 或 base64
 */
export class VolcengineImageProvider implements ImageProvider {
  readonly id = "volcengine" as const;
  readonly name = "火山方舟 Seedream";
  readonly available: boolean;

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.VOLCENGINE_API_KEY ?? "";
    this.baseUrl =
      process.env.VOLCENGINE_BASE_URL ?? "https://ark.cn-beijing.volces.com/api/v3";
    this.model = process.env.VOLCENGINE_IMG_MODEL ?? "seedream-v3-0";
    this.available = Boolean(this.apiKey);
  }

  async generate(req: ImageRequest): Promise<ImageResult> {
    if (!this.apiKey) throw new Error("Volcengine key not configured");
    const start = Date.now();
    const { width, height } = this.mapSize(req.size);
    const fullPrompt = req.styleHint ? `${req.prompt} · ${req.styleHint}` : req.prompt;

    // 调用方舟文生图接口
    const res = await fetch(`${this.baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: fullPrompt,
        size: `${width}x${height}`,
        n: 1,
        response_format: "url",
      }),
    });
    if (!res.ok) {
      throw new Error(`Volcengine API error: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { data?: { url?: string }[] };
    const url = data.data?.[0]?.url ?? "";
    if (!url) throw new Error("Volcengine returned no image");
    return {
      url,
      provider: this.id,
      elapsedMs: Date.now() - start,
      fallback: false,
    };
  }

  private mapSize(size?: ImageRequest["size"]): { width: number; height: number } {
    switch (size) {
      case "landscape_4_3": return { width: 1024, height: 768 };
      case "landscape_16_9": return { width: 1280, height: 720 };
      case "portrait_4_3": return { width: 768, height: 1024 };
      case "portrait_16_9": return { width: 720, height: 1280 };
      default: return { width: 1024, height: 1024 };
    }
  }
}
