/**
 * 项目列表与创建
 * - 显示当前用户参与的所有项目
 * - 卡片视图：名称、风格、成员头像组、最后更新
 * - 顶部"新建项目"按钮，弹窗内创建
 * - URL 带 ?new=1 时自动弹窗
 */
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  FolderPlus,
  Users,
  Lock,
  Globe,
  Calendar,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import api, { ApiError } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import { scriptStyles } from "@/data/site";
import type { Project, CreateProjectRequest, ProjectVisibility } from "@/types";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ref, visible } = useReveal();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listProjects();
      setProjects(res.items ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ?new=1 自动打开创建弹窗
  const [createOpen, setCreateOpen] = useState(false);
  useEffect(() => {
    if (params.get("new") === "1") {
      setCreateOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const handleCreated = (p: Project) => {
    setProjects((arr) => [p, ...arr]);
    setCreateOpen(false);
    navigate(`/projects/${p.id}/studio`);
  };

  const myOwnedCount = useMemo(
    () => projects.filter((p) => p.ownerId === user?.id).length,
    [projects, user],
  );

  return (
    <section className="container py-12 md:py-16">
      {/* 标题区 */}
      <div ref={ref} className={cn("mb-8 reveal", visible && "is-visible")}>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-celadon" />
              <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
                WORKSPACE
              </span>
            </div>
            <h1 className="font-serif font-black text-3xl md:text-4xl text-paper">
              我的项目
            </h1>
            <p className="mt-2 font-sans text-sm text-paper/60">
              {user ? `欢迎回来，${user.username}` : "登录后即可创建并管理你的漫剧项目"}
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-cinnabar text-paper font-sans text-sm font-bold px-5 py-3 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
          >
            <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
            新建项目
          </button>
        </div>

        {/* 统计条 */}
        {user && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="参与项目" value={projects.length} />
            <Stat label="我创建的" value={myOwnedCount} />
            <Stat label="协作中" value={projects.filter((p) => p.members.length > 1).length} />
            <Stat label="今日额度" value="2 / 3" />
          </div>
        )}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-celadon" />
          <span className="ml-3 font-mono text-xs text-paper/60">加载项目…</span>
        </div>
      ) : error ? (
        <div className="border-2 border-cinnabar bg-cinnabar/10 p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-cinnabar mx-auto mb-2" />
          <p className="font-sans text-sm text-cinnabar">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-3 inline-flex items-center gap-2 border-2 border-cinnabar text-cinnabar px-4 py-2 text-xs font-bold hover:bg-cinnabar/10"
          >
            重试
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="border-2 border-dashed border-ink-line p-12 text-center">
          <Sparkles className="h-10 w-10 text-paper/30 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-paper mb-2">还没有项目</h3>
          <p className="font-sans text-sm text-paper/60 mb-6">
            创建你的第一个 AI 漫剧项目，开始三幕式剧本创作
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-cinnabar text-paper font-sans text-sm font-bold px-5 py-3 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
          >
            <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
            创建第一个项目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} currentUserId={user?.id ?? ""} />
          ))}
        </div>
      )}

      {/* 创建弹窗 */}
      {createOpen && (
        <CreateProjectModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-2 border-ink-line bg-ink-soft p-4">
      <p className="font-mono text-[10px] tracking-wider text-paper/50 uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif font-black text-2xl text-paper">{value}</p>
    </div>
  );
}

