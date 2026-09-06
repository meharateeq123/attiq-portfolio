"use client";

import type { ReactNode, MouseEvent } from "react";
import { useSmoothScroll } from "../layout/SmoothScroll";

type Props = {
  children: ReactNode;
  href: string;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  icon?: ReactNode;
  className?: string;
};

const SIZES = {
  sm: "px-4 py-2 text-[0.72rem]",
  md: "px-6 py-3.5 text-[0.78rem]",
};

/**
 * The site's one button. Anchors that point at a `#section` are handed to Lenis
 * so in-page jumps use the same eased motion as the rest of the scrolling
 * instead of the browser's instant jump.
 */
export function Button({ children, href, variant = "solid", size = "md", icon, className = "" }: Props) {
  const { scrollTo } = useSmoothScroll();
  const isAnchor = href.startsWith("#");
  const isExternal = href.startsWith("http");

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isAnchor) return;
    e.preventDefault();
    scrollTo(href);
  };

  const variants = {
    solid:
      "text-white border border-transparent bg-[linear-gradient(120deg,var(--blue-500),var(--blue-600))] shadow-[0_10px_34px_-12px_rgba(43,134,245,0.9)] hover:shadow-[0_14px_44px_-10px_rgba(43,134,245,1)]",
    outline:
      "text-text border border-[color:var(--line-hot)] bg-white/[0.02] hover:bg-[rgba(43,134,245,0.12)] hover:border-[color:var(--blue-400)]",
    ghost: "text-text-soft border border-transparent hover:text-white",
  };

  return (
    <a
      href={href}
      onClick={onClick}
      {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className={[
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-sm",
        "font-mono uppercase tracking-[0.16em] font-medium",
        "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
        "hover:-translate-y-0.5 active:translate-y-0",
        SIZES[size],
        variants[variant],
        className,
      ].join(" ")}
    >
      {/* Sheen that wipes across on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      {icon && (
        <span className="relative transition-transform duration-300 ease-out group-hover:translate-x-1">{icon}</span>
      )}
    </a>
  );
}
