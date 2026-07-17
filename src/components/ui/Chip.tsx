import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  color?: "cinnabar" | "celadon" | "gold" | "paper" | "ink";
  onClick?: () => void;
  size?: "sm" | "md";
}

const colorMap = {
  cinnabar: "bg-cinnabar text-paper border-paper",
  celadon: "bg-celadon text-ink border-ink",
  gold: "bg-gold text-ink border-ink",
  paper: "bg-paper text-ink border-ink",
  ink: "bg-ink-soft text-paper border-ink-line",
};

export default function Chip({
  children,
  className,
  active = false,
  color = "ink",
  onClick,
  size = "md",
}: ChipProps) {
  const base = size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-xs";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1 border-2 font-sans font-bold tracking-wide transition-all duration-200",
        base,
        active ? colorMap[color] : "bg-transparent text-paper/60 border-ink-line hover:border-paper hover:text-paper",
        onClick && "cursor-pointer hover:shadow-comic-sm",
        className
      )}
    >
      {children}
    </button>
  );
}
