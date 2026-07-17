import { useEffect, useMemo, useState } from "react";
import {
  Settings as SettingsIcon,
  Loader2,
  Save,
  RotateCcw,
  Plug,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Key,
  Server,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";
import type {
  AppSettings,
  AppSettingsMasked,
  ProviderConfig,
  ProviderGroupSettings,
  UpdateSettingsRequest,
} from "@/types";

// ============= Provider 元数据 =============

interface ProviderMeta {
  id: string;
  name: string;
  desc: string;
  /** 官网或文档链接 */
  docsUrl: string;
  /** key 获取链接 */
  keyUrl?: string;
  /** key 前缀示例 */
  keyPrefix?: string;
}

const LLM_PROVIDERS: ProviderMeta[] = [
  { id: "openai", name: "OpenAI", desc: "GPT-4o / GPT-4o-mini / GPT-3.5 等通用对话模型", docsUrl: "https://platform.openai.com/docs", keyUrl: "https://platform.openai.com/api-keys", keyPrefix: "sk-" },
  { id: "anthropic", name: "Anthropic Claude", desc: "Claude 3.5 Sonnet / Haiku / Opus", docsUrl: "https://docs.anthropic.com", keyUrl: "https://console.anthropic.com/settings/keys", keyPrefix: "sk-ant-" },
  { id: "zhipu", name: "智谱 GLM", desc: "国产 GLM-4-Plus / GLM-4-Flash，兼容 OpenAI 协议", docsUrl: "https://open.bigmodel.cn/dev/api", keyUrl: "https://open.bigmodel.cn/usercenter/apikeys", keyPrefix: "" },
  { id: "qwen", name: "通义千问", desc: "阿里 DashScope，兼容 OpenAI 协议", docsUrl: "https://help.aliyun.com/zh/dashscope", keyUrl: "https://dashscope.console.aliyun.com/apiKey", keyPrefix: "sk-" },
  { id: "deepseek", name: "DeepSeek", desc: "DeepSeek-Chat / DeepSeek-Coder，性价比高", docsUrl: "https://platform.deepseek.com/api-docs", keyUrl: "https://platform.deepseek.com/api_keys", keyPrefix: "sk-" },
  { id: "moonshot", name: "Moonshot Kimi", desc: "Moonshot-v1 系列，长上下文友好", docsUrl: "https://platform.moonshot.cn/docs", keyUrl: "https://platform.moonshot.cn/console/api-keys", keyPrefix: "sk-" },
];

const IMAGE_PROVIDERS: ProviderMeta[] = [
  { id: "openai", name: "OpenAI DALL-E 3", desc: "DALL-E 3 / DALL-E 2", docsUrl: "https://platform.openai.com/docs/api-reference/images", keyUrl: "https://platform.openai.com/api-keys", keyPrefix: "sk-" },
  { id: "stability", name: "Stable Diffusion XL", desc: "Stability AI 出品，开源生态主流", docsUrl: "https://platform.stability.ai/docs/api-reference", keyUrl: "https://platform.stability.ai/account/keys", keyPrefix: "sk-" },
  { id: "zhipu", name: "智谱 CogView-3", desc: "国产文生图模型", docsUrl: "https://open.bigmodel.cn/dev/api/cogview-3", keyUrl: "https://open.bigmodel.cn/usercenter/apikeys", keyPrefix: "" },
  { id: "volcengine", name: "火山方舟 Seedream", desc: "字节 Seedream-v3，国产生图模型", docsUrl: "https://www.volcengine.com/docs/82379", keyUrl: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey", keyPrefix: "" },
];

// ============= 页面 =============

type Tab = "llm" | "image";

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("llm");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  /** 后端返回的脱敏视图，仅用于显示「当前已保存」状态 */
  const [masked, setMasked] = useState<AppSettingsMasked | null>(null);
  /** 用户编辑中的完整配置（apiKey 为空表示「不修改」） */
  const [draft, setDraft] = useState<AppSettings | null>(null);
  /** 每个 provider 是否显示明文 key（默认脱敏星号） */
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  /** 测试中状态 */
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<
    Record<string, { ok: boolean; message: string } | undefined>
  >({});

  // 拉取
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getSettings()
      .then((m) => {
        if (cancelled) return;
        setMasked(m);
        setDraft(maskedToDraft(m));
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "加载配置失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const group = useMemo(
    () => (draft ? (tab === "llm" ? draft.llm : draft.image) : null),
    [draft, tab],
  );
  const groupMasked = useMemo(
    () => (masked ? (tab === "llm" ? masked.llm : masked.image) : null),
    [masked, tab],
  );
  const metas = tab === "llm" ? LLM_PROVIDERS : IMAGE_PROVIDERS;

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await api.updateSettings(draft);
      setMasked(next);
      setDraft(maskedToDraft(next));
      setSuccess("配置已保存并热重载，新 Provider 立即生效");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("确定要重置所有 API 配置吗？将恢复到 .env 中的默认值。")) return;
    setResetting(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await api.resetSettings();
      setMasked(next);
      setDraft(maskedToDraft(next));
      setSuccess("已重置为 .env 默认值");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "重置失败");
    } finally {
      setResetting(false);
    }
  };

  const handleTest = async (providerId: string) => {
    if (!draft) return;
    setTesting(providerId);
    setTestResult((prev) => ({ ...prev, [providerId]: undefined }));
    try {
      // 临时把当前 draft 提交后再测试，确保新配置生效
      await api.updateSettings(draft);
      const r = await api.testProvider({ kind: tab, providerId });
      setTestResult((prev) => ({
        ...prev,
        [providerId]: { ok: r.ok, message: r.message },
      }));
    } catch (e) {
      setTestResult((prev) => ({
        ...prev,
        [providerId]: {
          ok: false,
          message: e instanceof ApiError ? e.message : "测试失败",
        },
      }));
    } finally {
      setTesting(null);
    }
  };

  // 单个 provider 字段更新
  const updateProvider = (
    id: string,
    field: keyof ProviderConfig,
    value: string | boolean,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const g = tab === "llm" ? prev.llm : prev.image;
      const cur = g.providers[id];
      const next: ProviderConfig = { ...cur, [field]: value } as ProviderConfig;
      // 如果填了 apiKey，自动把 enabled 设 true
      if (field === "apiKey" && typeof value === "string" && value.length > 0) {
        next.enabled = true;
      }
      const nextGroup: ProviderGroupSettings = {
        ...g,
        providers: { ...g.providers, [id]: next },
      };
      return tab === "llm"
        ? { ...prev, llm: nextGroup }
        : { ...prev, image: nextGroup };
    });
  };

  const setDefaultProvider = (id: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return tab === "llm"
        ? { ...prev, llm: { ...prev.llm, defaultProvider: id } }
        : { ...prev, image: { ...prev.image, defaultProvider: id } };
    });
  };

  return (
    <section className="container py-10 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* 标题区 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-11 w-11 items-center justify-center bg-celadon text-ink border-2 border-paper shadow-comic">
              <SettingsIcon className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="font-serif font-black text-2xl md:text-3xl text-paper">
                设置
              </h1>
              <p className="font-mono text-[10px] tracking-[0.3em] text-celadon uppercase mt-0.5">
                SETTINGS · API ACCESS
              </p>
            </div>
          </div>
          <p className="font-sans text-sm text-paper/70 leading-relaxed max-w-2xl">
            在这里接入你自己的大模型与图片生成 API。
            密钥保存于本地 <code className="font-mono text-celadon">data/db.json</code>，
            保存后会热重载，下次生成立即生效。
            {!user && " 请先登录后再修改配置。"}
          </p>
        </header>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 border-b-2 border-ink-line">
          <TabButton
            active={tab === "llm"}
            onClick={() => setTab("llm")}
            icon={<Cpu className="h-4 w-4" />}
            label="文本模型 (LLM)"
            count={LLM_PROVIDERS.length}
          />
          <TabButton
            active={tab === "image"}
            onClick={() => setTab("image")}
            icon={<Server className="h-4 w-4" />}
            label="图片生成"
            count={IMAGE_PROVIDERS.length}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-celadon" />
            <span className="font-mono text-xs text-paper/60 tracking-wider">
              LOADING CONFIG...
            </span>
          </div>
        )}

        {!loading && draft && group && groupMasked && (
          <>
            {/* 默认 Provider 选择 */}
            <div className="mb-6 border-2 border-ink-line bg-ink-soft shadow-comic p-5">
              <div className="flex items-center gap-2 mb-3">
                <Plug className="h-4 w-4 text-gold" />
                <h3 className="font-serif font-bold text-base text-paper">
                  默认 {tab === "llm" ? "文本模型" : "图片模型"}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <DefaultChip
                  active={group.defaultProvider === "auto"}
                  onClick={() => setDefaultProvider("auto")}
                >
                  自动 · 探测第一个可用
                </DefaultChip>
                {metas.map((m) => {
                  const cfg = group.providers[m.id];
                  const ok = cfg?.enabled && Boolean(cfg?.apiKey);
                  return (
                    <DefaultChip
                      key={m.id}
                      active={group.defaultProvider === m.id}
                      disabled={!ok}
                      onClick={() => ok && setDefaultProvider(m.id)}
                    >
                      {m.name}
                      {!ok && " · 未启用"}
                    </DefaultChip>
                  );
                })}
              </div>
              <p className="mt-3 font-mono text-[10px] text-paper/40">
                ⓘ 当前生效: {group.defaultProvider === "auto" ? "自动探测" : group.defaultProvider}
              </p>
            </div>

            {/* Provider 卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {metas.map((m) => {
                const cfg = group.providers[m.id];
                const saved = groupMasked.providers[m.id];
                if (!cfg) return null;
                const show = showKey[m.id];
                const result = testResult[m.id];
                const isTesting = testing === m.id;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "border-2 bg-ink-soft shadow-comic p-5 transition-all",
                      cfg.enabled
                        ? "border-celadon/60"
                        : "border-ink-line opacity-90",
                    )}
                  >
                    {/* 卡片头 */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-paper">
                            {m.name}
                          </h4>
                          {cfg.enabled ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] text-celadon border border-celadon/40 px-1.5 py-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" /> ENABLED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] text-paper/40 border border-ink-line px-1.5 py-0.5">
                              <XCircle className="h-2.5 w-2.5" /> DISABLED
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-sans text-xs text-paper/60 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                      {/* 启用开关 */}
                      <button
                        type="button"
                        onClick={() =>
                          updateProvider(m.id, "enabled", !cfg.enabled)
                        }
                        className={cn(
                          "shrink-0 inline-flex items-center justify-center h-6 w-11 border-2 transition-all",
                          cfg.enabled
                            ? "bg-celadon text-ink border-celadon"
                            : "bg-ink text-paper/40 border-ink-line",
                        )}
                        title={cfg.enabled ? "点击禁用" : "点击启用"}
                      >
                        <span
                          className={cn(
                            "h-3.5 w-3.5 bg-paper transition-transform",
                            cfg.enabled ? "translate-x-2" : "-translate-x-2",
                          )}
                        />
                      </button>
                    </div>

                    {/* 字段 */}
                    <div className="space-y-3">
                      {/* API Key */}
                      <FieldBlock
                        label="API Key"
                        icon={<Key className="h-3.5 w-3.5" />}
                        hint={
                          saved?.hasApiKey
                            ? `当前：${saved.apiKeyMasked}（留空则不修改）`
                            : "尚未配置"
                        }
                      >
                        <div className="flex gap-2">
                          <input
                            type={show ? "text" : "password"}
                            value={cfg.apiKey}
                            onChange={(e) =>
                              updateProvider(m.id, "apiKey", e.target.value)
                            }
                            placeholder={
                              saved?.hasApiKey ? "••••••••（不修改）" : m.keyPrefix
                                ? `${m.keyPrefix}xxxxxxxx`
                                : "粘贴 API Key"
                            }
                            className="flex-1 min-w-0 bg-ink border-2 border-ink-line px-3 py-2 font-mono text-xs text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowKey((s) => ({ ...s, [m.id]: !s[m.id] }))
                            }
                            className="shrink-0 inline-flex items-center justify-center h-9 w-9 border-2 border-ink-line text-paper/60 hover:text-paper hover:border-paper"
                            title={show ? "隐藏" : "显示"}
                          >
                            {show ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {m.keyUrl && (
                          <a
                            href={m.keyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-1.5 font-mono text-[10px] text-celadon hover:text-celadon-soft hover:underline"
                          >
                            ↗ 获取 API Key
                          </a>
                        )}
                      </FieldBlock>

                      {/* Model */}
                      <FieldBlock
                        label="Model"
                        icon={<Cpu className="h-3.5 w-3.5" />}
                      >
                        <input
                          type="text"
                          value={cfg.model}
                          onChange={(e) =>
                            updateProvider(m.id, "model", e.target.value)
                          }
                          className="w-full bg-ink border-2 border-ink-line px-3 py-2 font-mono text-xs text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon"
                        />
                      </FieldBlock>

                      {/* Base URL */}
                      <FieldBlock
                        label="Base URL"
                        icon={<Server className="h-3.5 w-3.5" />}
                      >
                        <input
                          type="text"
                          value={cfg.baseUrl}
                          onChange={(e) =>
                            updateProvider(m.id, "baseUrl", e.target.value)
                          }
                          placeholder="留空走 SDK 默认"
                          className="w-full bg-ink border-2 border-ink-line px-3 py-2 font-mono text-xs text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon"
                        />
                      </FieldBlock>
                    </div>

                    {/* 测试结果 */}
                    {result && (
                      <div
                        className={cn(
                          "mt-3 flex items-start gap-2 border-2 p-2.5",
                          result.ok
                            ? "border-celadon bg-celadon/5"
                            : "border-cinnabar bg-cinnabar/5",
                        )}
                      >
                        {result.ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-celadon shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-cinnabar shrink-0 mt-0.5" />
                        )}
                        <p
                          className={cn(
                            "font-sans text-xs leading-relaxed",
                            result.ok ? "text-celadon" : "text-cinnabar",
                          )}
                        >
                          {result.message}
                        </p>
                      </div>
                    )}

                    {/* 测试按钮 */}
                    {tab === "llm" && (
                      <button
                        type="button"
                        onClick={() => handleTest(m.id)}
                        disabled={isTesting || !cfg.enabled}
                        className={cn(
                          "mt-3 w-full inline-flex items-center justify-center gap-2 font-mono text-[10px] tracking-wider px-3 py-2 border-2 transition-all",
                          !cfg.enabled
                            ? "bg-ink text-paper/30 border-ink-line cursor-not-allowed"
                            : isTesting
                              ? "bg-ink text-celadon border-celadon cursor-wait"
                              : "bg-transparent text-celadon border-celadon hover:bg-celadon/10",
                        )}
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            TESTING...
                          </>
                        ) : (
                          <>
                            <Plug className="h-3 w-3" />
                            测试连通
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 全局错误/成功提示 */}
            {error && (
              <div className="mb-4 flex items-start gap-2 border-2 border-cinnabar bg-cinnabar/10 p-3">
                <AlertTriangle className="h-4 w-4 text-cinnabar flex-shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-cinnabar">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-start gap-2 border-2 border-celadon bg-celadon/10 p-3">
                <CheckCircle2 className="h-4 w-4 text-celadon flex-shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-celadon">{success}</p>
              </div>
            )}

            {/* 底部操作栏 */}
            <div className="sticky bottom-4 border-2 border-ink-line bg-ink-soft shadow-comic-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-[10px] text-paper/50 leading-relaxed">
                <p>ⓘ 密钥仅保存在本地 data/db.json，刷新即生效</p>
                <p className="text-paper/30 mt-0.5">
                  空白 Key 字段表示「不修改」；填入新值会覆盖原值
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting || saving}
                  className="inline-flex items-center gap-2 font-sans font-bold px-4 py-2.5 border-2 border-ink-line text-paper/70 hover:border-paper hover:text-paper transition-all disabled:opacity-50"
                >
                  {resetting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  重置默认
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "inline-flex items-center gap-2 font-sans font-bold px-5 py-2.5 border-2 transition-all",
                    saving
                      ? "bg-ink-soft text-paper/50 border-ink-line cursor-wait"
                      : "bg-celadon text-ink border-paper shadow-comic hover:bg-celadon-soft active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                  )}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" strokeWidth={2.5} />
                  )}
                  保存并热重载
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ============= 子组件 =============

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 -mb-0.5 border-b-2 font-sans font-bold text-sm transition-all",
        active
          ? "border-celadon text-celadon"
          : "border-transparent text-paper/50 hover:text-paper",
      )}
    >
      {icon}
      {label}
      <span className="font-mono text-[10px] text-paper/40">({count})</span>
    </button>
  );
}

function DefaultChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 font-sans text-xs transition-all",
        active
          ? "bg-cinnabar text-paper border-paper shadow-comic-sm"
          : disabled
            ? "bg-transparent text-paper/30 border-ink-line cursor-not-allowed"
            : "bg-transparent text-paper/70 border-ink-line hover:border-paper hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}

function FieldBlock({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-paper/40">{icon}</span>
        <span className="font-mono text-[10px] tracking-[0.15em] text-paper/60 uppercase">
          {label}
        </span>
      </div>
      {children}
      {hint && (
        <p className="mt-1 font-mono text-[9px] text-paper/40">{hint}</p>
      )}
    </div>
  );
}

// ============= 工具 =============

/** 把后端返回的脱敏视图转回 draft 形态：apiKey 留空（表示不修改） */
function maskedToDraft(m: AppSettingsMasked): AppSettings {
  const toGroup = (
    g: { defaultProvider: string; providers: Record<string, { enabled: boolean; apiKeyMasked: string; hasApiKey: boolean; model: string; baseUrl: string }> },
  ): ProviderGroupSettings => {
    const providers: Record<string, ProviderConfig> = {};
    for (const [id, cfg] of Object.entries(g.providers)) {
      providers[id] = {
        enabled: cfg.enabled,
        // 草稿中 apiKey 留空，提交时空字符串表示「不修改」
        apiKey: "",
        model: cfg.model,
        baseUrl: cfg.baseUrl,
      };
    }
    return { defaultProvider: g.defaultProvider, providers };
  };
  return {
    llm: toGroup(m.llm),
    image: toGroup(m.image),
  };
}

// UpdateSettingsRequest 与 AppSettings 同形
type _UpdateSettingsRequest = UpdateSettingsRequest;
