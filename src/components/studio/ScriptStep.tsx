import { Sparkles, Loader2, Wand2, FileText, Square, Save, Lock } from "lucide-react";
import { useStudioStore } from "@/store/studioStore";
import { scriptStyles, scriptLengths, generateMockScript } from "@/data/site";
import Chip from "@/components/ui/Chip";
import { useSseStream } from "@/hooks/useSseStream";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  editable: boolean;
  initialScript: string;
  onSaveScript: (script: string) => void | Promise<void>;
}

export default function ScriptStep({
  editable,
  initialScript,
  onSaveScript,
}: Props) {
  const {
    scriptInput,
    selectedStyle,
    selectedLength,
    generatedScript,
    isGenerating,
    setScriptInput,
    setStyle,
    setLength,
    setGeneratedScript,
    setGenerating,
    setStep,
  } = useStudioStore();

  // SSE 流式输出 —— 真实调用后端 /api/ai/script/stream
  // 失败时回退到本地 Mock，保证 UI 始终可演示
  const { start, abort, content, meta, isStreaming } = useSseStream();

  const handleGenerate = async () => {
    if (!editable) return;
    setGenerating(true);
    setGeneratedScript("");

    try {
      const result = await start("/ai/script/stream", {
        theme: scriptInput,
        style: selectedStyle,
        length: selectedLength,
        stream: true,
      });

      if (result) {
        setGeneratedScript(result);
        // 生成完成后自动保存到项目
        await onSaveScript(result);
      } else {
        // 没收到任何 delta —— 兜底走 Mock
        const fallback = generateMockScript(
          scriptInput,
          selectedStyle,
          selectedLength,
        );
        setGeneratedScript(fallback);
        await onSaveScript(fallback);
      }
    } catch {
      // SSE 失败兜底
      const fallback = generateMockScript(
        scriptInput,
        selectedStyle,
        selectedLength,
      );
      setGeneratedScript(fallback);
      try {
        await onSaveScript(fallback);
      } catch {
        // 保存失败静默
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleAbort = () => {
    abort();
    if (content) {
      setGeneratedScript(content);
      void onSaveScript(content);
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!editable || !generatedScript) return;
    await onSaveScript(generatedScript);
  };

  // 标记是否已有初始内容（来自项目）
  const hasInitial = Boolean(initialScript) && !generatedScript;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* 输入面板 */}
      <div className="lg:col-span-2 space-y-5">
        <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-celadon" />
              <h3 className="font-serif font-bold text-base text-paper">
                灵感输入
              </h3>
            </div>
            {!editable && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] text-gold border border-gold/40 px-1.5 py-0.5">
                <Lock className="h-2.5 w-2.5" /> 只读
              </span>
            )}
          </div>

          {/* 文本输入 */}
          <label className="block">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ THEME / 主题
            </span>
            <textarea
              value={scriptInput}
              onChange={(e) => setScriptInput(e.target.value)}
              disabled={!editable}
              rows={5}
              placeholder="例如：一个被遗忘的少年，在某个雨夜捡到了不该属于这个世界的钥匙……"
              className="w-full bg-ink border-2 border-ink-line p-3 font-sans text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon resize-none disabled:opacity-50"
            />
          </label>

          {/* 风格选择 */}
          <div className="mt-5">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ STYLE / 风格
            </span>
            <div className="flex flex-wrap gap-2">
              {scriptStyles.map((s) => (
                <Chip
                  key={s}
                  active={selectedStyle === s}
                  color="cinnabar"
                  onClick={() => editable && setStyle(s)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          {/* 长度选择 */}
          <div className="mt-5">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-paper/60 mb-2">
              ▸ LENGTH / 长度
            </span>
            <div className="flex flex-wrap gap-2">
              {scriptLengths.map((l) => (
                <Chip
                  key={l}
                  active={selectedLength === l}
                  color="celadon"
                  onClick={() => editable && setLength(l)}
                >
                  {l}
                </Chip>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={isStreaming ? handleAbort : handleGenerate}
            disabled={!editable || (isGenerating && !isStreaming)}
            className={cn(
              "mt-6 w-full inline-flex items-center justify-center gap-2 font-sans font-bold px-5 py-3 border-2 transition-all",
              !editable
                ? "bg-ink-soft text-paper/30 border-ink-line cursor-not-allowed"
                : isStreaming
                  ? "bg-ink text-cinnabar border-cinnabar hover:bg-cinnabar/10"
                  : isGenerating
                    ? "bg-ink-soft text-paper/50 border-ink-line cursor-not-allowed"
                    : "bg-cinnabar text-paper border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            )}
          >
            {isStreaming ? (
              <>
                <Square className="h-4 w-4" strokeWidth={2.5} />
                停止生成
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 正在连接…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" strokeWidth={2.5} />
                {hasInitial ? "重新生成" : "生成剧本"}
              </>
            )}
          </button>

          <p className="mt-3 font-mono text-[10px] text-paper/40 text-center">
            每次生成消耗 1 次额度 · 今日剩余 2/3
          </p>
        </div>
      </div>

      {/* 输出面板 */}
      <div className="lg:col-span-3">
        <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-5 h-full min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h3 className="font-serif font-bold text-base text-paper">
                AI 剧本输出
              </h3>
              {meta?.provider && (
                <span className="font-mono text-[9px] tracking-wider text-celadon border border-celadon/40 px-1.5 py-0.5">
                  {meta.provider}
                  {meta.model ? ` · ${meta.model}` : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-paper/40">
                {selectedStyle} · {selectedLength}
              </span>
              {editable && generatedScript && !isStreaming && (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 border-2 border-celadon text-celadon px-2 py-1 font-mono text-[10px] hover:bg-celadon/10"
                >
                  <Save className="h-3 w-3" /> 保存
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 bg-ink border-2 border-ink-line p-4 overflow-y-auto reader-scroll">
            {!generatedScript && !isGenerating && !hasInitial && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
                <div className="h-12 w-12 border-2 border-dashed border-paper/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-paper/30" />
                </div>
                <p className="font-sans text-sm text-paper/40">
                  输入主题、选择风格后点击「生成剧本」
                </p>
                <p className="font-mono text-[10px] text-paper/30">
                  AI 将以流式输出三幕式剧本
                </p>
              </div>
            )}

            {/* 项目已有剧本（从初始内容恢复） */}
            {hasInitial && (
              <pre className="font-mono text-xs text-paper/85 leading-relaxed whitespace-pre-wrap break-words">
                {initialScript}
              </pre>
            )}

            {/* 流式期间实时显示 */}
            {isStreaming && !content && (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2.5 w-2.5 bg-celadon animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="font-mono text-xs text-celadon tracking-wider">
                  PARSING THEME · ANALYZING STYLE · COMPOSING ACTS…
                </p>
              </div>
            )}

            {(content || generatedScript) && (
              <pre className="font-mono text-xs text-paper/85 leading-relaxed whitespace-pre-wrap break-words">
                {isStreaming ? content : generatedScript}
                {isStreaming && <span className="typewriter-caret" />}
              </pre>
            )}
          </div>

          {/* 下一步按钮 */}
          {generatedScript && !isGenerating && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-sans text-xs text-paper/50">
                ✦ 剧本已生成，可进入分镜编辑
              </p>
              <button
                onClick={() => setStep("storyboard")}
                disabled={!editable}
                className="inline-flex items-center gap-2 bg-celadon text-ink font-sans font-bold px-4 py-2 border-2 border-paper shadow-comic-sm hover:shadow-comic hover:bg-celadon-soft transition-all disabled:opacity-50"
              >
                进入分镜 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
