import { Link } from "react-router-dom";
import type { ReactNode, MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

type Variant = "cinnabar" | "celadon" | "gold" | "paper" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  cinnabar:
    "bg-cinnabar text-paper border-paper hover:bg-cinnabar-dark shadow-comic hover:shadow-comic-celadon",
  celadon:
    "bg-celadon text-ink border-ink hover:bg-celadon-soft shadow-comic hover:shadow-comic-cinnabar",
  gold: "bg-gold text-ink border-ink hover:bg-gold-soft shadow-comic hover:shadow-comic-cinnabar",
  paper:
    "bg-paper text-ink border-ink hover:bg-paper/90 shadow-comic hover:shadow-comic-cinnabar",
  ghost:
    "bg-transparent text-paper border-paper/60 hover:border-paper hover:bg-paper/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

interface ButtonProps
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  to?: undefined;
  href?: undefined;
}

interface LinkProps extends BaseProps {
  to: string;
  href?: undefined;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

interface AnchorProps extends BaseProps {
  href: string;
  to?: undefined;
}

type ComicButtonProps =
  | ButtonProps
  | LinkProps
  | AnchorProps;

export default function ComicButton(props: ComicButtonProps) {
  const {
    variant = "cinnabar",
    size = "md",
    className,
    children,
  } = props;

  const cls = cn(
    "inline-flex items-center justify-center gap-2 font-sans font-bold tracking-wide border-2 transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer select-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if ("to" in props && props.to) {
    const { to, ...rest } = props as LinkProps;
    void rest;
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    const { href, ...rest } = props as AnchorProps;
    void rest;
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonProps;
  void _v; void _s; void _c; void _ch;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
