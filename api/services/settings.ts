/**
 * 应用设置服务（API 接入）
 * ----------------------------------------------
 * - 读：从 db.settings 取，对外返回脱敏视图
 * - 写：合并 patch 到 db.settings，并同步到 process.env
 *       同时通知 LLM/Image Provider 模块失效单例缓存
 *       下次调用 defaultProvider() 会按新 env 重新构造实例
 */
import type {
  AppSettings,
  AppSettingsMasked,
  ProviderConfig,
  ProviderConfigMasked,
  ProviderGroupSettings,
  ProviderGroupSettingsMasked,
  UpdateSettingsRequest,
} from "../../shared/types";
import { db, saveDb, defaultSettings } from "./db";
import { invalidateDefaultProvider } from "./llm";
import { invalidateDefaultImageProvider } from "./image";

/** LLM Provider 的 env 变量映射 */
const LLM_ENV_MAP: Record<string, { key: string; model: string; baseUrl: string }> = {
  openai: { key: "OPENAI_API_KEY", model: "OPENAI_MODEL", baseUrl: "OPENAI_BASE_URL" },
  anthropic: { key: "ANTHROPIC_API_KEY", model: "ANTHROPIC_MODEL", baseUrl: "ANTHROPIC_BASE_URL" },
  zhipu: { key: "ZHIPU_API_KEY", model: "ZHIPU_MODEL", baseUrl: "ZHIPU_BASE_URL" },
  qwen: { key: "QWEN_API_KEY", model: "QWEN_MODEL", baseUrl: "QWEN_BASE_URL" },
  deepseek: { key: "DEEPSEEK_API_KEY", model: "DEEPSEEK_MODEL", baseUrl: "DEEPSEEK_BASE_URL" },
  moonshot: { key: "MOONSHOT_API_KEY", model: "MOONSHOT_MODEL", baseUrl: "MOONSHOT_BASE_URL" },
};

/** Image Provider 的 env 变量映射 */
const IMAGE_ENV_MAP: Record<string, { key: string; model: string; baseUrl: string }> = {
  openai: { key: "OPENAI_API_KEY", model: "OPENAI_IMG_MODEL", baseUrl: "OPENAI_BASE_URL" },
  stability: { key: "STABILITY_API_KEY", model: "STABILITY_MODEL", baseUrl: "STABILITY_BASE_URL" },
  zhipu: { key: "ZHIPU_API_KEY", model: "ZHIPU_IMG_MODEL", baseUrl: "ZHIPU_BASE_URL" },
  volcengine: { key: "VOLCENGINE_API_KEY", model: "VOLCENGINE_IMG_MODEL", baseUrl: "VOLCENGINE_BASE_URL" },
};

export class SettingsError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** 读取完整配置（不脱敏，仅内部使用） */
export function getSettings(): AppSettings {
  return db().settings;
}

/** 读取脱敏后的配置（API 返回用） */
export function getSettingsMasked(): AppSettingsMasked {
  return maskSettings(db().settings);
}

/** 更新配置：合并 patch → 写库 → 同步 env → 失效 provider 单例 */
export function updateSettings(patch: UpdateSettingsRequest): AppSettingsMasked {
  const current = db().settings;
  const next: AppSettings = {
    llm: mergeGroup(patch.llm, current.llm),
    image: mergeGroup(patch.image, current.image),
  };
  const newDb = { ...db(), settings: next };
  saveDb(newDb);
  applySettingsToEnv(next);
  invalidateDefaultProvider();
  invalidateDefaultImageProvider();
  console.log("[settings] 已更新 API 接入配置并热重载 Provider");
  return maskSettings(next);
}

/** 重置为默认（从 .env 重读） */
export function resetSettings(): AppSettingsMasked {
  const def = defaultSettings();
  const newDb = { ...db(), settings: def };
  saveDb(newDb);
  applySettingsToEnv(def);
  invalidateDefaultProvider();
  invalidateDefaultImageProvider();
  return maskSettings(def);
}

/**
 * 把 settings 同步到 process.env
 * 让各 Provider 构造函数中 process.env.XXX ?? "" 直接生效
 */
function applySettingsToEnv(s: AppSettings): void {
  // LLM
  process.env.LLM_PROVIDER = s.llm.defaultProvider === "auto" ? "" : s.llm.defaultProvider;
  for (const [id, cfg] of Object.entries(s.llm.providers)) {
    const spec = LLM_ENV_MAP[id];
    if (!spec) continue;
    process.env[spec.key] = cfg.apiKey;
    process.env[spec.model] = cfg.model;
    process.env[spec.baseUrl] = cfg.baseUrl;
  }
  // Image
  process.env.IMG_PROVIDER = s.image.defaultProvider === "auto" ? "" : s.image.defaultProvider;
  for (const [id, cfg] of Object.entries(s.image.providers)) {
    const spec = IMAGE_ENV_MAP[id];
    if (!spec) continue;
    process.env[spec.key] = cfg.apiKey;
    process.env[spec.model] = cfg.model;
    process.env[spec.baseUrl] = cfg.baseUrl;
  }
}

/** 合并：前端发来的 patch 覆盖当前值；空字符串 apiKey 表示「不修改」 */
function mergeGroup(
  patch: ProviderGroupSettings | undefined,
  current: ProviderGroupSettings,
): ProviderGroupSettings {
  if (!patch) return current;
  const providers: Record<string, ProviderConfig> = { ...current.providers };
  if (patch.providers) {
    for (const [id, cfg] of Object.entries(patch.providers)) {
      if (!cfg) continue;
      const base = providers[id];
      if (!base) continue; // 未知 provider 忽略
      const apiKey = cfg.apiKey === "" ? base.apiKey : cfg.apiKey;
      providers[id] = {
        enabled: cfg.enabled,
        apiKey,
        model: cfg.model || base.model,
        baseUrl: cfg.baseUrl || base.baseUrl,
      };
    }
  }
  return {
    defaultProvider: patch.defaultProvider || current.defaultProvider,
    providers,
  };
}

function maskSettings(s: AppSettings): AppSettingsMasked {
  return {
    llm: maskGroup(s.llm),
    image: maskGroup(s.image),
  };
}

function maskGroup(g: ProviderGroupSettings): ProviderGroupSettingsMasked {
  const providers: Record<string, ProviderConfigMasked> = {};
  for (const [id, cfg] of Object.entries(g.providers)) {
    providers[id] = maskProvider(cfg);
  }
  return { defaultProvider: g.defaultProvider, providers };
}

function maskProvider(p: ProviderConfig): ProviderConfigMasked {
  return {
    enabled: p.enabled,
    apiKeyMasked: maskApiKey(p.apiKey),
    hasApiKey: Boolean(p.apiKey),
    model: p.model,
    baseUrl: p.baseUrl,
  };
}

/** 脱敏：sk-abcd...wxyz → sk-a***wxyz */
function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "*".repeat(key.length);
  return key.slice(0, 4) + "***" + key.slice(-4);
}
