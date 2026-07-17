import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
  color?: "paper" | "cinnabar" | "celadon" | "gold";
}

const colorMap = {
  paper: "bg-paper text-ink border-ink",
  cinnabar: "bg-cinnabar text-paper border-paper",
  celadon: "bg-celadon text-ink border-ink",
  gold: "bg-gold text-ink border-ink",
};

export default function SpeechBubble({
  children,
  className,
  direction = "left",
  color = "paper",
}: SpeechBubbleProps) {
  return (
    <div
      className={cn(
        "relative inline-block px-4 py-2 border-2 font-sans text-sm font-medium shadow-comic-sm",
        colorMap[color],
        className
      )}
    >
      {children}
      <span
        className={cn(
          "absolute bottom-[-8px] h-3 w-3 border-2 rotate-45",
          colorMap[color],
          direction === "left" ? "left-4" : "right-4"
        )}
        style={{
          background: "inherit",
          borderColor: "inherit",
        }}
      />
    </div>
  );
}
