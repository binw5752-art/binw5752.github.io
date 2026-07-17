import { Link } from "react-router-dom";
import { Flame, PlayCircle } from "lucide-react";
import type { Work } from "@/types";
import { formatCount } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  work: Work;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-[180px]",
  md: "w-[260px]",
  lg: "w-full",
};

const categoryColor: Record<string, string> = {
  热血: "text-cinnabar border-cinnabar",
  治愈: "text-gold border-gold",
  悬疑: "text-celadon border-celadon",
  古风: "text-paper border-paper",
  科幻: "text-celadon-soft border-celadon",
  恋爱: "text-cinnabar-soft border-cinnabar-soft",
};

export default function WorkCard({ work, size = "md", className }: WorkCardProps) {
  return (
    <Link
      to={`/work/${work.id}`}
      className={cn(
        "group block shrink-0",
        sizeMap[size],
        className
      )}
    >
      <div className="relative border-2 border-ink-line bg-ink-soft shadow-comic overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-comic-lg group-hover:border-paper">
        {/* 封面 */}
        <div className="relative aspect-[4/5] overflow-hidden bg-ink">
          <img
            src={work.cover}
            alt={work.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 顶部叠加分类 */}
          <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
            <span
              className={cn(
                "inline-flex items-center bg-ink/85 backdrop-blur-sm border px-2 py-0.5 font-sans text-[10px] font-bold tracking-wider",
                categoryColor[work.category]
              )}
            >
              {work.category}
            </span>
            {work.trending === "up" && (
              <span className="inline-flex items-center bg-cinnabar text-paper px-1.5 py-0.5 font-mono text-[10px] font-bold border border-paper">
                HOT
              </span>
            )}
          </div>
          {/* 底部渐变 */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
          {/* 悬浮播放 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex h-12 w-12 items-center justify-center bg-cinnabar text-paper border-2 border-paper shadow-comic">
              <PlayCircle className="h-6 w-6" />
            </span>
          </div>
        </div>

        {/* 信息 */}
        <div className="p-3 space-y-2">
          <h3 className="font-serif font-bold text-base text-paper line-clamp-1 group-hover:text-cinnabar transition-colors">
            {work.title}
          </h3>
          <p className="font-sans text-xs text-paper/50 line-clamp-2 leading-relaxed min-h-[2.4em]">
            {work.synopsis}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-sans text-[10px] text-paper/40 truncate">
              {work.author}
            </span>
            <span className="inline-flex items-center gap-1 text-cinnabar font-mono text-[11px] font-bold">
              <Flame className="h-3 w-3" />
              {formatCount(work.heat)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
