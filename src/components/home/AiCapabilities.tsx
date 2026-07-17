import {
  PenLine,
  LayoutGrid,
  UserSquare,
  Clapperboard,
  ArrowUpRight,
} from "lucide-react";
import { aiCapabilities } from "@/data/site";
import SectionTitle from "@/components/ui/SectionTitle";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

const iconMap = { PenLine, LayoutGrid, UserSquare, Clapperboard };

const accentMap = {
  cinnabar: {
    text: "text-cinnabar",
    border: "hover:border-cinnabar",
    bg: "bg-cinnabar/10",
    shadow: "hover:shadow-comic-cinnabar",
  },
  celadon: {
    text: "text-celadon",
    border: "hover:border-celadon",
    bg: "bg-celadon/10",
    shadow: "hover:shadow-comic-celadon",
  },
  gold: {
    text: "text-gold",
    border: "hover:border-gold",
    bg: "bg-gold/10",
    shadow: "hover:shadow-comic-gold",
  },
};

export default function AiCapabilities() {
  const { ref } = useReveal();

  return (
    <section ref={ref} className="reveal container py-24 md:py-32">
      <SectionTitle
        eyebrow="AI POWER"
        title={
          <>
            四大能力，<span className="text-celadon">让创作零门槛</span>
          </>
        }
        subtitle="从一句话到一部片，AI 副驾覆盖漫剧创作全链路。每个能力都可独立使用，亦可一键串起整条流水线。"
      />

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {aiCapabilities.map((cap, i) => {
          const Icon = iconMap[cap.icon as keyof typeof iconMap];
          const accent = accentMap[cap.accent];
          return (
            <div
              key={cap.id}
              className={cn(
                "group relative border-2 border-ink-line bg-ink-soft p-6 transition-all duration-300 hover:-translate-y-2",
                accent.border,
                accent.shadow,
                "shadow-comic"
              )}
              style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
            >
              {/* 编号 */}
              <span className="absolute top-3 right-4 font-mono text-5xl font-bold text-paper/5 group-hover:text-paper/10 transition-colors">
                0{i + 1}
              </span>

              {/* 图标 */}
              <div
                className={cn(
                  "inline-flex h-14 w-14 items-center justify-center border-2 mb-5",
                  accent.bg,
                  accent.text,
                  "border-current"
                )}
              >
                {Icon && <Icon className="h-6 w-6" strokeWidth={2} />}
              </div>

              <h3 className="font-serif font-bold text-xl text-paper mb-1">
                {cap.title}
              </h3>
              <p
                className={cn(
                  "font-mono text-[10px] tracking-[0.25em] mb-3",
                  accent.text
                )}
              >
                {cap.subtitle.toUpperCase()}
              </p>
              <p className="font-sans text-sm text-paper/60 leading-relaxed">
                {cap.desc}
              </p>

              <div className="mt-5 flex items-center gap-1 text-xs font-sans font-bold text-paper/40 group-hover:text-paper transition-colors">
                了解更多
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
