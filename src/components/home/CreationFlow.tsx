import { MessageSquare, LayoutGrid, Users, Clapperboard } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: "01",
    title: "输入灵感",
    en: "INPUT",
    desc: "一句主题、一个氛围、一段对白。墨境 AI 从最少的输入中提取你的创作意图。",
    icon: MessageSquare,
    color: "cinnabar",
  },
  {
    n: "02",
    title: "生成剧本",
    en: "SCRIPT",
    desc: "AI 三秒输出三幕式完整剧本，自动埋设伏笔与反转，可一键扩展多版本。",
    icon: Clapperboard,
    color: "celadon",
  },
  {
    n: "03",
    title: "拆解分镜",
    en: "STORYBOARD",
    desc: "剧本自动拆为分镜序列，每帧画面、镜头角度、对白气泡就位，拖拽即可调整顺序。",
    icon: LayoutGrid,
    color: "gold",
  },
  {
    n: "04",
    title: "渲染成片",
    en: "RENDER",
    desc: "选中分镜一键渲染成片，自动配音、字幕、转场，直接发布到作品库与读者见面。",
    icon: Users,
    color: "cinnabar",
  },
];

const colorMap = {
  cinnabar: "border-cinnabar text-cinnabar bg-cinnabar/10",
  celadon: "border-celadon text-celadon bg-celadon/10",
  gold: "border-gold text-gold bg-gold/10",
};

export default function CreationFlow() {
  const { ref } = useReveal();

  return (
    <section ref={ref} className="reveal container py-24 md:py-32">
      <SectionTitle
        align="center"
        eyebrow="WORKFLOW"
        title={
          <>
            四步成片，<span className="text-celadon">零门槛</span>
          </>
        }
        subtitle="墨境把传统漫剧制作流程压缩到 4 步。从输入到成片，最快只需 15 分钟。"
        className="mx-auto"
      />

      <div className="mt-16 relative">
        {/* 对角线连接装饰 */}
        <div className="hidden lg:block absolute top-20 left-0 right-0 h-px">
          <svg className="w-full h-2" viewBox="0 0 100 2" preserveAspectRatio="none">
            <line
              x1="12" y1="1" x2="88" y2="1"
              stroke="#2A2A38"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className={cn(
                  "relative border-2 border-ink-line bg-ink-soft p-6 shadow-comic hover:-translate-y-1 transition-all duration-300",
                  "hover:border-paper"
                )}
                style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
              >
                {/* 大号数字徽章 */}
                <div className="absolute -top-5 -left-2">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-ink border-2 border-paper font-mono font-bold text-lg text-cinnabar shadow-comic-sm">
                    {s.n}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center border-2",
                      colorMap[s.color as keyof typeof colorMap]
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.3em] text-paper/40">
                    {s.en}
                  </span>
                </div>

                <h3 className="mt-5 font-serif font-bold text-xl text-paper">
                  {s.title}
                </h3>
                <p className="mt-3 font-sans text-sm text-paper/60 leading-relaxed">
                  {s.desc}
                </p>

                {/* 步骤箭头 */}
                {i < steps.length - 1 && (
                  <span className="hidden lg:block absolute top-1/2 -right-3 z-10 text-cinnabar text-2xl">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
