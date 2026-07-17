import type { ImageProvider, ImageRequest, ImageResult } from "./types";

/**
 * Stability AI (Stable Diffusion XL) 图片生成
 * 通过 REST API 调用
 */
export class StabilityProvider implements ImageProvider {
  readonly id = "stability" as const;
  readonly name = "Stable Diffusion XL";
  readonly available: boolean;

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY ?? "";
    this.baseUrl = process.env.STABILITY_BASE_URL ?? "https://api.stability.ai/v1";
    this.model =
      process.env.STABILITY_MODEL ?? "stable-diffusion-xl-1024-v1-0";
    this.available = Boolean(this.apiKey);
  }

  async generate(req: ImageRequest): Promise<ImageResult> {
    if (!this.apiKey) throw new Error("Stability key not configured");
    const start = Date.now();
    const { width, height } = this.mapSize(req.size);
    const fullPrompt = req.styleHint ? `${req.prompt}, ${req.styleHint}` : req.prompt;

    const url = `${this.baseUrl}/generation/${this.model}/text-to-image`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text_prompts: [{ text: fullPrompt, weight: 1 }],
        cfg_scale: 7,
        height,
        width,
        steps: 30,
        samples: 1,
      }),
    });
    if (!res.ok) {
      throw new Error(`Stability API error: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { artifacts?: { base64?: string }[] };
    const b64 = data.artifacts?.[0]?.base64;
    if (!b64) throw new Error("Stability returned no image");
    return {
      url: `data:image/png;base64,${b64}`,
      provider: this.id,
      elapsedMs: Date.now() - start,
      fallback: false,
    };
  }

  private mapSize(size?: ImageRequest["size"]): { width: number; height: number } {
    switch (size) {
      case "landscape_4_3":
        return { width: 1024, height: 768 };
      case "landscape_16_9":
        return { width: 1344, height: 768 };
      case "portrait_4_3":
        return { width: 768, height: 1024 };
      case "portrait_16_9":
        return { width: 768, height: 1344 };
      default:
        return { width: 1024, height: 1024 };
    }
  }
}
