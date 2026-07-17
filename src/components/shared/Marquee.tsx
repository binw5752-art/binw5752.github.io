import { useRef } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

export default function Marquee({ children, className, speed = "normal" }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const duration = speed === "slow" ? 60 : speed === "fast" ? 25 : 40;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-4 reader-scroll"
          style={{ scrollbarWidth: "thin" }}
        >
          {children}
        </div>

        {/* 左右按钮 */}
        <button
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center bg-ink border-2 border-paper text-paper shadow-comic hover:bg-cinnabar transition-colors"
          aria-label="上一组"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center bg-ink border-2 border-paper text-paper shadow-comic hover:bg-cinnabar transition-colors"
          aria-label="下一组"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
