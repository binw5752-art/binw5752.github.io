import { Router } from "express";
import type { Response } from "express";
import { defaultProvider, listProviders } from "../services/llm";
import { defaultImageProvider, listImageProviders, generateImage } from "../services/image";
import type {
  GenerateScriptRequest,
  GenerateImageRequest,
  HealthResponse,
} from "../../shared/types";
import { asyncHandler } from "../middleware/error";

const router = Router();

/**
 * 剧本生成的 system prompt
 */
const SCRIPT_SYSTEM_PROMPT = `你是墨境 MOJING 平台的 AI 剧本创作引擎，专精于短剧与漫画剧本创作。

输出要求：
1. 三幕式结构：序章、转折、高潮
2. 每幕包含：场景描述、人物对白、心理活动
3. 对白使用「」包裹，场景描述以独立段落呈现
4. 在结尾列出推荐分镜数与角色数
5. 保持紧凑，不要解释，直接输出剧本

格式示例：
▍第一幕 · 序章：[标题]

[场景描述]

人物：「对白」

---

请根据用户给出的主题、风格、长度创作。`;

/**
 * POST /api/ai/script
 * 一次性返回完整剧本
 */
router.post(
  "/ai/script",
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as GenerateScriptRequest;
    const { theme, style = "悬疑推理", length = "短篇 3 话" } = body;

    if (!theme || !theme.trim()) {
      return res.status(400).json({
        error: "invalid_param",
        message: "theme 不能为空",
        status: 400,
      });
    }

    const userPrompt = `主题：${theme}\n风格：${style}\n长度：${length}\n\n请开始创作。`;
    const provider = defaultProvider();
    const start = Date.now();

    const script = await provider.chat({
      messages: [
        { role: "system", content: SCRIPT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      maxTokens: 2048,
    });

    res.json({
      script,
      provider: provider.id,
      elapsedMs: Date.now() - start,
    });
  })
);

/**
 * POST /api/ai/script/stream
 * SSE 流式输出剧本
 *
 * 协议：text/event-stream
 * 事件：
 *   - meta    { provider, model }
 *   - delta   { content }    每个 token 片段
 *   - done    { elapsedMs }
 *   - error   { message }
 */
router.post("/ai/script/stream", (req, res: Response) => {
  const body = (req.body ?? {}) as GenerateScriptRequest;
  const { theme, style = "悬疑推理", length = "短篇 3 话" } = body;

  if (!theme || !theme.trim()) {
    res.status(400).json({
      error: "invalid_param",
      message: "theme 不能为空",
      status: 400,
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const userPrompt = `主题：${theme}\n风格：${style}\n长度：${length}\n\n请开始创作。`;
  const provider = defaultProvider();
  const start = Date.now();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send("meta", { provider: provider.id, model: provider.defaultModel });

  (async () => {
    try {
      for await (const delta of provider.chatStream({
        messages: [
          { role: "system", content: SCRIPT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        maxTokens: 2048,
      })) {
        send("delta", { content: delta });
      }
      send("done", { elapsedMs: Date.now() - start });
    } catch (err) {
      send("error", { message: (err as Error).message });
    } finally {
      res.end();
    }
  })();
});

/**
 * POST /api/ai/image
 * 生成单张图片
 */
router.post(
  "/ai/image",
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as GenerateImageRequest;
    const { prompt, size, styleHint } = body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "invalid_param",
        message: "prompt 不能为空",
        status: 400,
      });
    }

    const result = await generateImage({
      prompt,
      size: size,
      styleHint,
    });

    res.json({
      url: result.url,
      provider: result.provider,
      elapsedMs: result.elapsedMs,
      fallback: result.fallback,
    });
  })
);

/**
 * GET /api/health
 * 返回服务状态与所有 Provider 配置情况
 */
router.get("/health", (_req, res) => {
  const llm = defaultProvider();
  const img = defaultImageProvider();
  const response: HealthResponse = {
    status: "ok",
    llm: listProviders().map((p) => ({
      id: p.id,
      name: p.name,
      available: p.available,
    })),
    image: listImageProviders().map((p) => ({
      id: p.id,
      name: p.name,
      available: p.available,
    })),
    defaultLlm: llm.id,
    defaultImage: img.id,
  };
  res.json(response);
});

export default router;
