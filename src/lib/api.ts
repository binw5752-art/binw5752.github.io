/**
 * 前端统一 API 客户端
 *
 * - 通过 Vite proxy 访问 /api/*
 * - 自动 JSON 解析与错误归一化
 * - 与后端 shared/types 保持类型一致
 */
import type {
  Work,
  WorkCategory,
  PlatformStats,
  GenerateScriptRequest,
  GenerateScriptResponse,
  GenerateImageRequest,
  GenerateImageResponse,
  HealthResponse,
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  AppSettingsMasked,
  UpdateSettingsRequest,
  TestProviderRequest,
  TestProviderResponse,
} from "@/types";

const BASE = "/api";
const TOKEN_KEY = "mojing_token";

/** 后端 list 类接口统一返回 { items, total? } */
interface ListResponse<T> {
  items: T[];
  total?: number;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

/** Token 管理 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  init?: RequestInit,
  /** 超时 ms，默认 30s */
  timeoutMs = 30_000,
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const token = getToken();
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    const isJson = (res.headers.get("content-type") ?? "").includes(
      "application/json",
    );
    const body = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const err =
        typeof body === "object" && body
          ? (body as { message?: string; error?: string })
          : {};
      throw new ApiError(
        res.status,
        err.error ?? "http_error",
        err.message ?? `HTTP ${res.status}`,
      );
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

// ============= 作品相关 =============

export const api = {
  // 作品列表
  listWorks: (params?: { category?: WorkCategory | "全部"; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<ListResponse<Work>>(`/works${suffix}`);
  },

  // 作品详情
  getWork: (id: string) => request<Work>(`/works/${id}`),

  // 相关推荐
  getRelatedWorks: (id: string, limit = 4) =>
    request<ListResponse<Work>>(`/works/${id}/related?limit=${limit}`),

  // 排行榜
  getRanking: (period: "day" | "week" | "month" = "week") =>
    request<ListResponse<Work> & { period: string }>(`/ranking?period=${period}`),

  // 分类（后端实际返回 {name, color} 对象数组）
  getCategories: () =>
    request<ListResponse<{ name: WorkCategory; color: string }>>(`/categories`),

  // 平台统计
  getStats: () => request<PlatformStats>(`/stats`),

  // ============= AI 相关 =============

  // 一次性生成剧本
  generateScript: (req: GenerateScriptRequest) =>
    request<GenerateScriptResponse>(`/ai/script`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // 生成图片
  generateImage: (req: GenerateImageRequest) =>
    request<GenerateImageResponse>(`/ai/image`, {
      method: "POST",
      body: JSON.stringify(req),
      // 图片生成可能较慢
    }).catch((e) => {
      // 兜底：若后端不可用，使用 trae 内置 text_to_image
      if (e instanceof ApiError || e instanceof TypeError) {
        return fallbackGenerateImage(req);
      }
      throw e;
    }),

  // ============= 健康 =============
  health: () => request<HealthResponse>(`/health`),

  // ============= 认证 =============
  register: (req: RegisterRequest) =>
    request<AuthResponse>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  login: (req: LoginRequest) =>
    request<AuthResponse>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  me: () => request<User>(`/auth/me`),

  checkAccount: (account: string) =>
    request<{ exists: boolean }>(
      `/auth/check?account=${encodeURIComponent(account)}`,
    ),

  // ============= 项目 =============
  listProjects: () => request<ListResponse<Project>>(`/projects`),

  createProject: (req: CreateProjectRequest) =>
    request<Project>(`/projects`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  getProject: (id: string) => request<Project>(`/projects/${id}`),

  updateProject: (id: string, req: UpdateProjectRequest) =>
    request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(req),
    }),

  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }),

  inviteMember: (id: string, req: InviteMemberRequest) =>
    request<Project>(`/projects/${id}/members`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  updateMemberRole: (
    id: string,
    userId: string,
    req: UpdateMemberRoleRequest,
  ) =>
    request<Project>(`/projects/${id}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(req),
    }),

  removeMember: (id: string, userId: string) =>
    request<Project>(`/projects/${id}/members/${userId}`, {
      method: "DELETE",
    }),

  // ============= 应用设置（API 接入） =============
  getSettings: () => request<AppSettingsMasked>(`/settings`),

  updateSettings: (req: UpdateSettingsRequest) =>
    request<AppSettingsMasked>(`/settings`, {
      method: "PUT",
      body: JSON.stringify(req),
    }),

  resetSettings: () =>
    request<AppSettingsMasked>(`/settings/reset`, { method: "POST" }),

  testProvider: (req: TestProviderRequest) =>
    request<TestProviderResponse>(
      `/settings/test`,
      {
        method: "POST",
        body: JSON.stringify(req),
      },
      // 测试连通性可能慢
      20_000,
    ),
};

export default api;

/**
 * 图片生成兜底：当后端不可用时，前端直接调用 trae 内置 text_to_image
 * 这样即使没有后端，AI 创作工作台也能生成图片
 */
function fallbackGenerateImage(
  req: GenerateImageRequest,
): Promise<GenerateImageResponse> {
  const prompt = req.prompt + (req.styleHint ? ` · ${req.styleHint}` : "");
  const url =
    "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(prompt) +
    "&image_size=" +
    (req.size ?? "landscape_4_3");
  return Promise.resolve({
    url,
    provider: "trae-fallback",
    elapsedMs: 0,
    fallback: true,
  });
}
