import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  Users,
  ArrowLeft,
  Save,
  Settings,
  Check,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useProjectStore, canEdit, setStepAndSave } from "@/store/projectStore";
import { useStudioStore } from "@/store/studioStore";
import StudioSidebar from "@/components/studio/StudioSidebar";
import ScriptStep from "@/components/studio/ScriptStep";
import StoryboardStep from "@/components/studio/StoryboardStep";
import CharacterStep from "@/components/studio/CharacterStep";
import RenderStep from "@/components/studio/RenderStep";
import MembersPanel from "@/components/project/MembersPanel";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const stepMeta: Record<
  string,
  { title: string; subtitle: string; eyebrow: string }
> = {
  script: {
    title: "AI 剧本生成",
    subtitle: "输入一句灵感，AI 三秒输出三幕式完整剧本",
    eyebrow: "STEP 01 · SCRIPT",
  },
  storyboard: {
    title: "分镜编辑",
    subtitle: "剧本自动拆解为分镜序列，可拖拽重排",
    eyebrow: "STEP 02 · STORYBOARD",
  },
  character: {
    title: "角色设定",
    subtitle: "AI 自动生成角色立绘、性格标签与对话风格",
    eyebrow: "STEP 03 · CHARACTER",
  },
  render: {
    title: "渲染成片",
    subtitle: "选中分镜一键渲染，自动配音字幕转场",
    eyebrow: "STEP 04 · RENDER",
  },
};

export default function Studio() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { project, loading, error, load, patch, saving, lastSavedAt } =
    useProjectStore();
  const { currentStep, setStep, setGeneratedScript, setScriptInput } =
    useStudioStore();
  const [membersOpen, setMembersOpen] = useState(false);

  // 加载项目
  useEffect(() => {
    if (!id) return;
    load(id);
    return () => useProjectStore.getState().reset();
  }, [id, load]);

  // 项目加载后，把 project.script 同步到本地 studio store
  // 这样 ScriptStep 等组件无需大改
  useEffect(() => {
    if (!project) return;
    setGeneratedScript(project.script ?? "");
    setScriptInput(project.script ? "" : "");
    setStep(project.currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (loading) {
    return (
      <section className="container py-24 flex flex-col items-center">
        <Loader2 className="h-6 w-6 animate-spin text-celadon" />
        <span className="mt-3 font-mono text-xs text-paper/60">加载项目…</span>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="container py-16">
        <div className="max-w-md mx-auto border-2 border-cinnabar bg-cinnabar/10 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-cinnabar mx-auto mb-3" />
          <h2 className="font-serif font-bold text-lg text-paper mb-2">
            项目无法访问
          </h2>
          <p className="font-sans text-sm text-paper/70 mb-5">
            {error ?? "项目不存在或你没有权限访问"}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 border-2 border-cinnabar text-cinnabar px-4 py-2 text-xs font-bold hover:bg-cinnabar/10"
          >
            <ArrowLeft className="h-3 w-3" /> 返回项目列表
          </Link>
        </div>
      </section>
    );
  }

  const meta = stepMeta[currentStep];
  const editable = canEdit(project, user?.id);
  const myMember = project.members.find((m) => m.userId === user?.id);

  const handleStepChange = async (step: typeof currentStep) => {
    setStep(step);
    if (id) await setStepAndSave(id, step);
  };

  const handleSaveScript = async (script: string) => {
    if (!id || !editable) return;
    try {
      await patch(id, { script });
    } catch {
      // 静默，setLocal 已有乐观更新
    }
  };

  const handleMembersUpdated = (p: Project) => {
    useProjectStore.setState({ project: p });
  };

  return (
    <section className="container py-8 md:py-12">
      {/* 项目头部 */}
      <div className="mb-6 pb-5 border-b-2 border-ink-line">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-paper/50 hover:text-paper mb-2"
            >
              <ArrowLeft className="h-3 w-3" /> 项目列表
            </Link>
            <h1 className="font-serif font-black text-2xl md:text-3xl text-paper leading-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-1 font-sans text-sm text-paper/60 line-clamp-1">
                {project.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {project.style && (
                <span className="font-mono text-[10px] text-celadon border border-celadon/40 px-2 py-0.5">
                  {project.style}
                </span>
              )}
              {myMember && (
                <span className="font-mono text-[10px] text-paper/60 border border-ink-line px-2 py-0.5">
                  你的角色：{myMember.role.toUpperCase()}
                </span>
              )}
              {!editable && (
                <span className="font-mono text-[10px] text-gold border border-gold/40 px-2 py-0.5">
                  只读模式（Viewer）
                </span>
              )}
              {saving ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-gold">
                  <Save className="h-3 w-3 animate-pulse" /> 保存中…
                </span>
              ) : lastSavedAt ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-celadon">
                  <Check className="h-3 w-3" /> 已自动保存
                </span>
              ) : null}
            </div>
          </div>

          {/* 顶部操作 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMembersOpen(true)}
              className="inline-flex items-center gap-2 border-2 border-ink-line hover:border-paper bg-ink-soft text-paper font-sans text-xs font-bold px-3 py-2 transition-all"
            >
              <Users className="h-3.5 w-3.5" />
              成员 ({project.members.length})
            </button>
            <Link
              to={`/projects/${project.id}/settings`}
              className={cn(
                "inline-flex items-center gap-2 border-2 border-ink-line bg-ink-soft text-paper font-sans text-xs font-bold px-3 py-2 hover:border-paper transition-all",
                !editable && "opacity-50 pointer-events-none",
              )}
              onClick={(e) => {
                // 暂时无 settings 页面，弹一个提示
                e.preventDefault();
                alert("项目设置页面即将上线");
              }}
            >
              <Settings className="h-3.5 w-3.5" />
              设置
            </Link>
          </div>
        </div>
      </div>

      {/* 当前步骤标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-celadon" />
          <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
            {meta.eyebrow}
          </span>
        </div>
        <h2 className="font-serif font-black text-xl md:text-2xl text-paper">
          {meta.title}
        </h2>
        <p className="mt-1 font-sans text-xs text-paper/60 max-w-2xl">
          {meta.subtitle}
        </p>
      </div>

      {/* 主体布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <StudioSidebar
          currentStep={currentStep}
          onChange={handleStepChange}
          editable={editable}
        />
        <div className="min-w-0">
          {currentStep === "script" && (
            <ScriptStep
              projectId={project.id}
              editable={editable}
              initialScript={project.script ?? ""}
              onSaveScript={handleSaveScript}
            />
          )}
          {currentStep === "storyboard" && <StoryboardStep />}
          {currentStep === "character" && <CharacterStep />}
          {currentStep === "render" && <RenderStep />}
        </div>
      </div>

      {/* 成员管理 */}
      {membersOpen && (
        <MembersPanel
          project={project}
          onClose={() => setMembersOpen(false)}
          onUpdated={handleMembersUpdated}
        />
      )}
    </section>
  );
}
