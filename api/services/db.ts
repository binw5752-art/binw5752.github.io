/**
 * 简易 JSON 文件持久化层
 * ----------------------------------------------
 * - 整个数据库就是 data/db.json 一个文件
 * - 写入时先写临时文件再 rename，避免半写损坏
 * - 启动时自动加载，不存在则初始化
 * - 适合演示与小规模协作，不并发安全（单进程）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { AppSettings, ProviderConfig, ProviderGroupSettings } from "../../shared/types";

const DB_PATH = resolve(process.cwd(), "data/db.json");

export interface DbShape {
  users: DbUser[];
  /** 以 userId 为键的密码 hash 映射 */
  passwords: Record<string, string>;
  projects: DbProject[];
  /** 应用设置（API 接入） */
  settings: AppSettings;
}

export interface DbUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface DbMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: string;
}

export interface DbProject {
  id: string;
  name: string;
  description: string;
  cover?: string;
  style?: string;
  visibility: "private" | "public";
  ownerId: string;
  members: DbMember[];
  currentStep: "script" | "storyboard" | "character" | "render";
  script?: string;
  frames?: unknown[];
  createdAt: string;
  updatedAt: string;
}

const EMPTY_DB: DbShape = {
  users: [],
  passwords: {},
  projects: [],
  settings: defaultSettings(),
};

let cache: DbShape | null = null;

/**
 * 默认应用设置：从 process.env 读取初始值
 * 这样首次启动时既有「与 .env 一致」的初始数据，前端也能在 UI 上直接看到
 */
