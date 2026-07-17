/**
 * 前端类型入口 - 重新导出共享类型，保持单一来源
 */
export type {
  Work,
  WorkCategory,
  Character,
  Frame,
  Episode,
  StudioStep,
  StudioState,
  AiCapability,
  PricePlan,
  FaqItem,
  ImageSize,
  // API 请求 / 响应
  GenerateScriptRequest,
  GenerateScriptResponse,
  GenerateImageRequest,
  GenerateImageResponse,
  PlatformStats,
  HealthResponse,
  // 用户与认证
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  // 项目与协作
  ProjectRole,
  ProjectMember,
  ProjectVisibility,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  // 应用设置（API 接入）
  ProviderConfig,
  ProviderGroupSettings,
  AppSettings,
  ProviderConfigMasked,
  ProviderGroupSettingsMasked,
  AppSettingsMasked,
  UpdateSettingsRequest,
  TestProviderRequest,
  TestProviderResponse,
} from "../../shared/types";
