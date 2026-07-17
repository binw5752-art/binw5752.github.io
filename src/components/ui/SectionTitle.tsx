import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-3",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-8 bg-cinnabar" />
          <span className="font-mono text-xs tracking-[0.4em] text-cinnabar uppercase">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-cinnabar" />
        </div>
      )}
      <h2 className="font-serif font-black text-3xl md:text-5xl text-paper leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-sm md:text-base text-paper/60 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
