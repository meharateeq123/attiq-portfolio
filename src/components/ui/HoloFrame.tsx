import type { ReactNode } from "react";

/**
 * Bracketed holographic container. The corner ticks are drawn with borders on
 * four absolutely-positioned spans rather than an SVG, which keeps them crisp
 * at any size and costs nothing to render.
 */
export function HoloFrame({
  children,
  className = "",
  glow = false,
  corners = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  corners?: boolean;
}) {
  return (
    <div
      className={[
        "panel relative rounded-sm",
        glow ? "shadow-[0_0_60px_-24px_rgba(43,134,245,0.85)]" : "",
        className,
      ].join(" ")}
    >
      {corners && (
        <span aria-hidden>
          <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-[color:var(--cyan-300)]" />
          <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-[color:var(--cyan-300)]" />
          <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-[color:var(--cyan-300)]" />
          <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-[color:var(--cyan-300)]" />
        </span>
      )}
      {children}
    </div>
  );
}
