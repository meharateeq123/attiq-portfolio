"use client";

import {
  useLayoutEffect,
  useRef,
  type ComponentType,
  type ElementType,
  type HTMLAttributes,
  type Ref,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** See the note in Reveal: a polymorphic `as` needs a permissive prop shape. */
type PolymorphicTag = ComponentType<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;

/**
 * The site's headline treatment: stacked uppercase lines where the accent line
 * is filled with the blue gradient, revealed word by word from behind a mask.
 *
 * Words are split in markup rather than with SplitText so the heading stays
 * readable to search engines and screen readers — the visual split is purely
 * decorative and the accessible name comes from an sr-only copy.
 */
export function DisplayHeading({
  lines,
  accentFrom = 1,
  as: asTag = "h2",
  size = "display-lg",
  className = "",
  delay = 0,
  trigger = true,
}: {
  lines: readonly string[];
  /** Index of the first line rendered in the accent gradient. */
  accentFrom?: number;
  as?: ElementType;
  size?: "display-xl" | "display-lg" | "display-md";
  className?: string;
  delay?: number;
  /** False animates immediately on mount (the hero); true waits for scroll. */
  trigger?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = asTag as PolymorphicTag;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    if (!words.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 118, opacity: 0 });
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 1.25,
        delay,
        // Overlapping words read as one motion rather than a queue.
        stagger: 0.075,
        ease: "expo.out",
        ...(trigger ? { scrollTrigger: { trigger: el, start: "top 84%", once: true } } : {}),
      });
    }, el);

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, [delay, trigger]);

  return (
    <Tag ref={ref} className={`${size} ${className}`}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} className="block" aria-hidden="true">
            {words.map((word, wi) => (
              // The clip wrapper is what each word slides up from behind. Word
              // gaps are margins, not spaces: whitespace collapses next to an
              // inline-block and would run the words together.
              <span
                key={wi}
                className={[
                  "inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]",
                  wi < words.length - 1 ? "mr-[0.26em]" : "",
                ].join(" ")}
              >
                <span
                  data-word
                  className={[
                    "inline-block will-change-transform",
                    li >= accentFrom ? "text-grad" : "",
                  ].join(" ")}
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
