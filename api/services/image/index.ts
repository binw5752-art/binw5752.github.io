import type { ImageProvider, ImageProviderId, ImageRequest, ImageResult } from "./types";
import { OpenAIImageProvider } from "./openai";
import { StabilityProvider } from "./stability";
import { ZhipuImageProvider } from "./zhipu";
import { VolcengineImageProvider } from "./volcengine";
import { MockImageProvider } from "./mock";

const registry: Record<ImageProviderId, () => ImageProvider> = {
  openai: () => new OpenAIImageProvider(),
  stability: () => new StabilityProvider(),
  zhipu: () => new ZhipuImageProvider(),
  volcengine: () => new VolcengineImageProvider(),
  mock: () => new MockImageProvider(),
};

export function listImageProviders() {
  return (Object.keys(registry) as ImageProviderId[]).map((id) => {
    const p = registry[id]();
    return { id, name: p.name, available: p.available };
  });
}

export function getImageProvider(id: ImageProviderId): ImageProvider {
  return registry[id]();
}

/**
 * 自动选择默认图片 Provider
 * 优先级：IMG_PROVIDER 环境变量 → 第一个有 Key 的 → Mock
 */
export function getDefaultImageProvider(): ImageProvider {
  const configured = (process.env.IMG_PROVIDER ?? "") as ImageProviderId;
  if (configured && registry[configured]) {
    const p = registry[configured]();
    if (p.available) return p;
    console.warn(
      `[image] IMG_PROVIDER=${configured} 但 Key 未配置，回退到自动选择`
    );
  }
  const order: ImageProviderId[] = ["openai", "stability", "zhipu", "volcengine"];
  for (const id of order) {
    const p = registry[id]();
    if (p.available) {
      console.log(`[image] 自动选用 Provider: ${p.name}`);
      return p;
    }
  }
  console.log("[image] 未找到任何真实图片 Key，降级到 Mock 占位图");
  return new MockImageProvider();
}

let _default: ImageProvider | null = null;
export function defaultImageProvider(): ImageProvider {
  if (!_default) _default = getDefaultImageProvider();
  return _default;
}

/** 失效缓存的默认 Provider，下次 defaultImageProvider() 会重新探测 */
export function invalidateDefaultImageProvider(): void {
  _default = null;
}

export async function generateImage(req: ImageRequest): Promise<ImageResult> {
  return defaultImageProvider().generate(req);
}

export type { ImageProvider, ImageProviderId, ImageRequest, ImageResult } from "./types";
