import { Link } from "react-router-dom";
import { Feather, Sparkles } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { img } from "@/lib/image";

const showcaseImage = img(
  "Manga studio interface mockup with multiple panels and AI generation in progress, dark UI with red and cyan accents, ink wash aesthetic",
  "landscape_16_9"
);

export default function FinalCta() {
  const { ref } = useReveal();

  return (
    <section ref={ref} className="reveal container py-24 md:py-32">
      <div className="relative border-2 border-paper bg-ink-soft shadow-comic-lg overflow-hidden">
        {/* 背景大字 */}
        <div className="absolute -top-4 -right-8 pointer-events-none select-none">
          <span className="font-serif font-black text-[200px] leading-none text-paper/5">
            墨
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* 左侧文案 */}
          <div className="p-10 md:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-6 w-fit">
              <span className="h-px w-6 bg-celadon" />
              <Sparkles className="h-3.5 w-3.5 text-celadon" />
              <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
                START NOW
              </span>
            </div>

            <h2 className="font-serif font-black text-4xl md:text-5xl text-paper leading-tight">
              你的故事
              <br />
              <span className="text-cinnabar">该被画出来了</span>
            </h2>

            <p className="mt-6 font-sans text-base text-paper/70 leading-relaxed max-w-md">
              免费体验版每日 3 次生成额度，无需信用卡。
              创作者订阅版低至 ¥39/月，告别一切"我有想法但不会画"的遗憾。
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/studio"
                className="inline-flex items-center gap-2 bg-cinnabar text-paper font-sans text-base font-bold px-7 py-4 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
              >
                <Feather className="h-5 w-5" strokeWidth={2.5} />
                免费开始创作
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-transparent text-paper font-sans text-base font-bold px-7 py-4 border-2 border-paper/40 hover:border-paper hover:bg-paper/10 transition-all"
              >
                查看定价方案
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 text-paper/50">
              <span className="font-mono text-xs tracking-wider">★ 4.9 / 5</span>
              <span className="h-3 w-px bg-paper/30" />
              <span className="font-sans text-xs">已有 3,274 位创作者入驻</span>
            </div>
          </div>

          {/* 右侧画面 */}
          <div className="relative min-h-[320px] lg:min-h-[480px] border-t-2 lg:border-t-0 lg:border-l-2 border-paper/30 overflow-hidden">
            <img
              src={showcaseImage}
              alt="墨境工作台预览"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            {/* 装饰角标 */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-ink/80 backdrop-blur border border-celadon px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-celadon animate-pulse" />
              <span className="font-mono text-[10px] text-celadon tracking-wider">
                LIVE PREVIEW
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
