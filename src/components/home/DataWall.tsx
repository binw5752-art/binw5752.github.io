import { useEffect, useRef, useState } from "react";
import { platformStats } from "@/data/works";
import { useReveal } from "@/hooks/useReveal";
import { formatCount } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

const items = [
  { value: platformStats.works, label: "AI 漫剧作品", suffix: "", color: "text-cinnabar" },
  { value: platformStats.creators, label: "活跃创作者", suffix: "", color: "text-celadon" },
  { value: platformStats.plays, label: "累计播放量", suffix: "", color: "text-gold" },
  { value: platformStats.frames, label: "AI 生成分镜", suffix: "", color: "text-paper" },
];

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.3 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return { ref, inView };
}

function Counter({ target, inView }: { target: number; inView: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1800;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, inView]);
  return <>{formatCount(v)}</>;
}

export default function DataWall() {
  const { ref } = useReveal();
  const { ref: counterRef, inView } = useInView();

  return (
    <section ref={ref} className="reveal relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink-soft to-ink" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(244,237,224,1) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div ref={counterRef} className="container relative z-10 py-24 md:py-32">
        <div className="text-center mb-16">
          <span className="font-mono text-xs tracking-[0.4em] text-celadon uppercase">
            BY THE NUMBERS
          </span>
          <h2 className="mt-4 font-serif font-black text-3xl md:text-5xl text-paper">
            一年之间，<span className="text-cinnabar">墨已成境</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-line border-2 border-ink-line shadow-comic-lg">
          {items.map((it) => (
            <div
              key={it.label}
              className={cn(
                "bg-ink-soft p-8 md:p-10 flex flex-col items-center text-center transition-colors hover:bg-ink"
              )}
            >
              <span
                className={cn(
                  "font-mono font-bold text-3xl md:text-5xl tabular-nums",
                  it.color
                )}
              >
                <Counter target={it.value} inView={inView} />
              </span>
              <span className="mt-3 font-sans text-xs md:text-sm text-paper/60 tracking-wider">
                {it.label}
              </span>
              <span className="mt-2 h-px w-8 bg-current opacity-30" style={{ color: "currentColor" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
