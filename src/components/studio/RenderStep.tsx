import { useEffect, useState } from "react";
import { Play, Loader2, Check, Download, Share2, Film } from "lucide-react";
import { useStudioStore } from "@/store/studioStore";
import { cn } from "@/lib/utils";

export default function RenderStep() {
  const { frames, renderProgress, setRenderProgress, reset } = useStudioStore();
  const [status, setStatus] = useState<"idle" | "rendering" | "done">("idle");

  useEffect(() => {
    if (status !== "rendering") return;
    let raf = 0;
    const start = performance.now();
    const dur = 3500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setRenderProgress(Math.floor(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setRenderProgress(100);
        setStatus("done");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, setRenderProgress]);

  const handleRender = () => {
    setStatus("rendering");
    setRenderProgress(0);
  };

  const handleReset = () => {
    setStatus("idle");
    setRenderProgress(0);
    reset();
  };

  const stages = [
    { label: "解析分镜", at: 20 },
    { label: "生成画面", at: 50 },
    { label: "合成配音", at: 75 },
    { label: "渲染成片", at: 100 },
  ];

  return (
    <div className="space-y-5">
      {/* 顶部条 */}
      <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="h-5 w-5 text-cinnabar" />
          <div>
            <h3 className="font-serif font-bold text-base text-paper">渲染成片</h3>
            <p className="font-sans text-xs text-paper/50 mt-0.5">
              {frames.length} 帧分镜 · 预计 1080P · 3 分 12 秒
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-celadon tracking-wider">
          {status === "idle" && "READY"}
          {status === "rendering" && "RENDERING…"}
          {status === "done" && "COMPLETED ✓"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左：预览 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-2 border-ink-line bg-ink-soft shadow-comic overflow-hidden">
            <div className="relative aspect-video bg-ink flex items-center justify-center">
              {status === "idle" && (
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic mb-3 mx-auto cursor-pointer hover:bg-cinnabar-dark transition-colors"
                    onClick={handleRender}
                  >
                    <Play className="h-7 w-7 ml-1" fill="currentColor" />
                  </div>
                  <p className="font-sans text-sm text-paper/60">点击开始渲染</p>
                </div>
              )}
              {status === "rendering" && (
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-celadon animate-spin mx-auto mb-3" />
                  <p className="font-mono text-xs text-celadon tracking-wider">
                    RENDERING FRAME {Math.min(frames.length, Math.ceil(renderProgress / (100 / frames.length)))}
                  </p>
                </div>
              )}
              {status === "done" && (
                <div className="relative w-full h-full">
                  <img
                    src={frames[0]?.imageUrl}
                    alt="成片预览"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40" />
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <span className="inline-flex h-16 w-16 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 ml-1" fill="currentColor" />
                    </span>
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-paper/30">
                      <div className="h-full bg-cinnabar w-1/3" />
                    </div>
                    <span className="font-mono text-[10px] text-paper">00:48 / 03:12</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 缩略图列表 */}
          <div>
            <p className="font-mono text-[10px] text-paper/60 tracking-wider mb-2">
              ▸ FRAME THUMBNAILS · {frames.length} 帧
            </p>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {frames.map((f, i) => (
                <div
                  key={f.id}
                  className={cn(
                    "relative aspect-[4/3] border-2 overflow-hidden",
                    status === "done" || (status === "rendering" && renderProgress > (i / frames.length) * 100)
                      ? "border-celadon"
                      : "border-ink-line"
                  )}
                >
                  <img src={f.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute top-0.5 left-0.5 bg-ink/80 px-1 font-mono text-[9px] text-paper">
                    {i + 1}
                  </span>
                  {status === "done" || (status === "rendering" && renderProgress > (i / frames.length) * 100) ? (
                    <span className="absolute top-0.5 right-0.5 inline-flex h-3 w-3 items-center justify-center bg-celadon text-ink">
                      <Check className="h-2 w-2" strokeWidth={4} />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右：状态 */}
        <div className="space-y-4">
          {/* 进度 */}
          <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-paper/70 tracking-wider">
                PROGRESS
              </span>
              <span className="font-mono text-2xl font-bold text-celadon tabular-nums">
                {renderProgress}%
              </span>
            </div>
            <div className="h-2 bg-ink border border-ink-line overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-celadon via-cinnabar to-gold transition-all duration-100"
                style={{ width: `${renderProgress}%` }}
              />
            </div>

            {/* 阶段 */}
            <div className="mt-4 space-y-2">
              {stages.map((s) => {
                const done = renderProgress >= s.at;
                const active = status === "rendering" && renderProgress >= s.at - 25 && renderProgress < s.at;
                return (
                  <div key={s.label} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 items-center justify-center border",
                        done
                          ? "bg-celadon border-celadon text-ink"
                          : active
                          ? "border-cinnabar text-cinnabar"
                          : "border-ink-line text-paper/30"
                      )}
                    >
                      {done && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                      {active && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                    </span>
                    <span className={cn(
                      "font-sans text-xs",
                      done ? "text-paper" : active ? "text-cinnabar" : "text-paper/40"
                    )}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            {status === "idle" && (
              <button
                onClick={handleRender}
                className="w-full inline-flex items-center justify-center gap-2 bg-cinnabar text-paper font-sans font-bold px-5 py-3 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
              >
                <Play className="h-4 w-4" fill="currentColor" />
                一键渲染成片
              </button>
            )}
            {status === "rendering" && (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 bg-ink-soft text-paper/50 font-sans font-bold px-5 py-3 border-2 border-ink-line cursor-not-allowed"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                渲染进行中…
              </button>
            )}
            {status === "done" && (
              <>
                <button className="w-full inline-flex items-center justify-center gap-2 bg-celadon text-ink font-sans font-bold px-5 py-3 border-2 border-paper shadow-comic hover:shadow-comic-cinnabar hover:bg-celadon-soft transition-all">
                  <Download className="h-4 w-4" strokeWidth={2.5} />
                  下载成片 MP4
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 bg-gold text-ink font-sans font-bold px-5 py-2.5 border-2 border-paper shadow-comic-sm hover:shadow-comic transition-all">
                  <Share2 className="h-4 w-4" strokeWidth={2.5} />
                  发布到作品库
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full font-sans text-xs text-paper/40 hover:text-cinnabar transition-colors py-2"
          >
            重置工作台
          </button>
        </div>
      </div>
    </div>
  );
}
