import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Minus, Crown, Medal } from "lucide-react";
import { works, categories, getRankedWorks } from "@/data/works";
import type { WorkCategory } from "@/types";
import WorkCard from "@/components/shared/WorkCard";
import { formatCount } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

type Tab = "all" | WorkCategory;
type RankPeriod = "day" | "week" | "month";

export default function Library() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<RankPeriod>("week");

  const filtered = works.filter((w) => {
    const matchTab = tab === "all" || w.category === tab;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      w.title.toLowerCase().includes(q) ||
      w.author.toLowerCase().includes(q) ||
      w.synopsis.toLowerCase().includes(q) ||
      w.tags.some((t) => t.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  const ranked = getRankedWorks(period).slice(0, 3);

  return (
    <section className="container py-12 md:py-16">
      {/* 顶部标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-6 bg-cinnabar" />
          <span className="font-mono text-xs tracking-[0.3em] text-cinnabar uppercase">
            LIBRARY · 作品库
          </span>
        </div>
        <h1 className="font-serif font-black text-3xl md:text-5xl text-paper">
          探索 <span className="text-cinnabar">墨境宇宙</span>
        </h1>
        <p className="mt-3 font-sans text-sm text-paper/60 max-w-2xl">
          浏览由 AI 与人类创作者共同打造的漫剧作品。按风格筛选、按热度排序，发现你的下一个故事。
        </p>
      </div>

      {/* 搜索 + 标签 */}
      <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-4 md:p-5 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-paper/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索作品 / 作者 / 标签…"
              className="w-full bg-ink border-2 border-ink-line pl-10 pr-3 py-2.5 font-sans text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-celadon"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTab("all")}
              className={cn(
                "inline-flex items-center px-3 py-1.5 border-2 font-sans text-xs font-bold transition-all",
                tab === "all"
                  ? "bg-cinnabar text-paper border-paper"
                  : "bg-transparent text-paper/60 border-ink-line hover:border-paper hover:text-paper"
              )}
            >
              全部
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setTab(c.name)}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 border-2 font-sans text-xs font-bold transition-all",
                  tab === c.name
                    ? "bg-cinnabar text-paper border-paper shadow-comic-sm"
                    : "bg-transparent text-paper/60 border-ink-line hover:border-paper hover:text-paper"
                )}
                style={tab === c.name ? { backgroundColor: c.color, borderColor: "#F4EDE0" } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主体：左侧瀑布流 + 右侧排行榜 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* 瀑布流 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-paper/60 tracking-wider">
              ▸ {filtered.length} 部作品
              {tab !== "all" && ` · ${tab}`}
              {search && ` · 搜索「${search}」`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="border-2 border-dashed border-ink-line p-16 text-center">
              <p className="font-serif text-lg text-paper/60">没有找到匹配的作品</p>
              <p className="font-sans text-xs text-paper/40 mt-2">试试其他关键词或风格</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 xl:columns-3 gap-4 [column-fill:_balance]">
              {filtered.map((w, i) => (
                <div
                  key={w.id}
                  className="break-inside-avoid mb-4"
                  style={{ animation: `scale-in 0.5s ease-out ${i * 0.05}s both` }}
                >
                  <WorkCard work={w} size="lg" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 排行榜 */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div className="border-2 border-ink-line bg-ink-soft shadow-comic">
            <div className="flex items-center justify-between p-4 border-b-2 border-ink-line">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-gold" />
                <h3 className="font-serif font-bold text-base text-paper">热度榜</h3>
              </div>
              <div className="flex gap-0.5">
                {(["day", "week", "month"] as RankPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-2 py-0.5 font-mono text-[10px] tracking-wider transition-colors",
                      period === p
                        ? "bg-cinnabar text-paper"
                        : "text-paper/50 hover:text-paper"
                    )}
                  >
                    {p === "day" ? "日" : p === "week" ? "周" : "月"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {ranked.map((w, i) => {
                const TrendIcon =
                  w.trending === "up"
                    ? TrendingUp
                    : w.trending === "down"
                    ? TrendingDown
                    : Minus;
                const rankColor = i === 0 ? "text-gold" : i === 1 ? "text-paper" : "text-cinnabar-soft";
                return (
                  <Link
                    key={w.id}
                    to={`/work/${w.id}`}
                    className="group flex items-center gap-3 hover:bg-ink p-2 -mx-2 transition-colors"
                  >
                    <span className={cn(
                      "font-serif font-black text-3xl leading-none w-10 text-center",
                      rankColor
                    )}>
                      {i + 1}
                    </span>
                    <div className="relative h-14 w-12 shrink-0 border-2 border-paper/30 overflow-hidden">
                      <img src={w.cover} alt={w.title} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-sm text-paper truncate group-hover:text-cinnabar transition-colors">
                        {w.title}
                      </p>
                      <p className="font-sans text-[10px] text-paper/40 truncate mt-0.5">
                        {w.author}
                      </p>
                      <p className="inline-flex items-center gap-1 font-mono text-[11px] text-cinnabar mt-0.5">
                        <TrendIcon className={cn("h-3 w-3", w.trending === "down" && "rotate-180")} />
                        {formatCount(w.heat)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 分类入口 */}
          <div className="border-2 border-ink-line bg-ink-soft shadow-comic p-4">
            <div className="flex items-center gap-2 mb-3">
              <Medal className="h-4 w-4 text-celadon" />
              <h3 className="font-serif font-bold text-base text-paper">按风格浏览</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setTab(c.name)}
                  className="inline-flex items-center px-2.5 py-1 border font-sans text-xs font-bold transition-all"
                  style={{
                    color: tab === c.name ? "#0A0A0F" : c.color,
                    backgroundColor: tab === c.name ? c.color : "transparent",
                    borderColor: c.color,
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
