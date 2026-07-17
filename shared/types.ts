/**
 * 前后端共享的类型定义
 * 前后端都从这里导入
 */

export type WorkCategory = "热血" | "治愈" | "悬疑" | "古风" | "科幻" | "恋爱";

export type ImageSize =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export interface Character {
  id: string;
  name: string;
  avatar: string;
  traits: string[];
  bio: string;
  color: string;
}

export interface Frame {
  id: string;
  index: number;
  imageUrl: string;
  dialogue: string;
  sceneDesc: string;
  characterId?: string;
}

export interface Episode {
  id: string;
  index: number;
  title: string;
  frames: Frame[];
}

export interface Work {
  id: string;
  title: string;
  cover: string;
  category: WorkCategory;
  synopsis: string;
  heat: number;
  episodes: Episode[];
  characters: Character[];
  author: string;
  createdAt: string;
  tags: string[];
  trending?: "up" | "down" | "flat";
}

// ============= 工作台前端状态 =============
export type StudioStep = "script" | "storyboard" | "character" | "render";

export interface StudioState {
  currentStep: StudioStep;
  scriptInput: string;
  selectedStyle: string;
  selectedLength: string;
  generatedScript: string;
  isGenerating: boolean;
  frames: Frame[];
  characters: Character[];
  renderProgress: number;
  setStep: (step: StudioStep) => void;
  setScriptInput: (input: string) => void;
  setStyle: (style: string) => void;
  setLength: (length: string) => void;
  setGeneratedScript: (script: string) => void;
  setGenerating: (v: boolean) => void;
  setFrames: (frames: Frame[]) => void;
  reorderFrames: (from: number, to: number) => void;
  setRenderProgress: (n: number) => void;
  reset: () => void;
}

// ============= 站点配置类型 =============
export interface AiCapability {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  accent: "cinnabar" | "celadon" | "gold";
}

export interface PricePlan {
  id: string;
  name: string;
  price: number;
  period: string;
  tagline: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
  cta: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

// ============= API 请求/响应 =============
export interface GenerateScriptRequest {
  theme: string;
  style?: string;
  length?: string;
  /** 是否流式输出 */
  stream?: boolean;
}

export interface GenerateScriptResponse {
  script: string;
  provider: string;
  elapsedMs: number;
}

export interface GenerateImageRequest {
  prompt: string;
  size?: ImageSize;
  styleHint?: string;
}

export interface GenerateImageResponse {
  url: string;
  provider: string;
  elapsedMs: number;
  fallback: boolean;
}

export interface PlatformStats {
  works: number;
  creators: number;
  plays: number;
  frames: number;
}

export interface HealthResponse {
  status: "ok";
  llm: { id: string; name: string; available: boolean }[];
  image: { id: string; name: string; available: boolean }[];
  defaultLlm: string;
  defaultImage: string;
}

// ============= 用户与认证 =============
export interface User {
  id: string;
  username: string;
  email: string;
  /** 头像 URL（可空） */
  avatar?: string;
  /** 简介签名 */
  bio?: string;
  createdAt: string;
}

/** 注册请求 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** 登录请求 */
export interface LoginRequest {
  /** 邮箱或用户名 */
  account: string;
  password: string;
}

/** 登录/注册响应 */
export interface AuthResponse {
  token: string;
  user: User;
}

// ============= 项目与协作 =============
export type ProjectRole = "owner" | "editor" | "viewer";

export interface ProjectMember {
  userId: string;
  username: string;
  avatar?: string;
  role: ProjectRole;
  /** 加入时间 ISO */
  joinedAt: string;
}

export type ProjectVisibility = "private" | "public";

export interface Project {
  id: string;
  name: string;
  description: string;
  /** 封面图 URL */
  cover?: string;
  /** 风格 tag */
  style?: string;
  visibility: ProjectVisibility;
  ownerId: string;
  members: ProjectMember[];
  /** 项目当前所处创作步骤 */
  currentStep: StudioStep;
  /** 已生成的剧本 */
  script?: string;
  /** 关联的分镜帧（与 StudioState.frames 同结构） */
  frames?: Frame[];
  /** 创建/更新时间 */
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  style?: string;
  visibility?: ProjectVisibility;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  style?: string;
  visibility?: ProjectVisibility;
  currentStep?: StudioStep;
  script?: string;
  frames?: Frame[];
}

export interface InviteMemberRequest {
  /** 邮箱或用户名 */
  account: string;
  role?: ProjectRole;
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole;
}

// ============= 应用设置（API 接入） =============

/** 单个 Provider 的配置（LLM/Image 共用） */
export interface ProviderConfig {
  /** 是否启用 */
  enabled: boolean;
  /** API 密钥 */
  apiKey: string;
  /** 模型名 */
  model: string;
  /** 端点 URL（可空表示走 SDK 默认） */
  baseUrl: string;
}

/** 一类 Provider（LLM 或 Image）的配置集合 */
export interface ProviderGroupSettings {
  /** 默认使用的 Provider ID，"auto" 表示自动探测第一个可用的 */
  defaultProvider: string;
  /** key 为 provider id（如 openai/anthropic/zhipu/...） */
  providers: Record<string, ProviderConfig>;
}

/** 全局应用设置 */
export interface AppSettings {
  llm: ProviderGroupSettings;
  image: ProviderGroupSettings;
}

/** 脱敏后的 ProviderConfig（GET /settings 返回用） */
export interface ProviderConfigMasked {
  enabled: boolean;
  /** 脱敏后的 key（如 sk-***1234）；空字符串表示未配置 */
  apiKeyMasked: string;
  /** 是否已配置过 key（用于前端区分「未配置」与「清空」） */
  hasApiKey: boolean;
  model: string;
  baseUrl: string;
}

export interface ProviderGroupSettingsMasked {
  defaultProvider: string;
  providers: Record<string, ProviderConfigMasked>;
}

export interface AppSettingsMasked {
  llm: ProviderGroupSettingsMasked;
  image: ProviderGroupSettingsMasked;
}

/** 更新请求：与 AppSettings 同形，但 apiKey 可为空字符串表示「不修改」 */
export type UpdateSettingsRequest = AppSettings;

/** 测试连通性请求 */
export interface TestProviderRequest {
  kind: "llm" | "image";
  providerId: string;
}

export interface TestProviderResponse {
  ok: boolean;
  message: string;
  latencyMs?: number;
}
