"use client";

import { useCallback, useRef, type ReactNode, type PointerEvent } from "react";

/**
 * Pointer-reactive 3D tilt with a light that tracks the cursor.
 *
 * Transforms are written straight to the element's style rather than held in
 * state — a card that re-rendered on every pointer move would drop frames on
 * a grid of them. Touch devices are skipped entirely: there is no hover there,
 * and a tilt that only fires on tap reads as a glitch.
 */
export function TiltCard({
  children,
  className = "",
  max = 6,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-6px)`;
        if (glare) {
          el.style.setProperty("--gx", `${px * 100}%`);
          el.style.setProperty("--gy", `${py * 100}%`);
        }
      });
    },
    [max, glare],
  );

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-card ${className}`}
    >
      {glare && <span aria-hidden className="tilt-glare" />}
      {children}
    </div>
  );
}