function ProjectCard({
  project,
  currentUserId,
}: {
  project: Project;
  currentUserId: string;
}) {
  const isOwner = project.ownerId === currentUserId;
  return (
    <Link
      to={`/projects/${project.id}/studio`}
      className="group block border-2 border-ink-line bg-ink-soft hover:border-paper hover:shadow-comic-celadon transition-all"
    >
      <div className="aspect-[16/9] bg-ink relative overflow-hidden border-b-2 border-ink-line">
        {project.cover ? (
          <img
            src={project.cover}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 bg-halftone bg-halftone-md opacity-30" />
        )}
        {/* 风格标签 */}
        {project.style && (
          <span className="absolute top-3 left-3 font-mono text-[10px] tracking-wider text-paper bg-ink/80 border border-paper/30 px-2 py-1">
            {project.style}
          </span>
        )}
        {/* 可见性 */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 font-mono text-[10px] text-paper bg-ink/80 border border-paper/30 px-2 py-1">
          {project.visibility === "private" ? (
            <>
              <Lock className="h-3 w-3" /> 私密
            </>
          ) : (
            <>
              <Globe className="h-3 w-3" /> 公开
            </>
          )}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif font-bold text-lg text-paper group-hover:text-cinnabar transition-colors line-clamp-1">
            {project.name}
          </h3>
          {isOwner && (
            <span className="font-mono text-[9px] tracking-wider text-cinnabar border border-cinnabar/40 px-1.5 py-0.5">
              OWNER
            </span>
          )}
        </div>
        <p className="font-sans text-xs text-paper/60 line-clamp-2 min-h-[2.4em]">
          {project.description || "暂无描述"}
        </p>

        <div className="mt-4 pt-3 border-t border-ink-line flex items-center justify-between">
          {/* 成员头像 */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((m) => (
                <span
                  key={m.userId}
                  className="inline-flex h-7 w-7 items-center justify-center bg-cinnabar text-paper font-serif font-black text-xs border-2 border-ink-soft"
                  title={`${m.username} · ${m.role}`}
                >
                  {m.username.slice(0, 1).toUpperCase()}
                </span>
              ))}
              {project.members.length > 4 && (
                <span className="inline-flex h-7 w-7 items-center justify-center bg-ink text-paper/80 font-mono text-[10px] border-2 border-ink-soft">
                  +{project.members.length - 4}
                </span>
              )}
            </div>
            <span className="ml-2 inline-flex items-center gap-1 font-mono text-[10px] text-paper/50">
              <Users className="h-3 w-3" />
              {project.members.length}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-paper/40">
            <Calendar className="h-3 w-3" />
            {new Date(project.updatedAt).toLocaleDateString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("悬疑推理");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("项目名称不能为空");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: CreateProjectRequest = {
        name: name.trim(),
        description: description.trim(),
        style,
        visibility,
      };
      const p = await api.createProject(body);
      onCreated(p);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-ink-deep/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 弹窗 */}
      <div className="relative w-full max-w-md border-2 border-paper bg-ink-soft shadow-comic-lg">
        {/* 顶部 */}
        <div className="flex items-center justify-between p-5 border-b-2 border-ink-line">
          <h3 className="font-serif font-black text-lg text-paper">新建项目</h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center border-2 border-ink-line hover:border-cinnabar hover:text-cinnabar text-paper"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <label className="block">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ 项目名称
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：雨夜来客"
              maxLength={40}
              autoFocus
              className="w-full bg-ink border-2 border-ink-line px-3 py-2.5 font-sans text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon"
            />
          </label>

          <label className="block">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ 简介（可选）
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="一句话描述你想创作的漫剧…"
              maxLength={200}
              className="w-full bg-ink border-2 border-ink-line px-3 py-2.5 font-sans text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon resize-none"
            />
          </label>

          <div>
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ 风格
            </span>
            <div className="flex flex-wrap gap-2">
              {scriptStyles.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "font-sans text-xs px-3 py-1.5 border-2 transition-all",
                    style === s
                      ? "bg-cinnabar text-paper border-paper"
                      : "bg-ink text-paper/70 border-ink-line hover:border-paper/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ 可见性
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["private", "public"] as ProjectVisibility[]).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "flex items-center justify-center gap-2 font-sans text-xs px-3 py-2 border-2 transition-all",
                    visibility === v
                      ? "bg-celadon text-ink border-paper"
                      : "bg-ink text-paper/70 border-ink-line hover:border-paper/40",
                  )}
                >
                  {v === "private" ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                  {v === "private" ? "私密" : "公开"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 border-2 border-cinnabar bg-cinnabar/10 p-3">
              <AlertTriangle className="h-4 w-4 text-cinnabar flex-shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-cinnabar">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-sans text-sm text-paper/70 border-2 border-ink-line hover:border-paper/40 px-4 py-2.5 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 font-sans text-sm font-bold px-4 py-2.5 border-2 transition-all",
                submitting
                  ? "bg-ink-soft text-paper/50 border-ink-line cursor-not-allowed"
                  : "bg-cinnabar text-paper border-paper shadow-comic hover:bg-cinnabar-dark",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  创建中…
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4" />
                  创建并进入
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
