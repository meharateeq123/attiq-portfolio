"use client";

import {
  useLayoutEffect,
  useRef,
  type ComponentType,
  type ElementType,
  type HTMLAttributes,
  type Ref,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Variant = "up" | "fade" | "mask" | "scale" | "left";

const VARIANTS: Record<Variant, gsap.TweenVars> = {
  up: { y: 46, opacity: 0 },
  fade: { opacity: 0 },
  mask: { yPercent: 108, opacity: 1 },
  scale: { scale: 0.94, opacity: 0, transformOrigin: "50% 60%" },
  left: { x: -40, opacity: 0 },
};

/**
 * A polymorphic `as` prop collapses to `never` when TypeScript intersects every
 * possible element's props, so the chosen tag is cast to a permissive shape —
 * the only props we ever forward are className, ref and children.
 */
type PolymorphicTag = ComponentType<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;

/**
 * Scroll-triggered entrance. Wraps children and animates either the wrapper
 * itself or, when `stagger` is set, its direct children in sequence.
 *
 * Everything runs inside a gsap.context so a single revert() cleans up the
 * tweens, the ScrollTriggers, and the inline styles GSAP wrote.
 */
export function Reveal({
  children,
  as: asTag = "div",
  variant = "up",
  delay = 0,
  duration = 1.05,
  stagger,
  start = "top 86%",
  className,
  once = true,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  duration?: number;
  /** When set, animates direct children with this stagger instead of the wrapper. */
  stagger?: number;
  start?: string;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = asTag as PolymorphicTag;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, clearProps: "all" });
      gsap.set(Array.from(el.children), { opacity: 1, clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      const staggered = stagger !== undefined;
      const targets = staggered ? Array.from(el.children) : el;

      gsap.set(targets, { ...VARIANTS[variant] });
      // When the children are the ones animating, the wrapper still carries
      // opacity:0 from the [data-reveal] CSS and has to be cleared. When the
      // wrapper itself animates, doing that here would cancel its own fade.
      if (staggered) gsap.set(el, { opacity: 1 });

      gsap.to(targets, {
        y: 0,
        x: 0,
        yPercent: 0,
        scale: 1,
        opacity: 1,
        duration,
        delay,
        stagger: stagger ?? 0,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start, once, toggleActions: "play none none none" },
      });
    }, el);

    // Newly mounted triggers need a measure pass once layout settles.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, [variant, delay, duration, stagger, start, once]);

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
