import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, ChevronDown, Sparkles, Feather, Crown } from "lucide-react";
import { pricePlans, faqs } from "@/data/site";
import { cn } from "@/lib/utils";

const planIcon = { free: Feather, creator: Sparkles, studio: Crown };

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [annual, setAnnual] = useState(false);

  return (
    <section className="container py-12 md:py-16">
      {/* 标题 */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-6 bg-gold" />
          <span className="font-mono text-xs tracking-[0.3em] text-gold uppercase">
            PRICING · 定价方案
          </span>
          <span className="h-px w-6 bg-gold" />
        </div>
        <h1 className="font-serif font-black text-4xl md:text-6xl text-paper leading-tight">
          选一个 <span className="text-gold">墨色</span>
          <br />
          画出你的故事
        </h1>
        <p className="mt-6 font-sans text-sm md:text-base text-paper/60 leading-relaxed">
          从免费体验到工作室协作，三种方案覆盖不同创作需求。
          所有方案均包含 AI 副驾与作品库发布能力。
        </p>

        {/* 月度/年度切换 */}
        <div className="mt-8 inline-flex items-center gap-1 p-1 border-2 border-ink-line bg-ink-soft">
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              "px-4 py-1.5 font-sans text-xs font-bold transition-colors",
              !annual ? "bg-cinnabar text-paper" : "text-paper/60 hover:text-paper"
            )}
          >
            按月付费
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              "px-4 py-1.5 font-sans text-xs font-bold transition-colors inline-flex items-center gap-1.5",
              annual ? "bg-cinnabar text-paper" : "text-paper/60 hover:text-paper"
            )}
          >
            按年付费
            <span className="font-mono text-[9px] bg-gold text-ink px-1 py-0.5">省 20%</span>
          </button>
        </div>
      </div>

      {/* 三档套餐 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
        {pricePlans.map((plan) => {
          const Icon = planIcon[plan.id as keyof typeof planIcon];
          const price = annual ? Math.floor(plan.price * 12 * 0.8) : plan.price;
          const period = annual ? "/ 年" : plan.period;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative border-2 bg-ink-soft p-6 md:p-8 transition-all",
                plan.highlight
                  ? "border-gold shadow-comic-lg md:-translate-y-4"
                  : "border-ink-line shadow-comic hover:border-paper hover:-translate-y-1"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-gold text-ink px-3 py-1 border-2 border-paper font-mono text-[10px] font-bold tracking-wider shadow-comic-sm">
                    <Crown className="h-3 w-3" />
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center border-2",
                    plan.highlight ? "bg-gold text-ink border-ink" : "bg-ink text-celadon border-celadon"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <h3 className="font-serif font-bold text-xl text-paper">
                  {plan.name}
                </h3>
              </div>

              <p className="font-sans text-xs text-paper/60 mb-5 min-h-[2.4em] leading-relaxed">
                {plan.tagline}
              </p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-mono font-bold text-4xl text-paper">
                  ¥{price}
                </span>
                <span className="font-sans text-xs text-paper/50">{period}</span>
              </div>

              <Link
                to="/studio"
                className={cn(
                  "block text-center w-full inline-flex items-center justify-center gap-2 font-sans font-bold px-5 py-3 border-2 transition-all",
                  plan.highlight
                    ? "bg-gold text-ink border-paper shadow-comic hover:shadow-comic-cinnabar hover:bg-gold-soft"
                    : plan.id === "free"
                    ? "bg-paper text-ink border-ink shadow-comic hover:shadow-comic-cinnabar"
                    : "bg-transparent text-paper border-paper/40 hover:border-paper hover:bg-paper/10"
                )}
              >
                {plan.cta}
              </Link>

              {/* 功能列表 */}
              <div className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-start gap-2">
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center border mt-0.5",
                        f.included
                          ? "bg-celadon text-ink border-celadon"
                          : "bg-ink text-paper/30 border-ink-line"
                      )}
                    >
                      {f.included ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={4} />
                      ) : (
                        <X className="h-2.5 w-2.5" strokeWidth={3} />
                      )}
                    </span>
                    <span
                      className={cn(
                        "font-sans text-xs",
                        f.included ? "text-paper/80" : "text-paper/30 line-through"
                      )}
                    >
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 功能矩阵 */}
      <div className="mb-20">
        <div className="mb-6">
          <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
            COMPARE · 详细对比
          </span>
          <h2 className="mt-3 font-serif font-black text-3xl text-paper">
            功能矩阵
          </h2>
        </div>
        <div className="border-2 border-ink-line bg-ink-soft shadow-comic overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-ink-line">
                <th className="text-left p-4 font-sans text-xs font-bold text-paper/70 tracking-wider">
                  功能
                </th>
                {pricePlans.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "p-4 font-serif font-bold text-sm text-center",
                      p.highlight ? "text-gold bg-gold/5" : "text-paper"
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["每日剧本生成", "3 次", "50 次", "无限"],
                ["单作品分镜帧数", "6 帧", "60 帧", "无限"],
                ["渲染画质", "标清", "高清", "4K"],
                ["作品水印", "带水印", "无", "无"],
                ["商用授权", "—", "✓", "✓"],
                ["角色立绘库", "10 个", "200 个", "无限"],
                ["专属 AI 模型", "—", "—", "✓"],
                ["批量生成 API", "—", "—", "✓"],
                ["团队协作席位", "1", "1", "10"],
                ["客户成功经理", "—", "—", "✓"],
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-ink-line/60 last:border-b-0 hover:bg-ink/40 transition-colors"
                >
                  <td className="p-4 font-sans text-xs text-paper/70">{row[0]}</td>
                  {row.slice(1).map((v, j) => (
                    <td
                      key={j}
                      className={cn(
                        "p-4 font-sans text-xs text-center",
                        pricePlans[j].highlight ? "bg-gold/5 text-gold font-bold" : "text-paper/70"
                      )}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="mb-6 text-center">
          <span className="font-mono text-xs tracking-[0.3em] text-celadon uppercase">
            FAQ · 常见问题
          </span>
          <h2 className="mt-3 font-serif font-black text-3xl text-paper">
            还有疑问？
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div
                key={i}
                className={cn(
                  "border-2 bg-ink-soft transition-colors",
                  open ? "border-celadon shadow-comic-sm" : "border-ink-line"
                )}
              >
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                >
                  <span className="font-serif font-bold text-sm text-paper">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-celadon transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 font-sans text-xs text-paper/70 leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
