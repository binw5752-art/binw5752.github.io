import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Feather, Loader2, Mail, Lock, User, AlertTriangle } from "lucide-react";
import { useAuth } from "@/store/auth";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export default function AuthPage({ mode }: { mode: Mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/projects";

  const [account, setAccount] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ account, password });
      } else {
        await register({ username, email, password });
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "请求失败";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-12 md:py-20">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 group"
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic rotate-[-6deg] group-hover:rotate-0 transition-transform">
              <Feather className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-serif font-black text-2xl text-paper tracking-wider">
              墨境
            </span>
          </Link>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-paper">
            {isLogin ? "登录创作账号" : "注册新账号"}
          </h1>
          <p className="mt-2 font-sans text-sm text-paper/60">
            {isLogin
              ? "登录后开始你的 AI 漫剧创作之旅"
              : "几个字段即可创建账号，加入墨境"}
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Field
                icon={<User className="h-4 w-4" />}
                label="用户名"
                value={username}
                onChange={setUsername}
                placeholder="2-20 个字符"
                autoComplete="username"
                required
              />
            )}

            {!isLogin && (
              <Field
                icon={<Mail className="h-4 w-4" />}
                label="邮箱"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            )}

            {isLogin && (
              <Field
                icon={<User className="h-4 w-4" />}
                label="账号"
                value={account}
                onChange={setAccount}
                placeholder="用户名或邮箱"
                autoComplete="username"
                required
              />
            )}

            <Field
              icon={<Lock className="h-4 w-4" />}
              label="密码"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={isLogin ? "你的密码" : "至少 6 位"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />

            {error && (
              <div className="flex items-start gap-2 border-2 border-cinnabar bg-cinnabar/10 p-3">
                <AlertTriangle className="h-4 w-4 text-cinnabar flex-shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-cinnabar">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 font-sans font-bold px-5 py-3 border-2 transition-all",
                submitting
                  ? "bg-ink-soft text-paper/50 border-ink-line cursor-not-allowed"
                  : "bg-cinnabar text-paper border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  处理中…
                </>
              ) : isLogin ? (
                "登录"
              ) : (
                "注册并登录"
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-5 pt-5 border-t-2 border-ink-line text-center">
            <p className="font-sans text-xs text-paper/60">
              {isLogin ? "还没有账号?" : "已有账号?"}{" "}
              <Link
                to={isLogin ? "/register" : "/login"}
                className="font-bold text-celadon hover:text-celadon-soft underline-offset-2 hover:underline"
              >
                {isLogin ? "立即注册" : "去登录"}
              </Link>
            </p>
          </div>
        </div>

        {/* 协议提示 */}
        <p className="mt-4 text-center font-mono text-[10px] text-paper/40 leading-relaxed">
          登录即代表同意《墨境用户协议》《隐私政策》
          <br />
          演示账号体系：明文存储于 data/db.json，仅用于本地测试
        </p>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
        ▸ {label.toUpperCase()}
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="w-full bg-ink border-2 border-ink-line pl-10 pr-3 py-2.5 font-sans text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon"
        />
      </div>
    </label>
  );
}
