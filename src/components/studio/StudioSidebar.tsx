import { PenLine, LayoutGrid, UserSquare, Clapperboard, Check, Lock } from "lucide-react";
import type { StudioStep } from "@/types";
import { cn } from "@/lib/utils";

const steps: { id: StudioStep; n: number; label: string; en: string; icon: typeof PenLine }[] = [
  { id: "script", n: 1, label: "剧本", en: "SCRIPT", icon: PenLine },
  { id: "storyboard", n: 2, label: "分镜", en: "STORYBOARD", icon: LayoutGrid },
  { id: "character", n: 3, label: "角色", en: "CHARACTER", icon: UserSquare },
  { id: "render", n: 4, label: "渲染", en: "RENDER", icon: Clapperboard },
];

interface Props {
  currentStep: StudioStep;
  onChange: (step: StudioStep) => void;
  /** 当前用户是否有编辑权限（false 时只读，无法切换步骤） */
  editable?: boolean;
}

export default function StudioSidebar({ currentStep, onChange, editable = true }: Props) {
  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-4">
        {/* 标题 */}
        <div className="mb-4 pb-4 border-b-2 border-dashed border-ink-line">
          <p className="font-mono text-[10px] tracking-[0.3em] text-celadon uppercase">
            WORKFLOW
          </p>
          <p className="font-serif font-bold text-base text-paper mt-1">
            创作四步走
          </p>
        </div>

        {/* 步骤 */}
        <div className="space-y-2">
          {steps.map((s, i) => {
            const active = currentStep === s.id;
            const done = i < currentIdx;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => editable && onChange(s.id)}
                disabled={!editable}
                className={cn(
                  "group w-full flex items-center gap-3 p-3 border-2 transition-all text-left",
                  active
                    ? "bg-cinnabar text-paper border-paper shadow-comic-sm"
                    : done
                    ? "bg-ink border-ink-line text-paper/70 hover:border-celadon"
                    : "bg-transparent border-ink-line text-paper/50 hover:border-paper hover:text-paper",
                  !editable && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 font-mono font-bold text-sm",
                    active
                      ? "bg-paper text-cinnabar border-paper"
                      : done
                      ? "bg-celadon text-ink border-celadon"
                      : "bg-ink text-paper/60 border-ink-line"
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : s.n}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-serif font-bold text-sm leading-tight">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "block font-mono text-[9px] tracking-[0.2em]",
                      active ? "text-paper/80" : "text-paper/40"
                    )}
                  >
                    {s.en}
                  </span>
                </span>
                {editable ? (
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-paper" : done ? "text-celadon" : "text-paper/40"
                    )}
                  />
                ) : (
                  <Lock className="h-3 w-3 shrink-0 text-paper/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* 提示 */}
        <div className="mt-4 p-3 border border-dashed border-celadon/40 bg-celadon/5">
          <p className="font-mono text-[10px] text-celadon tracking-wider mb-1">
            💡 TIP
          </p>
          <p className="font-sans text-xs text-paper/60 leading-relaxed">
            项目内容自动云端保存，所有协作者可见最新进度。
          </p>
        </div>
      </div>
    </aside>
  );
}
