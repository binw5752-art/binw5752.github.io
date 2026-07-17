import type { ImageSize } from "@/types";

/** 图片资源统一入口 - 通过文本生成图片 */
export function img(prompt: string, size: ImageSize = "portrait_4_3"): string {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;
}

/** 封面图生成 - 漫剧封面通用风格 */
export function cover(
  title: string,
  style: string,
  size: ImageSize = "portrait_4_3"
): string {
  return img(
    `Manga comic cover art titled "${title}", ${style} style, dramatic composition, dark moody background with vibrant neon accents, hand-drawn ink and halftone texture, high detail character portrait, cinematic lighting`,
    size
  );
}

/** 角色立绘 */
export function character(
  name: string,
  desc: string,
  size: ImageSize = "square"
): string {
  return img(
    `Anime manga character portrait of ${name}, ${desc}, half body, expressive face, detailed costume, dynamic lighting, ink wash painting background, vertical composition`,
    size
  );
}

/** 分镜画面 */
export function frame(
  sceneDesc: string,
  mood: string,
  size: ImageSize = "landscape_4_3"
): string {
  return img(
    `Manga panel scene: ${sceneDesc}, ${mood} atmosphere, dynamic camera angle, dramatic ink and tone shading, comic book style with halftone, cinematic storytelling frame`,
    size
  );
}
