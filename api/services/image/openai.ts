import OpenAI from "openai";
import type { ImageProvider, ImageRequest, ImageResult } from "./types";

/**
 * OpenAI DALL-E 3 图片生成
 */
export class OpenAIImageProvider implements ImageProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI DALL-E 3";
  readonly available: boolean;

  private client: OpenAI | null;
  private model: string;
  private size: string;
  private quality: string;

  constructor() {
    const key = process.env.OPENAI_API_KEY ?? "";
    this.available = Boolean(key);
    this.model = process.env.OPENAI_IMG_MODEL ?? "dall-e-3";
    this.size = process.env.OPENAI_IMG_SIZE ?? "1024x1024";
    this.quality = process.env.OPENAI_IMG_QUALITY ?? "standard";
    this.client = key
      ? new OpenAI({
          apiKey: key,
          baseURL: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
        })
      : null;
  }

  async generate(req: ImageRequest): Promise<ImageResult> {
    if (!this.client) throw new Error("OpenAI client not initialized");
    const start = Date.now();
    const fullPrompt = req.styleHint ? `${req.prompt} · ${req.styleHint}` : req.prompt;
    const res = await this.client.images.generate({
      model: this.model,
      prompt: fullPrompt,
      n: 1,
      size: this.mapSize(req.size) as "1024x1024" | "1792x1024" | "1024x1792",
      quality: this.quality as "standard" | "hd",
    });
    const url = res.data?.[0]?.url ?? "";
    return {
      url,
      provider: this.id,
      elapsedMs: Date.now() - start,
      fallback: false,
    };
  }

  private mapSize(size?: ImageRequest["size"]): string {
    switch (size) {
      case "landscape_4_3":
      case "landscape_16_9":
        return "1792x1024";
      case "portrait_4_3":
      case "portrait_16_9":
        return "1024x1792";
      default:
        return this.size;
    }
  }
}