export function defaultSettings(): AppSettings {
  return {
    llm: groupFromEnv(
      ["openai", "anthropic", "zhipu", "qwen", "deepseek", "moonshot"],
      {
        openai: { key: "OPENAI_API_KEY", model: "OPENAI_MODEL", baseUrl: "OPENAI_BASE_URL", defaultModel: "gpt-4o-mini", defaultBaseUrl: "https://api.openai.com/v1" },
        anthropic: { key: "ANTHROPIC_API_KEY", model: "ANTHROPIC_MODEL", baseUrl: "ANTHROPIC_BASE_URL", defaultModel: "claude-3-5-sonnet-20241022", defaultBaseUrl: "" },
        zhipu: { key: "ZHIPU_API_KEY", model: "ZHIPU_MODEL", baseUrl: "ZHIPU_BASE_URL", defaultModel: "glm-4-plus", defaultBaseUrl: "https://open.bigmodel.cn/api/paas/v4" },
        qwen: { key: "QWEN_API_KEY", model: "QWEN_MODEL", baseUrl: "QWEN_BASE_URL", defaultModel: "qwen-plus", defaultBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
        deepseek: { key: "DEEPSEEK_API_KEY", model: "DEEPSEEK_MODEL", baseUrl: "DEEPSEEK_BASE_URL", defaultModel: "deepseek-chat", defaultBaseUrl: "https://api.deepseek.com/v1" },
        moonshot: { key: "MOONSHOT_API_KEY", model: "MOONSHOT_MODEL", baseUrl: "MOONSHOT_BASE_URL", defaultModel: "moonshot-v1-8k", defaultBaseUrl: "https://api.moonshot.cn/v1" },
      },
      process.env.LLM_PROVIDER ?? "auto",
    ),
    image: groupFromEnv(
      ["openai", "stability", "zhipu", "volcengine"],
      {
        openai: { key: "OPENAI_API_KEY", model: "OPENAI_IMG_MODEL", baseUrl: "OPENAI_BASE_URL", defaultModel: "dall-e-3", defaultBaseUrl: "https://api.openai.com/v1" },
        stability: { key: "STABILITY_API_KEY", model: "STABILITY_MODEL", baseUrl: "STABILITY_BASE_URL", defaultModel: "stable-diffusion-xl-1024-v1-0", defaultBaseUrl: "https://api.stability.ai/v1" },
        zhipu: { key: "ZHIPU_API_KEY", model: "ZHIPU_IMG_MODEL", baseUrl: "ZHIPU_BASE_URL", defaultModel: "cogview-3", defaultBaseUrl: "https://open.bigmodel.cn/api/paas/v4" },
        volcengine: { key: "VOLCENGINE_API_KEY", model: "VOLCENGINE_IMG_MODEL", baseUrl: "VOLCENGINE_BASE_URL", defaultModel: "seedream-v3-0", defaultBaseUrl: "https://ark.cn-beijing.volces.com/api/v3" },
      },
      process.env.IMG_PROVIDER ?? "auto",
    ),
  };
}

interface EnvSpec {
  key: string;
  model: string;
  baseUrl: string;
  defaultModel: string;
  defaultBaseUrl: string;
}

function groupFromEnv(
  ids: string[],
  specs: Record<string, EnvSpec>,
  defaultProvider: string,
): ProviderGroupSettings {
  const providers: Record<string, ProviderConfig> = {};
  for (const id of ids) {
    const spec = specs[id];
    const apiKey = process.env[spec.key] ?? "";
    providers[id] = {
      enabled: Boolean(apiKey),
      apiKey,
      model: process.env[spec.model] ?? spec.defaultModel,
      baseUrl: process.env[spec.baseUrl] ?? spec.defaultBaseUrl,
    };
  }
  return { defaultProvider, providers };
}

export function loadDb(): DbShape {
  if (cache) return cache;
  if (!existsSync(DB_PATH)) {
    cache = { ...EMPTY_DB, settings: defaultSettings() };
    saveDb(cache);
    return cache;
  }
  try {
    const raw = readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    cache = {
      users: parsed.users ?? [],
      passwords: parsed.passwords ?? {},
      projects: parsed.projects ?? [],
      settings: mergeSettings(parsed.settings),
    };
    return cache;
  } catch {
    console.warn("[db] 解析失败，重置为空库");
    cache = { ...EMPTY_DB, settings: defaultSettings() };
    saveDb(cache);
    return cache;
  }
}

/** 把 db 中可能存在的旧版/缺字段 settings 合并到默认值上 */
function mergeSettings(existing?: Partial<AppSettings>): AppSettings {
  const def = defaultSettings();
  if (!existing) return def;
  return {
    llm: mergeGroup(existing.llm, def.llm),
    image: mergeGroup(existing.image, def.image),
  };
}

function mergeGroup(
  existing: Partial<ProviderGroupSettings> | undefined,
  def: ProviderGroupSettings,
): ProviderGroupSettings {
  if (!existing) return def;
  const providers: Record<string, ProviderConfig> = { ...def.providers };
  if (existing.providers) {
    for (const [id, cfg] of Object.entries(existing.providers)) {
      if (!cfg) continue;
      const base = providers[id];
      providers[id] = {
        enabled: cfg.enabled ?? base?.enabled ?? false,
        apiKey: cfg.apiKey ?? base?.apiKey ?? "",
        model: cfg.model ?? base?.model ?? "",
        baseUrl: cfg.baseUrl ?? base?.baseUrl ?? "",
      };
    }
  }
  return {
    defaultProvider: existing.defaultProvider ?? def.defaultProvider,
    providers,
  };
}

export function saveDb(db: DbShape): void {
  // 原子写：先写临时文件，再 rename
  const tmp = DB_PATH + ".tmp";
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(tmp, JSON.stringify(db, null, 2), "utf-8");
  renameSync(tmp, DB_PATH);
  cache = db;
}

/** 直接返回可变引用，调用方改完调用 saveDb 持久化 */
export function db(): DbShape {
  return loadDb();
}

/** 重置数据库（仅用于测试/演示） */
export function resetDb(): void {
  cache = { ...EMPTY_DB, settings: defaultSettings() };
  saveDb(cache);
}
