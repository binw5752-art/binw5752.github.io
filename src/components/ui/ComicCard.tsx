import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ComicCardProps {
  children: ReactNode;
  className?: string;
  border?: "paper" | "cinnabar" | "celadon" | "gold" | "ink";
  shadow?: "comic" | "comic-lg" | "comic-sm" | "none";
  hover?: boolean;
  onClick?: () => void;
}

const borderMap = {
  paper: "border-paper",
  cinnabar: "border-cinnabar",
  celadon: "border-celadon",
  gold: "border-gold",
  ink: "border-ink-line",
};

const shadowMap = {
  comic: "shadow-comic",
  "comic-lg": "shadow-comic-lg",
  "comic-sm": "shadow-comic-sm",
  none: "",
};

export default function ComicCard({
  children,
  className,
  border = "ink",
  shadow = "comic",
  hover = false,
  onClick,
}: ComicCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative border-2 bg-ink-soft",
        borderMap[border],
        shadowMap[shadow],
        hover &&
          "transition-all duration-200 hover:-translate-y-1 hover:shadow-comic-lg cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
