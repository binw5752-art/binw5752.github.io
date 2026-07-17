import { Link } from "react-router-dom";
import { Feather, Sparkles, ChevronDown, Play } from "lucide-react";
import { works } from "@/data/works";
import { img } from "@/lib/image";

const heroFrames = [
  img("Manga panel: lone warrior standing under red moon, dramatic silhouette, dark cinematic", "landscape_4_3"),
  img("Manga panel: night city street with neon reflections, mysterious atmosphere, halftone", "landscape_4_3"),
  img("Manga panel: close up of hand reaching glowing key, dramatic blue light", "landscape_4_3"),
  img("Manga panel: cyberpunk character portrait, neon rim light, intense expression", "landscape_4_3"),
  img("Manga panel: ancient Chinese pavilion in mist, ink wash painting style", "landscape_4_3"),
  img("Manga panel: futuristic robot silhouette against city skyline at sunset", "landscape_4_3"),
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* 背景网格分镜 */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 gap-2 opacity-30 pointer-events-none">
        {heroFrames.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-ink-soft border border-ink-line"
            style={{
              gridRow: i % 3 === 0 ? "span 2" : "auto",
              animation: `scale-in 0.8s ease-out ${i * 0.1}s both`,
            }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-60 grayscale-[40%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          </div>
        ))}
      </div>

      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

      {/* 内容 */}
      <div className="container relative z-10 pt-12 pb-20">
        <div className="max-w-4xl">
          {/* 装饰小标签 */}
          <div className="inline-flex items-center gap-2 mb-6 border-2 border-celadon bg-ink/70 backdrop-blur px-3 py-1.5 shadow-comic-celadon">
            <Sparkles className="h-3.5 w-3.5 text-celadon" />
            <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
              AI MOJING STUDIO
            </span>
          </div>

          {/* 巨型标题 */}
          <h1 className="font-serif font-black leading-[0.95] text-paper">
            <span className="block text-5xl md:text-7xl lg:text-8xl">
              一句灵感
            </span>
            <span className="block text-5xl md:text-7xl lg:text-8xl">
              <span className="text-cinnabar">一部</span>
              <span className="relative inline-block">
                <span className="relative z-10">漫剧</span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-celadon/30 -z-0" />
              </span>
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl mt-4 font-sans font-light tracking-wider text-paper/70">
              从剧本到成片，AI 一体化创作
            </span>
          </h1>

          {/* 描述 */}
          <p className="mt-8 max-w-2xl font-sans text-base md:text-lg text-paper/70 leading-relaxed">
            墨境 MOJING 是面向独立创作者与短剧团队的 AI 漫剧一体化平台。
            输入一句话，AI 副驾帮你完成剧本、分镜、角色立绘与成片渲染，
            让每个故事都能被画出来。
          </p>

          {/* CTA 按钮 */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/studio"
              className="group inline-flex items-center gap-3 bg-cinnabar text-paper font-sans text-base font-bold px-7 py-4 border-2 border-paper shadow-comic hover:shadow-comic-celadon hover:bg-cinnabar-dark transition-all"
            >
              <Feather className="h-5 w-5" strokeWidth={2.5} />
              立即开始创作
              <span className="ml-1 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 bg-transparent text-paper font-sans text-base font-bold px-7 py-4 border-2 border-paper/40 hover:border-paper hover:bg-paper/10 transition-all"
            >
              <Play className="h-4 w-4" />
              浏览作品库
            </Link>
          </div>

          {/* 装饰数据 */}
          <div className="mt-14 flex flex-wrap gap-8 md:gap-12">
            {[
              { n: "12,486", l: "AI 漫剧作品" },
              { n: "3,274", l: "活跃创作者" },
              { n: "8.6M", l: "累计播放" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col">
                <span className="font-mono font-bold text-2xl md:text-3xl text-gold">
                  {s.n}
                </span>
                <span className="font-sans text-xs text-paper/50 mt-1 tracking-wider">
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 滚动指示 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-paper/40">
        <span className="font-mono text-[10px] tracking-[0.3em]">SCROLL</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>

      {/* 装饰墨溅 */}
      <div className="absolute top-1/3 right-10 hidden lg:block pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-cinnabar opacity-60">
          <circle cx="40" cy="40" r="22" fill="currentColor" />
          <circle cx="62" cy="22" r="6" fill="currentColor" />
          <circle cx="18" cy="58" r="8" fill="currentColor" />
          <circle cx="58" cy="62" r="4" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
