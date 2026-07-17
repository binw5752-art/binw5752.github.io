import { Flame } from "lucide-react";
import { works } from "@/data/works";
import SectionTitle from "@/components/ui/SectionTitle";
import WorkCard from "@/components/shared/WorkCard";
import Marquee from "@/components/shared/Marquee";
import ComicButton from "@/components/ui/ComicButton";
import { useReveal } from "@/hooks/useReveal";

export default function HotWorks() {
  const { ref } = useReveal();
  const hot = [...works].sort((a, b) => b.heat - a.heat).slice(0, 8);

  return (
    <section ref={ref} className="reveal container py-24 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <SectionTitle
          eyebrow="TRENDING NOW"
          title={
            <>
              热门漫剧，<span className="text-cinnabar">正在燃烧</span>
            </>
          }
          subtitle="本周播放量最高的 8 部作品。每一部都由 AI 与人类创作者共同打造。"
        />
        <div className="hidden md:flex">
          <ComicButton to="/library" variant="ghost" size="md">
            查看全部作品 →
          </ComicButton>
        </div>
      </div>

      <Marquee className="mt-12">
        {hot.map((w) => (
          <div key={w.id} className="snap-start">
            <WorkCard work={w} size="md" />
          </div>
        ))}
      </Marquee>

      {/* 移动端入口 */}
      <div className="mt-8 md:hidden">
        <ComicButton to="/library" variant="ghost" size="md" className="w-full">
          查看全部作品 →
        </ComicButton>
      </div>

      {/* 底部装饰条 */}
      <div className="mt-16 border-t-2 border-dashed border-ink-line pt-6 flex items-center justify-between text-paper/40">
        <span className="font-mono text-xs tracking-widest">
          ▸ 数据更新于 2026.07.18 06:00
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-xs text-cinnabar">
          <Flame className="h-3 w-3" />
          实时热度
        </span>
      </div>
    </section>
  );
}
