"use client";

import type { ReactNode } from "react";
import { edgeMotifs } from "@/config/site";

/**
 * Shared section chrome: consistent vertical rhythm, the numbered eyebrow, a
 * top hairline, and the vertical micro-text running down the right edge.
 * Every section on the page goes through here so the spacing never drifts.
 */
export function Section({
  id,
  children,
  className = "",
  tone = "default",
}: {
  id: string;
  children: ReactNode;
  className?: string;
  /** `veil` dims the 3D layer behind dense copy; `clear` lets it show through. */
  tone?: "default" | "veil" | "clear";
}) {
  const motif = edgeMotifs[id];

  return (
    <section
      id={id}
      className={[
        "above relative w-full",
        // Extra right gutter at 2xl reserves room for the edge motif so it
        // never sits on top of the content column.
        "px-5 sm:px-8 lg:px-14 xl:px-20 2xl:pr-32",
        "py-24 sm:py-28 lg:py-36",
        // Kept deliberately translucent: the fixed 3D environment is meant to
        // stay visible through every section, not just the hero.
        tone === "veil" ? "bg-[rgba(3,5,11,0.62)]" : "",
        tone === "default" ? "bg-[rgba(3,5,11,0.4)]" : "",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--line),transparent)]" />

      {motif && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 select-none flex-col items-end gap-1 2xl:flex"
        >
          {motif.map((word) => (
            <span
              key={word}
              className="label-mono text-[0.58rem] leading-tight text-dim/70"
            >
              {word}
            </span>
          ))}
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </section>
  );
}

/** The `01 · SECTION NAME` eyebrow used at the top of each section. */
export function SectionIndex({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="eyebrow text-blue-400">{index}</span>
      <span className="h-px w-6 bg-[color:var(--line-hot)]" />
      <span className="eyebrow">{label}</span>
    </div>
  );
}
