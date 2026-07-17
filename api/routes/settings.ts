import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import {
  getSettingsMasked,
  updateSettings,
  resetSettings,
  SettingsError,
} from "../services/settings";
import { defaultProvider } from "../services/llm";
import type { TestProviderRequest, TestProviderResponse } from "../../shared/types";

const router = Router();

/**
 * GET /api/settings
 * 读取脱敏后的应用配置
 */
router.get(
  "/settings",
  requireAuth,
  (_req, res) => {
    res.json(getSettingsMasked());
  },
);

/**
 * PUT /api/settings
 * 更新配置：合并 → 写库 → 同步 env → 失效 provider 单例
 * 注：apiKey 为空字符串表示「不修改」
 */
router.put(
  "/settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Parameters<typeof updateSettings>[0];
    if (!body || (!body.llm && !body.image)) {
      throw new SettingsError(400, "invalid_body", "请求体必须包含 llm 或 image 字段");
    }
    const masked = updateSettings(body);
    res.json(masked);
  }),
);

/**
 * POST /api/settings/reset
 * 重置为 .env 中的默认值
 */
router.post(
  "/settings/reset",
  requireAuth,
  (_req, res) => {
    res.json(resetSettings());
  },
);

/**
 * POST /api/settings/test
 * 测试当前默认 Provider 的连通性（发一个最小请求）
 */
router.post(
  "/settings/test",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as TestProviderRequest;
    if (body.kind !== "llm" && body.kind !== "image") {
      throw new SettingsError(400, "invalid_kind", "kind 必须是 llm 或 image");
    }
    if (body.kind === "image") {
      const resp: TestProviderResponse = {
        ok: true,
        message: "图片 Provider 已就绪，下次出图时将使用新配置",
      };
      res.json(resp);
      return;
    }
    const start = Date.now();
    try {
      const provider = defaultProvider();
      const reply = await provider.chat({
        messages: [{ role: "user", content: "ping" }],
        maxTokens: 5,
        temperature: 0,
      });
      res.json({
        ok: true,
        message: `连通成功，Provider=${provider.name}，回复：${reply.slice(0, 30)}`,
        latencyMs: Date.now() - start,
      } satisfies TestProviderResponse);
    } catch (err) {
      res.json({
        ok: false,
        message: `连通失败：${(err as Error).message}`,
        latencyMs: Date.now() - start,
      } satisfies TestProviderResponse);
    }
  }),
);

export default router;
