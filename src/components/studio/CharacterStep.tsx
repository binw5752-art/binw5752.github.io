import { Plus, Sparkles } from "lucide-react";
import { useStudioStore } from "@/store/studioStore";
import { character } from "@/lib/image";

export default function CharacterStep() {
  const { characters, setStep } = useStudioStore();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-2 border-ink-line bg-ink-soft shadow-comic p-4">
        <div>
          <h3 className="font-serif font-bold text-base text-paper">角色档案</h3>
          <p className="font-sans text-xs text-paper/50 mt-0.5">
            AI 已为剧本生成 {characters.length} 位角色 · 可继续添加
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold text-ink font-sans font-bold px-4 py-2 border-2 border-paper shadow-comic-sm hover:shadow-comic hover:bg-gold-soft transition-all">
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          AI 创建角色
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map((c) => (
          <div
            key={c.id}
            className="group relative border-2 border-ink-line bg-ink-soft shadow-comic hover:border-paper hover:-translate-y-1 transition-all overflow-hidden"
          >
            {/* 装饰光晕 */}
            <div
              className="absolute top-0 right-0 h-32 w-32 opacity-20 blur-2xl"
              style={{ background: c.color }}
            />

            <div className="relative flex gap-4 p-4">
              {/* 头像 */}
              <div className="relative shrink-0">
                <div className="h-24 w-24 border-2 border-paper overflow-hidden bg-ink shadow-comic-sm">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 h-5 w-5 border-2 border-paper"
                  style={{ background: c.color }}
                />
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-lg text-paper">
                    {c.name}
                  </h4>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 border text-paper"
                    style={{ borderColor: c.color, color: c.color }}
                  >
                    {c.traits[0]}
                  </span>
                </div>
                <p className="mt-1 font-sans text-xs text-paper/60 leading-relaxed line-clamp-3">
                  {c.bio}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.traits.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-1.5 py-0.5 bg-ink border border-ink-line font-sans text-[10px] text-paper/70"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 性格雷达（占位） */}
            <div className="border-t-2 border-dashed border-ink-line p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-paper/40 tracking-wider">
                  PERSONALITY
                </span>
                <div className="flex gap-1">
                  {[80, 45, 90, 60].map((v, i) => (
                    <div key={i} className="h-1.5 w-8 bg-ink">
                      <div
                        className="h-full"
                        style={{ width: `${v}%`, background: c.color }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button className="font-sans text-[10px] text-celadon hover:underline">
                编辑 →
              </button>
            </div>
          </div>
        ))}

        {/* 添加新角色 */}
        <button className="border-2 border-dashed border-ink-line hover:border-gold hover:bg-gold/5 transition-all min-h-[180px] flex flex-col items-center justify-center gap-2 text-paper/40 hover:text-gold">
          <Plus className="h-8 w-8" />
          <span className="font-sans text-sm font-bold">新增角色</span>
          <span className="font-mono text-[10px]">AI 自动生成立绘与设定</span>
        </button>
      </div>

      {/* 下一步 */}
      <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-4 flex items-center justify-between">
        <div>
          <p className="font-serif font-bold text-sm text-paper">角色就绪</p>
          <p className="font-sans text-xs text-paper/50 mt-0.5">
            每个角色已绑定对话风格与立绘库
          </p>
        </div>
        <button
          onClick={() => setStep("render")}
          className="inline-flex items-center gap-2 bg-cinnabar text-paper font-sans font-bold px-5 py-2.5 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
        >
          进入渲染 →
        </button>
      </div>
    </div>
  );
}
