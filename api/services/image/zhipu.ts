import OpenAI from "openai";
import type { ImageProvider, ImageRequest, ImageResult } from "./types";

/**
 * 智谱 CogView 图片生成
 * CogView-3 通过智谱 API 调用，返回图片 URL
 */
export class ZhipuImageProvider implements ImageProvider {
  readonly id = "zhipu" as const;
  readonly name = "智谱 CogView-3";
  readonly available: boolean;

  private client: OpenAI | null;
  private model: string;

  constructor() {
    const key = process.env.ZHIPU_API_KEY ?? "";
    this.model = process.env.ZHIPU_IMG_MODEL ?? "cogview-3";
    this.available = Boolean(key);
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL:
            process.env.ZHIPU_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4",
        })
      : null;
  }

  async generate(req: ImageRequest): Promise<ImageResult> {
    if (!this.client) throw new Error("Zhipu client not initialized");
    const start = Date.now();
    const fullPrompt = req.styleHint ? `${req.prompt} · ${req.styleHint}` : req.prompt;
    // CogView 通过 images.generations 接口
    // 注意：智谱 CogView 自有尺寸集合与 OpenAI DALL-E 不同，
    // 这里走 OpenAI 兼容协议但 size 用智谱标准，需断言绕过 SDK 类型
    const res = await this.client.images.generate({
      model: this.model,
      prompt: fullPrompt,
      n: 1,
      size: this.mapSize(req.size) as
        | "1024x1024"
        | "1792x1024"
        | "1024x1792"
        | "256x256"
        | "512x512",
    });
    const url = res.data?.[0]?.url ?? "";
    return {
      url,
      provider: this.id,
      elapsedMs: Date.now() - start,
      fallback: false,
    };
  }

  private mapSize(size?: ImageRequest["size"]): "1024x1024" | "768x1344" | "864x1152" | "1344x768" | "1152x864" | "1440x720" | "720x1440" {
    switch (size) {
      case "landscape_4_3": return "1152x864";
      case "landscape_16_9": return "1440x720";
      case "portrait_4_3": return "864x1152";
      case "portrait_16_9": return "720x1440";
      default: return "1024x1024";
    }
  }
}
